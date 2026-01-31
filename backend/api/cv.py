from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
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
    DocumentParseResponse
)

router = APIRouter(prefix="/api/cv", tags=["CV"])



def create_version_snapshot(db: Session, cv: CV, user_id: int, change_summary: str = None, version_name: str = None) -> CVVersion:
    """Helper function to create a version snapshot of current CV state"""
    # Get the next version number for this CV
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


@router.post("/parse-document", response_model=DocumentParseResponse)
async def parse_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Parse an uploaded document (PDF, DOCX, TXT) and extract CV information.
    Returns structured data that can be used to populate CV fields.
    """
    # Validate file type
    allowed_extensions = {'pdf', 'docx', 'doc', 'txt'}
    file_ext = file.filename.lower().split('.')[-1] if file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file_ext}. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )
    
    try:
        # Parse the document
        parsed_data = document_parser.parse_document(content, file.filename)
        return DocumentParseResponse(**parsed_data.to_dict())
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Missing dependency: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse document: {str(e)}"
        )


@router.post("/generate-content", response_model=AIGeneratedContent)
async def generate_cv_content(
    request: AIPromptRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate CV content from AI prompt
    """
    try:
        cv_data = await ai_service.generate_cv_content(request.prompt)
        return cv_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )


@router.post("/", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
async def create_cv(
    cv_data: CVCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new CV for the current user
    """
    try:
        print(f"Creating CV for user {current_user.id}")
        print(f"CV Data: title={cv_data.title}, template={cv_data.template}")
        
        cv = CV(
            user_id=current_user.id,
            **cv_data.dict()
        )
        db.add(cv)
        db.commit()
        db.refresh(cv)
        
        print(f"CV created successfully with ID: {cv.id}")
        return cv
    except Exception as e:
        print(f"Error creating CV: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create CV: {str(e)}"
        )


@router.get("/", response_model=List[CVResponse])
async def get_user_cvs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all CVs for the current user
    """
    cvs = db.query(CV).filter(CV.user_id == current_user.id).all()
    return cvs


@router.get("/{cv_id}", response_model=CVResponse)
async def get_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific CV by ID
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
    
    return cv


@router.put("/{cv_id}", response_model=CVResponse)
async def update_cv(
    cv_id: int,
    cv_data: CVUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a CV (automatically creates a version snapshot before updating)
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
    
    # Create a version snapshot BEFORE updating (Google Docs style)
    create_version_snapshot(
        db=db,
        cv=cv,
        user_id=current_user.id,
        change_summary="Auto-saved before edit"
    )
    
    # Update only provided fields
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
    """
    Delete a CV
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
    
    db.delete(cv)
    db.commit()
    return None


@router.post("/{cv_id}/job-suggestions", response_model=JobSuggestionResponse)
async def get_job_suggestions(
    cv_id: int,
    request: JobSuggestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered suggestions for tailoring a CV to a specific job description
    """
    # Fetch the CV
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Prepare CV data for AI analysis
    cv_data = {
        "full_name": cv.full_name or "",
        "summary": cv.summary or "",
        "experience": cv.experience or "",
        "education": cv.education or "",
        "skills": cv.skills or "",
    }
    
    try:
        suggestions = await ai_service.generate_job_suggestions(
            cv_data=cv_data,
            job_description=request.job_description
        )
        return suggestions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggestions: {str(e)}"
        )


# ============ Version History Endpoints ============

@router.get("/{cv_id}/versions", response_model=List[CVVersionListItem])
async def get_cv_versions(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all versions of a CV (version history like Google Docs)
    """
    # Verify CV ownership
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Get all versions ordered by version number (newest first)
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
    """
    Get a specific version of a CV with full content
    """
    # Verify CV ownership
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Get the specific version
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
    """
    Manually create a named version (like "Save as new version" in Google Docs)
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
    
    # Create a new version with the provided name
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
    """
    Restore a CV to a previous version (creates a new version with current state first)
    """
    # Verify CV ownership
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Get the version to restore
    version_to_restore = db.query(CVVersion).filter(
        CVVersion.id == version_id,
        CVVersion.cv_id == cv_id
    ).first()
    
    if not version_to_restore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # First, save current state as a version (so user can undo the restore)
    current_version = create_version_snapshot(
        db=db,
        cv=cv,
        user_id=current_user.id,
        change_summary=f"Before restoring to version {version_to_restore.version_number}"
    )
    
    # Now restore the CV to the selected version
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
    """
    Delete a specific version (optional cleanup)
    """
    # Verify CV ownership
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Get the version to delete
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
