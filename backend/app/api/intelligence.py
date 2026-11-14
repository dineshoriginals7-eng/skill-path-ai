"""Learner Intelligence API Router.

Provides endpoints to retrieve automated cognitive insights, structured intelligence
reports, prioritized recommendations, and trigger diagnostic recalculation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

from app.db.database import get_db
from app.models.user import User
from app.models.intelligence import LearnerInsight, LearnerSnapshot, RecommendationHistory
from app.models.skill import SkillEvaluation
from app.models.roadmap import LearningRoadmap
from app.agents.demo_engine import get_demo_insights
from app.services.skill_service import get_career_readiness
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(prefix="/api/intelligence", tags=["Intelligence"])


def _seed_demo_insights_if_needed(db: Session, user_id: str) -> List[LearnerInsight]:
    """Helper to seed demonstration insights if none are recorded for the user."""
    insights = (
        db.query(LearnerInsight)
        .filter(LearnerInsight.user_id == user_id, LearnerInsight.is_active == True)
        .all()
    )
    if (not insights or len(insights) < 7) and settings.DEMO_MODE:
        db.query(LearnerInsight).filter(LearnerInsight.user_id == user_id).delete()
        db.commit()
        demo_items = get_demo_insights()
        for item in demo_items:
            rec = LearnerInsight(
                user_id=user_id,
                insight_type=item.get("type", "skill_strength"),
                category=item.get("category", "skill"),
                title=item.get("title", "Insight"),
                description=item.get("description", ""),
                evidence=item.get("evidence", []),
                priority=item.get("priority", "medium"),
                is_active=True,
                agent="demo_engine",
                trigger="onboarding",
            )
            db.add(rec)
        db.commit()
        insights = (
            db.query(LearnerInsight)
            .filter(LearnerInsight.user_id == user_id, LearnerInsight.is_active == True)
            .all()
        )
    return insights


def _seed_demo_recommendations_if_needed(db: Session, user_id: str) -> List[RecommendationHistory]:
    """Helper to seed demonstration recommendations if none exist."""
    recs = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == user_id)
        .all()
    )
    if not recs and settings.DEMO_MODE:
        defaults = [
            {
                "type": "skill",
                "title": "Master JavaScript ES6+ & Asynchronous Patterns",
                "description": "Strengthen understanding of closures, Promises, and async/await prior to React.",
                "action_items": [
                    "Review execution contexts and closures",
                    "Complete 5 asynchronous Promise debugging exercises",
                    "Build a mini weather API fetcher",
                ],
                "reasoning": "Recent assessment score indicates 45% in JavaScript fundamentals.",
            },
            {
                "type": "course",
                "title": "React Component Architecture & Hooks",
                "description": "Deep-dive into useState, useEffect, and component lifecycle best practices.",
                "action_items": [
                    "Build a modular Todo List application",
                    "Practice managing compound state with useReducer",
                ],
                "reasoning": "High-priority requirement for Full Stack Developer readiness.",
            },
            {
                "type": "resource",
                "title": "Relational Database Indexing & Query Optimization",
                "description": "Learn how database indices work and practice optimizing JOIN queries with EXPLAIN.",
                "action_items": [
                    "Complete SQL indexing tutorial",
                    "Practice group queries with HAVING clauses",
                ],
                "reasoning": "Essential backend capability verified by diagnostic assessment.",
            },
        ]
        for d in defaults:
            rec = RecommendationHistory(
                user_id=user_id,
                recommendation_type=d["type"],
                title=d["title"],
                description=d["description"],
                action_items=d["action_items"],
                reasoning=d["reasoning"],
                status="pending",
                agent="demo_intelligence_agent",
            )
            db.add(rec)
        db.commit()
        recs = (
            db.query(RecommendationHistory)
            .filter(RecommendationHistory.user_id == user_id)
            .all()
        )
    return recs


@router.get("/insights")
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve active AI learner insights for the current authenticated user."""
    insights = _seed_demo_insights_if_needed(db, current_user.id)
    return [
        {
            "id": i.id,
            "insight_type": i.insight_type,
            "category": i.category,
            "title": i.title,
            "description": i.description,
            "evidence": i.evidence or [],
            "priority": i.priority,
            "agent": i.agent,
            "created_at": i.created_at,
        }
        for i in insights
    ]


@router.get("/recommendations")
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve active and pending recommendations tailored to the learner's gaps."""
    recs = _seed_demo_recommendations_if_needed(db, current_user.id)
    return [
        {
            "id": r.id,
            "recommendation_type": r.recommendation_type,
            "title": r.title,
            "description": r.description,
            "action_items": r.action_items or [],
            "reasoning": r.reasoning,
            "status": r.status,
            "agent": r.agent,
            "created_at": r.created_at,
        }
        for r in recs
    ]


@router.post("/refresh")
async def refresh_intelligence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger re-analysis of learner state, re-seed insights, and store a progress snapshot."""
    # Re-seed fresh categorized insights for demo mode
    if settings.DEMO_MODE:
        db.query(LearnerInsight).filter(LearnerInsight.user_id == current_user.id).delete()
        db.commit()
        demo_items = get_demo_insights()
        for item in demo_items:
            rec = LearnerInsight(
                user_id=current_user.id,
                insight_type=item.get("type", "skill_strength"),
                category=item.get("category", "skill"),
                title=item.get("title", "Insight"),
                description=item.get("description", ""),
                evidence=item.get("evidence", []),
                priority=item.get("priority", "medium"),
                is_active=True,
                agent="demo_engine",
                trigger="refresh",
            )
            db.add(rec)
        db.commit()

    insights = (
        db.query(LearnerInsight)
        .filter(LearnerInsight.user_id == current_user.id, LearnerInsight.is_active == True)
        .all()
    )
    recs = _seed_demo_recommendations_if_needed(db, current_user.id)

    # Calculate current state snapshot
    evals = (
        db.query(SkillEvaluation)
        .filter(SkillEvaluation.user_id == current_user.id)
        .all()
    )
    strong = [e.skill_name for e in evals if e.strength_level == "strong"]
    weak = [
        e.skill_name
        for e in evals
        if e.strength_level in ("weak", "critical_weakness")
    ]
    avg_score = (
        round(sum(e.score_percentage or 0.0 for e in evals) / len(evals), 1)
        if evals
        else 52.0
    )

    career_id = (
        current_user.profile.target_career_role_id
        if current_user.profile
        else ""
    )
    career_info = get_career_readiness(db, current_user.id, career_id)

    snapshot = LearnerSnapshot(
        user_id=current_user.id,
        snapshot_type="refresh",
        overall_proficiency=avg_score,
        career_readiness_score=career_info.get("readiness_score", 52.0),
        strong_skills=strong,
        weak_skills=weak,
        missing_skills=career_info.get("skills_missing", []),
        active_interests=[i.category for i in current_user.interests],
        created_at=datetime.utcnow(),
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return {
        "success": True,
        "message": "Learner intelligence refreshed successfully.",
        "insights_count": len(insights),
        "recommendations_count": len(recs),
        "snapshot_id": snapshot.id,
        "readiness_score": snapshot.career_readiness_score,
    }


@router.get("/report")
async def get_comprehensive_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve comprehensive diagnostic report combining insights, skills, roadmap, and gaps."""
    insights = _seed_demo_insights_if_needed(db, current_user.id)
    recommendations = _seed_demo_recommendations_if_needed(db, current_user.id)

    evals = (
        db.query(SkillEvaluation)
        .filter(SkillEvaluation.user_id == current_user.id)
        .all()
    )
    strong_skills = [e.skill_name for e in evals if e.strength_level == "strong"]
    intermediate_skills = [
        e.skill_name for e in evals if e.strength_level == "intermediate"
    ]
    weak_skills = [
        e.skill_name
        for e in evals
        if e.strength_level in ("weak", "critical_weakness")
    ]

    career_id = (
        current_user.profile.target_career_role_id
        if current_user.profile
        else ""
    )
    career_readiness = get_career_readiness(db, current_user.id, career_id)

    roadmap = (
        db.query(LearningRoadmap)
        .filter(
            LearningRoadmap.user_id == current_user.id,
            LearningRoadmap.is_active == True,
        )
        .first()
    )

    roadmap_summary = {
        "has_active_roadmap": roadmap is not None,
        "title": roadmap.title if roadmap else "No active roadmap",
        "overall_progress": roadmap.overall_progress if roadmap else 0.0,
        "completed_modules": roadmap.completed_modules if roadmap else 0,
        "total_modules": roadmap.total_modules if roadmap else 0,
    }

    return {
        "learner": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "target_career": career_readiness.get("career", "Full Stack Developer"),
        },
        "career_readiness": career_readiness,
        "skill_summary": {
            "total_skills_evaluated": len(evals),
            "strong": strong_skills,
            "intermediate": intermediate_skills,
            "weak": weak_skills,
        },
        "roadmap_progress": roadmap_summary,
        "insights": [
            {
                "id": i.id,
                "type": i.insight_type,
                "title": i.title,
                "description": i.description,
                "priority": i.priority,
                "evidence": i.evidence or [],
            }
            for i in insights
        ],
        "recommendations": [
            {
                "id": r.id,
                "type": r.recommendation_type,
                "title": r.title,
                "description": r.description,
                "action_items": r.action_items or [],
                "reasoning": r.reasoning,
                "status": r.status,
            }
            for r in recommendations
        ],
        "generated_at": datetime.utcnow(),
    }
