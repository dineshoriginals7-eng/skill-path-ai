"""Roadmap API Router.

Provides endpoints to generate personalized, AI-driven learning roadmaps,
track module completion and study progress, and retrieve active roadmap milestones.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

from app.db.database import get_db
from app.models.user import User
from app.models.roadmap import LearningRoadmap, LearningModule, LearningProgress
from app.models.skill import SkillEvaluation
from app.agents.demo_engine import get_demo_roadmap_modules
from app.core.security import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])


class ModuleProgressUpdateRequest(BaseModel):
    progress_percentage: float = Field(..., ge=0.0, le=100.0)
    status: Optional[str] = Field(None, description="not_started | in_progress | completed")
    time_spent_minutes: Optional[int] = None
    notes: Optional[str] = None


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personalized learning roadmap based on user's weak skills and target career."""
    # Deactivate any existing active roadmaps
    db.query(LearningRoadmap).filter(
        LearningRoadmap.user_id == current_user.id,
        LearningRoadmap.is_active == True,
    ).update({"is_active": False})
    db.flush()

    # Discover weak skills from user evaluations
    weak_evals = (
        db.query(SkillEvaluation)
        .filter(
            SkillEvaluation.user_id == current_user.id,
            SkillEvaluation.strength_level.in_(["weak", "critical_weakness"]),
        )
        .all()
    )
    weak_skills = [e.skill_name for e in weak_evals]
    if not weak_skills:
        weak_skills = ["JavaScript", "React"]

    # Retrieve career target
    profile = current_user.profile
    career_name = "Full Stack Developer"
    career_role_id = None
    if profile:
        if profile.target_career:
            career_name = profile.target_career.name
            career_role_id = profile.target_career.id
        elif profile.primary_career_goal:
            career_name = profile.primary_career_goal

    # Fetch curated roadmap modules
    modules_blueprint = get_demo_roadmap_modules(career_name, weak_skills)

    # Create parent roadmap
    roadmap = LearningRoadmap(
        user_id=current_user.id,
        career_role_id=career_role_id,
        title=f"Adaptive {career_name} Roadmap",
        description=(
            f"Personalized path formulated to bridge identified gaps in "
            f"{', '.join(weak_skills)} and achieve career readiness in {career_name}."
        ),
        is_active=True,
        total_modules=len(modules_blueprint),
        completed_modules=0,
        overall_progress=0.0,
        ai_generated=True,
        generation_basis={
            "career": career_name,
            "weak_skills": weak_skills,
            "module_count": len(modules_blueprint),
            "generated_at": datetime.utcnow().isoformat(),
        },
    )
    db.add(roadmap)
    db.flush()

    created_modules = []
    for idx, mod in enumerate(modules_blueprint):
        order_idx = mod.get("order_index", idx + 1)
        is_first = order_idx == 1
        initial_status = "available" if is_first else "locked"

        module = LearningModule(
            roadmap_id=roadmap.id,
            title=mod["title"],
            description=mod.get("description"),
            learning_objectives=mod.get("learning_objectives", []),
            topics=mod.get("topics", []),
            resources=mod.get("resources", []),
            exercises=mod.get("exercises", []),
            mini_project=mod.get("mini_project"),
            order_index=order_idx,
            estimated_hours=float(mod.get("estimated_hours", 20.0)),
            difficulty=mod.get("difficulty", "beginner"),
            status=initial_status,
            is_prerequisite_met=is_first,
            prerequisite_module_ids=[],
        )
        db.add(module)
        db.flush()

        progress = LearningProgress(
            module_id=module.id,
            user_id=current_user.id,
            status="not_started",
            progress_percentage=0.0,
            time_spent_minutes=0,
        )
        db.add(progress)
        created_modules.append(module)

    db.commit()
    db.refresh(roadmap)

    return {
        "id": roadmap.id,
        "title": roadmap.title,
        "description": roadmap.description,
        "is_active": roadmap.is_active,
        "total_modules": roadmap.total_modules,
        "completed_modules": roadmap.completed_modules,
        "overall_progress": roadmap.overall_progress,
        "modules_count": len(created_modules),
        "created_at": roadmap.created_at,
    }


@router.get("/my-roadmap")
async def get_my_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the currently active learning roadmap and all its modules with progress."""
    roadmap = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id == current_user.id,
            LearningRoadmap.is_active == True,
        )
        .first()
    )

    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active roadmap found. Please generate a new roadmap first.",
        )

    modules = []
    for m in roadmap.modules:
        prog = m.progress
        modules.append(
            {
                "id": m.id,
                "roadmap_id": m.roadmap_id,
                "title": m.title,
                "description": m.description,
                "learning_objectives": m.learning_objectives or [],
                "topics": m.topics or [],
                "resources": m.resources or [],
                "exercises": m.exercises or [],
                "mini_project": m.mini_project,
                "order_index": m.order_index,
                "estimated_hours": m.estimated_hours,
                "difficulty": m.difficulty,
                "status": m.status,
                "is_prerequisite_met": m.is_prerequisite_met,
                "progress": {
                    "status": prog.status if prog else "not_started",
                    "progress_percentage": prog.progress_percentage if prog else 0.0,
                    "time_spent_minutes": prog.time_spent_minutes if prog else 0,
                    "started_at": prog.started_at if prog else None,
                    "completed_at": prog.completed_at if prog else None,
                }
                if prog
                else None,
            }
        )

    return {
        "id": roadmap.id,
        "title": roadmap.title,
        "description": roadmap.description,
        "is_active": roadmap.is_active,
        "total_modules": roadmap.total_modules,
        "completed_modules": roadmap.completed_modules,
        "overall_progress": roadmap.overall_progress,
        "created_at": roadmap.created_at,
        "updated_at": roadmap.updated_at,
        "modules": modules,
    }


@router.put("/module/{module_id}/progress")
async def update_module_progress(
    module_id: str,
    req: ModuleProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update learning module progress, unlock next milestones, and refresh overall progress."""
    module = (
        db.query(LearningModule)
        .join(LearningRoadmap)
        .filter(
            LearningModule.id == module_id,
            LearningRoadmap.user_id == current_user.id,
        )
        .first()
    )

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning module not found.",
        )

    prog = module.progress
    if not prog:
        prog = LearningProgress(
            module_id=module.id,
            user_id=current_user.id,
            status="not_started",
            progress_percentage=0.0,
        )
        db.add(prog)
        db.flush()

    prog.progress_percentage = req.progress_percentage
    if req.time_spent_minutes:
        prog.time_spent_minutes = (prog.time_spent_minutes or 0) + req.time_spent_minutes
    if req.notes is not None:
        prog.notes = req.notes

    now = datetime.utcnow()
    # Transition status
    if req.progress_percentage >= 100.0 or req.status == "completed":
        prog.status = "completed"
        module.status = "completed"
        if not prog.completed_at:
            prog.completed_at = now
    elif req.progress_percentage > 0.0 or req.status == "in_progress":
        prog.status = "in_progress"
        module.status = "in_progress"
        if not prog.started_at:
            prog.started_at = now
    else:
        if req.status:
            prog.status = req.status
            module.status = req.status

    # Unlock subsequent module if current is completed
    if module.status == "completed":
        next_module = (
            db.query(LearningModule)
            .filter(
                LearningModule.roadmap_id == module.roadmap_id,
                LearningModule.order_index == module.order_index + 1,
            )
            .first()
        )
        if next_module and next_module.status == "locked":
            next_module.status = "available"
            next_module.is_prerequisite_met = True

    # Recalculate parent roadmap overall progress
    roadmap = module.roadmap
    all_modules = roadmap.modules
    completed_cnt = sum(1 for m in all_modules if m.status == "completed")
    roadmap.completed_modules = completed_cnt

    if all_modules:
        avg_pct = (
            sum(
                (m.progress.progress_percentage if m.progress else 0.0)
                for m in all_modules
            )
            / len(all_modules)
        )
        roadmap.overall_progress = round(avg_pct, 1)

    roadmap.updated_at = now
    module.updated_at = now
    db.commit()

    return {
        "module_id": module.id,
        "module_status": module.status,
        "progress_percentage": prog.progress_percentage,
        "completed_modules": roadmap.completed_modules,
        "overall_progress": roadmap.overall_progress,
    }


@router.get("/module/{module_id}")
@router.get("/modules/{module_id}")
async def get_module_details(
    module_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full details for a single module including syllabus and study materials."""
    module = (
        db.query(LearningModule)
        .join(LearningRoadmap)
        .filter(
            LearningModule.id == module_id,
            LearningRoadmap.user_id == current_user.id,
        )
        .first()
    )

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning module not found.",
        )

    prog = module.progress
    return {
        "id": module.id,
        "roadmap_id": module.roadmap_id,
        "title": module.title,
        "description": module.description,
        "learning_objectives": module.learning_objectives or [],
        "topics": module.topics or [],
        "resources": module.resources or [],
        "exercises": module.exercises or [],
        "mini_project": module.mini_project,
        "order_index": module.order_index,
        "estimated_hours": module.estimated_hours,
        "difficulty": module.difficulty,
        "status": module.status,
        "is_prerequisite_met": module.is_prerequisite_met,
        "progress": {
            "status": prog.status if prog else "not_started",
            "progress_percentage": prog.progress_percentage if prog else 0.0,
            "time_spent_minutes": prog.time_spent_minutes if prog else 0,
            "started_at": prog.started_at if prog else None,
            "completed_at": prog.completed_at if prog else None,
            "notes": prog.notes if prog else None,
        }
        if prog
        else None,
    }
