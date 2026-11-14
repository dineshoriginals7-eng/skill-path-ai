from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class LearnerProfileUpdate(BaseModel):
    phone: Optional[str] = None
    bio: Optional[str] = None
    educational_qualification: Optional[str] = None
    college_or_university: Optional[str] = None
    academic_year: Optional[str] = None
    department: Optional[str] = None
    gpa_or_percentage: Optional[str] = None
    current_technical_skills: Optional[List[str]] = None
    previously_completed_courses: Optional[List[Any]] = None
    certifications: Optional[List[Any]] = None
    projects: Optional[List[Any]] = None
    work_experience: Optional[List[Any]] = None
    career_aspirations: Optional[str] = None
    primary_career_goal: Optional[str] = None
    target_career_role_id: Optional[str] = None
    onboarding_step: Optional[int] = None


class LearnerProfileResponse(BaseModel):
    id: str
    user_id: str
    phone: Optional[str]
    bio: Optional[str]
    educational_qualification: Optional[str]
    college_or_university: Optional[str]
    academic_year: Optional[str]
    department: Optional[str]
    gpa_or_percentage: Optional[str]
    current_technical_skills: Optional[List[str]]
    previously_completed_courses: Optional[List[Any]]
    certifications: Optional[List[Any]]
    projects: Optional[List[Any]]
    work_experience: Optional[List[Any]]
    career_aspirations: Optional[str]
    primary_career_goal: Optional[str]
    target_career_role_id: Optional[str]
    onboarding_step: int
    onboarding_complete: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterestCreate(BaseModel):
    categories: List[str] = Field(..., min_length=1)
    primary_category: Optional[str] = None
    source: str = "manual"


class InterestResponse(BaseModel):
    id: str
    category: str
    is_primary: str
    source: str
    confidence: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class FullProfileResponse(BaseModel):
    """Complete learner profile including all related data."""
    user_id: str
    full_name: str
    email: str
    profile: Optional[LearnerProfileResponse]
    interests: List[InterestResponse]
    onboarding_complete: bool
