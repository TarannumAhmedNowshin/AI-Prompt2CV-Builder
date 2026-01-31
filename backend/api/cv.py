from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.cv import CV
from ..utils.auth import get_current_user
from ..services.ai_service import ai_service
from .cv_schemas import (
    CVCreate, CVUpdate, CVResponse, 
    AIPromptRequest, AIGeneratedContent,
    JobSuggestionRequest, JobSuggestionResponse
)

router = APIRouter(prefix="/api/cv", tags=["CV"])


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
    Update a CV
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
