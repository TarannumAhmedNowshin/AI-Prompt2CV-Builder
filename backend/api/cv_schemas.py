from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AIPromptRequest(BaseModel):
    """Request model for AI prompt"""
    prompt: str = Field(..., min_length=10, max_length=5000)


class CVBase(BaseModel):
    """Base CV schema"""
    title: str = Field(..., min_length=1, max_length=255)
    template: str = Field(..., pattern="^(modern|classic)$")
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    ai_prompt: Optional[str] = None


class CVCreate(CVBase):
    """Schema for creating a CV"""
    pass


class CVUpdate(BaseModel):
    """Schema for updating a CV"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    template: Optional[str] = Field(None, pattern="^(modern|classic)$")
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    ai_prompt: Optional[str] = None


class CVResponse(CVBase):
    """Schema for CV response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AIGeneratedContent(BaseModel):
    """Response model for AI-generated content"""
    full_name: str
    email: str
    phone: str
    location: str
    summary: str
    experience: str
    education: str
    skills: str
