import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..database import get_db
from ..models.user import User
from ..models.cv import CV
from ..models.cv_version import CVVersion
from ..utils.auth import get_current_user
from ..services.ai_service import ai_service
from ..services.document_parser import document_parser
from .cv_schemas import (
    CVCreate, CVUpdate, CVResponse,
    AIPromptRequest, AIGeneratedContent,
    JobSuggestionRequest, JobSuggestionResponse,
    CVVersionListItem, CVVersionDetail, CVVersionCreate, CVVersionRestore,
    DocumentParseResponse,
    CVReviewResponse
)

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/cv", tags=["CV"])


def create_version_snapshot(db: Session, cv: CV, user_id: int, change_summary: str = None, version_name: str = None) -> CVVersion:
    """Helper function to create a version snapshot of current CV state"""
    max_version = db.query(func.max(CVVersion.version_number)).filter(
        CVVersion.cv_id == cv.id
    ).scalar() or 0

    version = CVVersion(
        cv_id=cv.id,
        version_number=max_version + 1,
        version_name=version_name,
        change_summary=change_summary or "Auto-saved version",
        title=cv.title,
        template=cv.template,
        full_name=cv.full_name,
        email=cv.email,
        phone=cv.phone,
        location=cv.location,
        summary=cv.summary,
        experience=cv.experience,
        education=cv.education,
        skills=cv.skills,
        projects=cv.projects,
        research=cv.research,
        ai_prompt=cv.ai_prompt,
        created_by_id=user_id
    )
    db.add(version)
    return version


ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Magic bytes for file type validation
FILE_SIGNATURES = {
    'pdf': b'%PDF',
    'docx': b'PK',
    'doc': b'\xd0\xcf\x11\xe0',
}


def _validate_file_magic(content: bytes, extension: str) -> bool:
    """Validate file content matches expected magic bytes for the claimed extension."""
    if extension == 'txt':
        try:
            content[:1024].decode('utf-8')
            return True
        except (UnicodeDecodeError, ValueError):
            return False
    signature = FILE_SIGNATURES.get(extension)
    if signature:
        return content[:len(signature)] == signature
    return True


def _sanitize_filename(filename: str) -> str:
    """Strip path separators and limit filename length."""
    if not filename:
        return "unknown"
    name = filename.replace('\\', '/').split('/')[-1]
    return name[:255]


@router.post("/parse-document", response_model=DocumentParseResponse)
@limiter.limit("10/minute")
async def parse_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Parse an uploaded document (PDF, DOCX, TXT) and extract CV information.
    Returns structured data that can be used to populate CV fields.
    """
    safe_filename = _sanitize_filename(file.filename)
    file_ext = safe_filename.lower().rsplit('.', 1)[-1] if '.' in safe_filename else ''

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )

    if not _validate_file_magic(content, file_ext):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match the expected format for the given extension."
        )

    try:
        parsed_data = document_parser.parse_document(content, safe_filename)
        parsed_data = await document_parser.enhance_with_ai(parsed_data, document_parser.text)

        result = parsed_data.to_dict()
        result["ai_enhanced"] = parsed_data.confidence_scores.get("ai_enhanced", 0) == 1.0
        return DocumentParseResponse(**result)
    except ImportError:
        logger.error("Missing dependency for document parsing")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A required library for document parsing is not installed."
        )
    except Exception as e:
        logger.error("Document parsing failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse the uploaded document. Please try a different file."
        )


@router.post("/generate-content", response_model=AIGeneratedContent)
@limiter.limit("5/minute")
async def generate_cv_content(
    request: Request,
    prompt_request: AIPromptRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate CV content from AI prompt"""
    try:
        cv_data = await ai_service.generate_cv_content(prompt_request.prompt)
        return cv_data
    except Exception as e:
        logger.error("AI content generation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate CV content. Please try again."
        )


@router.post("/", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
async def create_cv(
    cv_data: CVCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new CV for the current user"""
    try:
        cv = CV(
            user_id=current_user.id,
            **cv_data.dict()
        )
        db.add(cv)
        db.commit()
        db.refresh(cv)
        logger.info("CV %d created for user %d", cv.id, current_user.id)
        return cv
    except Exception as e:
        logger.error("CV creation failed for user %d: %s", current_user.id, e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create CV. Please try again."
        )


@router.get("/", response_model=List[CVResponse])
async def get_user_cvs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all CVs for the current user"""
    cvs = db.query(CV).filter(CV.user_id == current_user.id).all()
    return cvs


@router.get("/{cv_id}", response_model=CVResponse)
async def get_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific CV by ID"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    return cv


@router.put("/{cv_id}", response_model=CVResponse)
async def update_cv(
    cv_id: int,
    cv_data: CVUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a CV (automatically creates a version snapshot before updating)"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    create_version_snapshot(
        db=db,
        cv=cv,
        user_id=current_user.id,
        change_summary="Auto-saved before edit"
    )

    for field, value in cv_data.dict(exclude_unset=True).items():
        setattr(cv, field, value)

    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a CV"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    db.delete(cv)
    db.commit()
    return None


@router.post("/{cv_id}/job-suggestions", response_model=JobSuggestionResponse)
@limiter.limit("5/minute")
async def get_job_suggestions(
    cv_id: int,
    request: Request,
    suggestion_request: JobSuggestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered suggestions for tailoring a CV to a specific job description"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    def _format_for_ai(data):
        if isinstance(data, list):
            return json.dumps(data, indent=2)
        return data or ""

    cv_data = {
        "full_name": cv.full_name or "",
        "summary": cv.summary or "",
        "experience": _format_for_ai(cv.experience),
        "education": _format_for_ai(cv.education),
        "skills": _format_for_ai(cv.skills),
    }

    try:
        suggestions = await ai_service.generate_job_suggestions(
            cv_data=cv_data,
            job_description=suggestion_request.job_description
        )
        return suggestions
    except Exception as e:
        logger.error("Job suggestion generation failed for CV %d: %s", cv_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate job suggestions. Please try again."
        )


@router.post("/{cv_id}/review", response_model=CVReviewResponse)
@limiter.limit("5/minute")
async def review_cv(
    cv_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a recruiter-perspective review of a CV: ATS optimization,
    achievement quantification, and tailoring analysis.
    """
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    def _format_for_ai(data):
        if isinstance(data, list):
            return json.dumps(data, indent=2)
        return data or ""

    cv_data = {
        "full_name": cv.full_name or "",
        "summary": cv.summary or "",
        "experience": _format_for_ai(cv.experience),
        "education": _format_for_ai(cv.education),
        "skills": _format_for_ai(cv.skills),
        "projects": _format_for_ai(cv.projects),
        "research": _format_for_ai(cv.research),
    }

    try:
        review = await ai_service.review_cv(cv_data=cv_data)
        return review
    except Exception as e:
        logger.error("CV review failed for CV %d: %s", cv_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to review CV. Please try again."
        )


# ============ Version History Endpoints ============

@router.get("/{cv_id}/versions", response_model=List[CVVersionListItem])
async def get_cv_versions(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all versions of a CV (version history like Google Docs)"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    versions = db.query(CVVersion).filter(
        CVVersion.cv_id == cv_id
    ).order_by(CVVersion.version_number.desc()).all()

    return versions


@router.get("/{cv_id}/versions/{version_id}", response_model=CVVersionDetail)
async def get_cv_version(
    cv_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific version of a CV with full content"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    version = db.query(CVVersion).filter(
        CVVersion.id == version_id,
        CVVersion.cv_id == cv_id
    ).first()

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )

    return version


@router.post("/{cv_id}/versions", response_model=CVVersionListItem)
async def create_named_version(
    cv_id: int,
    version_data: CVVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually create a named version (like "Save as new version" in Google Docs)"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    version = create_version_snapshot(
        db=db,
        cv=cv,
        user_id=current_user.id,
        version_name=version_data.version_name,
        change_summary=version_data.change_summary or "Manual save"
    )

    db.commit()
    db.refresh(version)

    return version


@router.post("/{cv_id}/versions/{version_id}/restore", response_model=CVVersionRestore)
async def restore_cv_version(
    cv_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Restore a CV to a previous version (creates a new version with current state first)"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    version_to_restore = db.query(CVVersion).filter(
        CVVersion.id == version_id,
        CVVersion.cv_id == cv_id
    ).first()

    if not version_to_restore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )

    current_version = create_version_snapshot(
        db=db,
        cv=cv,
        user_id=current_user.id,
        change_summary=f"Before restoring to version {version_to_restore.version_number}"
    )

    cv.title = version_to_restore.title
    cv.template = version_to_restore.template
    cv.full_name = version_to_restore.full_name
    cv.email = version_to_restore.email
    cv.phone = version_to_restore.phone
    cv.location = version_to_restore.location
    cv.summary = version_to_restore.summary
    cv.experience = version_to_restore.experience
    cv.education = version_to_restore.education
    cv.skills = version_to_restore.skills
    cv.projects = version_to_restore.projects
    cv.research = version_to_restore.research
    cv.ai_prompt = version_to_restore.ai_prompt

    db.commit()
    db.refresh(current_version)

    return CVVersionRestore(
        message=f"Successfully restored to version {version_to_restore.version_number}",
        restored_version=version_to_restore.version_number,
        new_version_created=current_version.version_number
    )


@router.delete("/{cv_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cv_version(
    cv_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific version (optional cleanup)"""
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    version = db.query(CVVersion).filter(
        CVVersion.id == version_id,
        CVVersion.cv_id == cv_id
    ).first()

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )

    db.delete(version)
    db.commit()

    return None
