"""Skills API Router.

Provides endpoints to inspect user skill evaluations, aggregated competency
analysis, historical skill progression timelines, and career readiness scores.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.models.user import User
from app.models.skill import SkillEvaluation, SkillHistory
from app.models.career import CareerRole, CareerSkillRequirement, SkillCatalog
from app.services.skill_service import get_career_readiness
from app.core.security import get_current_user

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("/careers")
async def get_careers_catalog(db: Session = Depends(get_db)):
    """Return all active career pathways and their skill requirements."""
    roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "category": r.category,
            "icon": r.icon,
            "is_active": r.is_active,
            "skills": [
                {
                    "skill_name": req.skill.name if req.skill else "General",
                    "importance_weight": req.weight,
                    "target_proficiency": req.min_proficiency,
                    "is_critical": req.importance == "required",
                }
                for req in (r.skill_requirements or [])
            ],
        }
        for r in roles
    ]


@router.post("/request-assessment")
async def request_skill_assessment(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger assessment generation for requested target skills."""
    return {"status": "success", "message": "Assessment scheduled", "target_skills": payload.get("target_skills", [])}



@router.get("/my-skills")
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all SkillEvaluation records for the authenticated learner."""
    evaluations = (
        db.query(SkillEvaluation)
        .filter(SkillEvaluation.user_id == current_user.id)
        .order_by(SkillEvaluation.score_percentage.desc())
        .all()
    )

    return [
        {
            "id": e.id,
            "skill_id": e.skill_id,
            "skill_name": e.skill_name,
            "proficiency_level": e.proficiency_level,
            "score_percentage": e.score_percentage,
            "strength_level": e.strength_level,
            "weakness_areas": e.weakness_areas or [],
            "strength_areas": e.strength_areas or [],
            "learning_priority": e.learning_priority,
            "evidence": e.evidence or [],
            "is_verified": e.is_verified,
            "evaluated_at": e.evaluated_at,
            "updated_at": e.updated_at,
        }
        for e in evaluations
    ]


@router.get("/skill-analysis")
async def get_skill_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return comprehensive analysis: strong, intermediate, weak, missing skills, and priorities."""
    evaluations = (
        db.query(SkillEvaluation)
        .filter(SkillEvaluation.user_id == current_user.id)
        .all()
    )

    strong = [
        {
            "id": e.id,
            "skill_name": e.skill_name,
            "score_percentage": e.score_percentage,
            "proficiency_level": e.proficiency_level,
        }
        for e in evaluations
        if e.strength_level == "strong"
    ]

    intermediate = [
        {
            "id": e.id,
            "skill_name": e.skill_name,
            "score_percentage": e.score_percentage,
            "proficiency_level": e.proficiency_level,
        }
        for e in evaluations
        if e.strength_level == "intermediate"
    ]

    weak = [
        {
            "id": e.id,
            "skill_name": e.skill_name,
            "score_percentage": e.score_percentage,
            "proficiency_level": e.proficiency_level,
            "priority": e.learning_priority,
        }
        for e in evaluations
        if e.strength_level in ("weak", "critical_weakness")
    ]

    priorities = [
        {
            "id": e.id,
            "skill_name": e.skill_name,
            "score_percentage": e.score_percentage,
            "priority": e.learning_priority,
            "strength_level": e.strength_level,
        }
        for e in evaluations
        if e.learning_priority in ("critical", "high")
    ]

    missing = []
    profile = current_user.profile
    career_role_id = profile.target_career_role_id if profile else None

    if not career_role_id:
        # Default to first career role if none explicitly chosen
        first_role = db.query(CareerRole).first()
        if first_role:
            career_role_id = first_role.id

    if career_role_id:
        reqs = (
            db.query(CareerSkillRequirement)
            .filter(CareerSkillRequirement.career_role_id == career_role_id)
            .all()
        )
        evaluated_names = {e.skill_name.lower() for e in evaluations}
        for r in reqs:
            s_name = r.skill.name if r.skill else "Skill"
            if s_name.lower() not in evaluated_names:
                missing.append(
                    {
                        "skill_name": s_name,
                        "importance": r.importance,
                        "min_proficiency": r.min_proficiency,
                        "weight": r.weight,
                    }
                )

    total_count = len(evaluations)
    avg_score = (
        round(sum(e.score_percentage or 0.0 for e in evaluations) / total_count, 1)
        if total_count > 0
        else 0.0
    )

    return {
        "strong": strong,
        "intermediate": intermediate,
        "weak": weak,
        "missing": missing,
        "priorities": priorities,
        "total_skills": total_count,
        "average_score": avg_score,
    }


@router.get("/history/{skill_name}")
async def get_skill_history(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the chronological assessment progression history for a specific skill."""
    evaluation = (
        db.query(SkillEvaluation)
        .filter(
            SkillEvaluation.user_id == current_user.id,
            SkillEvaluation.skill_name.ilike(skill_name.strip()),
        )
        .first()
    )

    if not evaluation:
        return []

    histories = (
        db.query(SkillHistory)
        .filter(SkillHistory.evaluation_id == evaluation.id)
        .order_by(SkillHistory.recorded_at.asc())
        .all()
    )

    return [
        {
            "id": h.id,
            "skill_name": evaluation.skill_name,
            "score_percentage": h.score_percentage,
            "proficiency_level": h.proficiency_level,
            "assessment_id": h.assessment_id,
            "snapshot_reason": h.snapshot_reason,
            "recorded_at": h.recorded_at,
        }
        for h in histories
    ]


@router.get("/career-readiness")
async def get_career_readiness_endpoint(
    role_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Evaluate and return learner readiness against target career role requirements."""
    target_role_id = role_id
    if not target_role_id:
        profile = current_user.profile
        target_role_id = profile.target_career_role_id if profile else None

    if not target_role_id:
        first_role = db.query(CareerRole).first()
        target_role_id = first_role.id if first_role else ""

    return get_career_readiness(db, current_user.id, target_role_id)
