"""Learner Profile API Router.

Provides endpoints for inspecting and updating learner profile details,
managing academic and technical interests, and retrieving dashboard summaries.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.models.user import User
from app.models.learner_profile import LearnerProfile, Interest, InterestHistory
from app.models.skill import SkillEvaluation
from app.models.assessment import Assessment
from app.models.roadmap import LearningRoadmap
from app.schemas.profile import (
    LearnerProfileUpdate,
    LearnerProfileResponse,
    InterestCreate,
    InterestResponse,
    FullProfileResponse,
)
from app.core.security import get_current_user
from app.services.learner_service import get_unified_learner_profile

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def _get_or_create_profile(db: Session, user: User) -> LearnerProfile:
    """Retrieve user's learner profile or create a default one if absent."""
    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user.id).first()
    if not profile:
        profile = LearnerProfile(
            user_id=user.id,
            onboarding_step=1,
            onboarding_complete="false",
            current_technical_skills=[],
            previously_completed_courses=[],
            certifications=[],
            projects=[],
            work_experience=[],
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/me", response_model=FullProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full profile details including personal info, academic data, and interests."""
    profile = _get_or_create_profile(db, current_user)
    interests = (
        db.query(Interest)
        .filter(Interest.user_id == current_user.id)
        .order_by(Interest.created_at.asc())
        .all()
    )

    is_onboarding_done = profile.onboarding_complete.lower() == "true"

    return FullProfileResponse(
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        profile=LearnerProfileResponse.model_validate(profile),
        interests=[InterestResponse.model_validate(i) for i in interests],
        onboarding_complete=is_onboarding_done,
    )


@router.put("/me", response_model=LearnerProfileResponse)
@router.put("", response_model=LearnerProfileResponse)
@router.put("/", response_model=LearnerProfileResponse)
async def update_my_profile(
    profile_data: LearnerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update learner profile fields and optionally advance the onboarding step."""
    profile = _get_or_create_profile(db, current_user)
    update_dict = profile_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        if field == "onboarding_step" and value is not None:
            profile.onboarding_step = value
            # If final onboarding step reached, mark as complete
            if value >= 6:
                profile.onboarding_complete = "true"
        else:
            setattr(profile, field, value)

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    return LearnerProfileResponse.model_validate(profile)


@router.post("/interests", response_model=List[InterestResponse])
async def save_interests(
    data: InterestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save user interest selections, replacing any existing interests and logging changes."""
    existing_interests = (
        db.query(Interest).filter(Interest.user_id == current_user.id).all()
    )
    for ext in existing_interests:
        history = InterestHistory(
            interest_id=ext.id,
            action="removed",
            previous_value=ext.category,
        )
        db.add(history)
        db.delete(ext)
    db.flush()

    saved_interests = []
    primary = data.primary_category.strip().lower() if data.primary_category else None

    for category in data.categories:
        cat_clean = category.strip()
        if not cat_clean:
            continue
        is_primary = "true" if primary and cat_clean.lower() == primary else "false"

        interest = Interest(
            user_id=current_user.id,
            category=cat_clean,
            is_primary=is_primary,
            source=data.source,
            confidence=1.0,
        )
        db.add(interest)
        db.flush()

        history = InterestHistory(
            interest_id=interest.id,
            action="added",
            previous_value=None,
        )
        db.add(history)
        saved_interests.append(interest)

    db.commit()
    for item in saved_interests:
        db.refresh(item)

    return [InterestResponse.model_validate(item) for item in saved_interests]


@router.get("/interests", response_model=List[InterestResponse])
async def get_interests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve list of currently selected learner interests."""
    interests = (
        db.query(Interest)
        .filter(Interest.user_id == current_user.id)
        .order_by(Interest.created_at.asc())
        .all()
    )
    return [InterestResponse.model_validate(i) for i in interests]


@router.get("/unified-intelligence")
async def get_unified_intelligence_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the central, unified cognitive profile for the authenticated learner.

    This serves as the single source of truth for Dashboard, Skills, Career Matching,
    Roadmap, and AI Mentor.
    """
    return get_unified_learner_profile(db, current_user.id)


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve unified summary data for the learner dashboard."""
    unified = get_unified_learner_profile(db, current_user.id)
    profile = _get_or_create_profile(db, current_user)
    interests = (
        db.query(Interest)
        .filter(Interest.user_id == current_user.id)
        .order_by(Interest.created_at.asc())
        .all()
    )

    return {
        "profile": LearnerProfileResponse.model_validate(profile),
        "interests": [InterestResponse.model_validate(i) for i in interests],
        "skills_count": unified.get("stats", {}).get("skills_evaluated_count", 0),
        "assessments_count": unified.get("stats", {}).get("assessments_completed", 0),
        "roadmap_status": {
            "has_active_roadmap": unified.get("roadmap", {}).get("has_roadmap", False),
            "roadmap_id": unified.get("roadmap", {}).get("id"),
            "title": unified.get("roadmap", {}).get("title"),
            "overall_progress": unified.get("roadmap", {}).get("overall_progress", 0.0),
            "completed_modules": unified.get("roadmap", {}).get("completed_modules", 0),
            "total_modules": unified.get("roadmap", {}).get("total_modules", 0),
        },
        "onboarding_complete": profile.onboarding_complete.lower() == "true",
        "unified": unified,
    }
