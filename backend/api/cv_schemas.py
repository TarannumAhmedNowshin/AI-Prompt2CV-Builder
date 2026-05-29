from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import json


class AIPromptRequest(BaseModel):
    """Request model for AI prompt"""
    prompt: str = Field(..., min_length=10, max_length=5000)


# ============ Canonical Structured Item Models ============

class ExperienceItem(BaseModel):
    job_title: str = Field("", max_length=200)
    employer: str = Field("", max_length=200)
    location: str = Field("", max_length=200)
    start_date: str = Field("", max_length=20)
    end_date: str = Field("", max_length=20)
    description: str = Field("", max_length=5000)
    link: str = Field("", max_length=500)
    is_visible: bool = True


class EducationItem(BaseModel):
    school: str = Field("", max_length=200)
    degree: str = Field("", max_length=200)
    field: str = Field("", max_length=200)
    start_date: str = Field("", max_length=20)
    end_date: str = Field("", max_length=20)
    location: str = Field("", max_length=200)
    description: str = Field("", max_length=3000)
    gpa: str = Field("", max_length=20)
    link: str = Field("", max_length=500)
    is_visible: bool = True


class SkillItem(BaseModel):
    name: str = Field("", max_length=100)
    level: str = Field("", max_length=20)


class ProjectItem(BaseModel):
    name: str = Field("", max_length=200)
    description: str = Field("", max_length=3000)
    technologies: str = Field("", max_length=500)
    start_date: str = Field("", max_length=20)
    end_date: str = Field("", max_length=20)
    link: str = Field("", max_length=500)
    is_visible: bool = True


class ResearchItem(BaseModel):
    title: str = Field("", max_length=300)
    publisher: str = Field("", max_length=200)
    authors: str = Field("", max_length=500)
    date: str = Field("", max_length=20)
    description: str = Field("", max_length=3000)
    link: str = Field("", max_length=500)
    is_visible: bool = True


# ============ CV Schemas ============

def _parse_legacy_text(v):
    """Convert legacy TEXT strings to empty list for backward compatibility"""
    if v is None:
        return None
    if isinstance(v, str):
        if not v.strip():
            return None
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass
        return []
    return v


class CVBase(BaseModel):
    """Base CV schema"""
    title: str = Field(..., min_length=1, max_length=255)
    template: str = Field(..., pattern="^(modern|classic|executive|minimal)$")
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = Field(None, max_length=254)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=200)
    summary: Optional[str] = Field(None, max_length=5000)
    experience: Optional[list[ExperienceItem]] = None
    education: Optional[list[EducationItem]] = None
    skills: Optional[list[SkillItem]] = None
    projects: Optional[list[ProjectItem]] = None
    research: Optional[list[ResearchItem]] = None
    ai_prompt: Optional[str] = Field(None, max_length=5000)


class CVCreate(CVBase):
    """Schema for creating a CV"""
    pass


class CVUpdate(BaseModel):
    """Schema for updating a CV"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    template: Optional[str] = Field(None, pattern="^(modern|classic|executive|minimal)$")
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = Field(None, max_length=254)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=200)
    summary: Optional[str] = Field(None, max_length=5000)
    experience: Optional[list[ExperienceItem]] = None
    education: Optional[list[EducationItem]] = None
    skills: Optional[list[SkillItem]] = None
    projects: Optional[list[ProjectItem]] = None
    research: Optional[list[ResearchItem]] = None
    ai_prompt: Optional[str] = Field(None, max_length=5000)


class CVResponse(CVBase):
    """Schema for CV response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    @field_validator('experience', 'education', 'skills', 'projects', 'research', mode='before')
    @classmethod
    def handle_legacy_text(cls, v):
        return _parse_legacy_text(v)

    class Config:
        from_attributes = True


class AIGeneratedContent(BaseModel):
    """Response model for AI-generated content"""
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    experience: list[ExperienceItem] = []
    education: list[EducationItem] = []
    skills: list[SkillItem] = []
    projects: list[ProjectItem] = []
    research: list[ResearchItem] = []


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
    experience: Optional[list[ExperienceItem]] = None
    education: Optional[list[EducationItem]] = None
    skills: Optional[list[SkillItem]] = None
    projects: Optional[list[ProjectItem]] = None
    research: Optional[list[ResearchItem]] = None
    ai_prompt: Optional[str] = None

    @field_validator('experience', 'education', 'skills', 'projects', 'research', mode='before')
    @classmethod
    def handle_legacy_text(cls, v):
        return _parse_legacy_text(v)

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
    school: str = ""
    degree: str = ""
    field: str = ""
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
    name: str = ""
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
    ai_enhanced: bool = False


# ============ CV Review Schemas ============

class WeakBulletItem(BaseModel):
    """A vague bullet point with a suggested improvement"""
    original: str = ""
    improved: str = ""


class ATSOptimization(BaseModel):
    """ATS compatibility analysis"""
    score: int = Field(0, ge=0, le=100)
    formatting_issues: list[str] = []
    missing_sections: list[str] = []
    recommendations: list[str] = []


class AchievementQuantification(BaseModel):
    """Achievement quantification analysis"""
    score: int = Field(0, ge=0, le=100)
    weak_bullets: list[WeakBulletItem] = []
    strong_bullets: list[str] = []
    recommendations: list[str] = []


class TailoringAnalysis(BaseModel):
    """CV tailoring quality analysis"""
    score: int = Field(0, ge=0, le=100)
    generic_phrases: list[str] = []
    recommendations: list[str] = []


class CVReviewResponse(BaseModel):
    """Full CV review response"""
    overall_score: int = Field(0, ge=0, le=100)
    ats_optimization: ATSOptimization = ATSOptimization()
    achievement_quantification: AchievementQuantification = AchievementQuantification()
    tailoring: TailoringAnalysis = TailoringAnalysis()
    summary_feedback: str = ""
    top_priorities: list[str] = []
