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
    projects: Optional[str] = None
    research: Optional[str] = None
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
    projects: Optional[str] = None
    research: Optional[str] = None
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


class JobSuggestionRequest(BaseModel):
    """Request model for job description suggestions"""
    job_description: str = Field(..., min_length=20, max_length=10000)


class JobSuggestionResponse(BaseModel):
    """Response model for job-tailored suggestions"""
    match_score: int = Field(..., ge=0, le=100)
    summary_suggestions: str
    skills_to_highlight: list[str]
    skills_to_add: list[str]
    experience_suggestions: str
    keywords_to_include: list[str]
    overall_recommendations: list[str]
    strengths: str
    gaps: str


# ============ Version History Schemas ============

class CVVersionBase(BaseModel):
    """Base schema for CV version"""
    version_number: int
    version_name: Optional[str] = None
    change_summary: Optional[str] = None
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class CVVersionListItem(CVVersionBase):
    """Schema for version list item (lightweight)"""
    id: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class CVVersionDetail(CVVersionBase):
    """Schema for full version details with snapshot data"""
    id: int
    cv_id: int
    title: str
    template: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    ai_prompt: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class CVVersionCreate(BaseModel):
    """Schema for creating a named version"""
    version_name: Optional[str] = Field(None, max_length=255)
    change_summary: Optional[str] = Field(None, max_length=500)


class CVVersionRestore(BaseModel):
    """Schema for restore response"""
    message: str
    restored_version: int
    new_version_created: int


# ============ Document Parsing Schemas ============

class ParsedEducationItem(BaseModel):
    """Parsed education entry"""
    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""
    description: str = ""


class ParsedExperienceItem(BaseModel):
    """Parsed experience entry"""
    job_title: str = ""
    employer: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class ParsedProjectItem(BaseModel):
    """Parsed project entry"""
    title: str = ""
    technologies: str = ""
    description: str = ""
    link: str = ""


class ParsedSkillItem(BaseModel):
    """Parsed skill entry"""
    name: str = ""
    category: str = "Other"


class DocumentParseResponse(BaseModel):
    """Response model for document parsing"""
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    website: str = ""
    summary: str = ""
    experience: list[ParsedExperienceItem] = []
    education: list[ParsedEducationItem] = []
    skills: list[ParsedSkillItem] = []
    projects: list[ParsedProjectItem] = []
    confidence_scores: dict[str, float] = {}
