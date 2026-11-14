"""Centralized Learner Intelligence Service.

Serves as the SINGLE SOURCE OF TRUTH across the entire platform.
Consolidates profile data, verified competencies, in-progress skills,
self-declared skills, unassessed requirements, career readiness,
roadmap progression, academic metrics, and active AI insights.
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.user import User
from app.models.learner_profile import LearnerProfile, Interest
from app.models.skill import SkillEvaluation, SkillHistory
from app.models.career import CareerRole, CareerSkillRequirement, SkillCatalog
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentAttempt, Question
from app.models.roadmap import LearningRoadmap, LearningModule, LearningProgress
from app.models.document import StudentDocument, DocumentAnalysis
from app.models.intelligence import LearnerInsight, RecommendationHistory


def get_unified_learner_profile(
    db: Session,
    user_id: str,
    target_career_role_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Retrieve or compute the single, unified cognitive profile for a learner.

    Guarantees consistent numbers across:
    - Dashboard
    - Skill Evaluation Page & Radar Chart
    - Career Matching Engine
    - Learning Roadmap
    - AI Mentor Context
    - Analytics & Progress Reports
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user_id).first()
    if not profile:
        profile = LearnerProfile(user_id=user_id)
        db.add(profile)
        db.flush()

    # 1. Target Career Role Resolution
    target_role: Optional[CareerRole] = None
    role_id_to_use = target_career_role_id or profile.target_career_role_id
    if role_id_to_use:
        target_role = db.query(CareerRole).filter(CareerRole.id == role_id_to_use).first()

    if not target_role and profile.primary_career_goal:
        target_role = db.query(CareerRole).filter(CareerRole.name.ilike(f"%{profile.primary_career_goal}%")).first()

    if not target_role:
        target_role = db.query(CareerRole).filter(CareerRole.is_active == True).first()

    target_role_id = target_role.id if target_role else ""
    target_role_name = target_role.name if target_role else (profile.primary_career_goal or "Full Stack Developer")

    # 2. Retrieve All Evaluations for Learner
    evaluations = (
        db.query(SkillEvaluation)
        .filter(SkillEvaluation.user_id == user_id)
        .order_by(SkillEvaluation.score_percentage.desc())
        .all()
    )

    eval_by_name = {e.skill_name.lower().strip(): e for e in evaluations}
    eval_by_id = {e.skill_id: e for e in evaluations if e.skill_id}

    # 3. Retrieve Career Requirements for the Active Career Target
    requirements = (
        db.query(CareerSkillRequirement)
        .filter(CareerSkillRequirement.career_role_id == target_role_id)
        .all()
    ) if target_role else []

    # 4. Classify Skills: Verified, In Progress, Needs Improvement, Self-Declared, Not Assessed
    self_declared_names = set(
        [s.lower().strip() for s in (profile.current_technical_skills or []) if isinstance(s, str)]
    )

    verified_skills: List[Dict[str, Any]] = []
    in_progress_skills: List[Dict[str, Any]] = []
    weak_skills: List[Dict[str, Any]] = []
    unassessed_skills: List[Dict[str, Any]] = []

    total_weight = 0.0
    earned_weight = 0.0

    processed_req_skill_names = set()

    for req in requirements:
        weight = float(req.weight or 1.0)
        total_weight += weight

        skill_obj = req.skill
        skill_name = skill_obj.name if skill_obj else "Skill"
        skill_lower = skill_name.lower().strip()
        processed_req_skill_names.add(skill_lower)

        user_eval = eval_by_name.get(skill_lower) or eval_by_id.get(req.skill_id)

        if user_eval:
            score = float(user_eval.score_percentage or 0.0)
            earned_weight += (score / 100.0) * weight

            skill_data = {
                "id": user_eval.id,
                "skill_name": user_eval.skill_name,
                "score_percentage": score,
                "proficiency_level": user_eval.proficiency_level or "intermediate",
                "strength_level": user_eval.strength_level or "intermediate",
                "learning_priority": user_eval.learning_priority or "medium",
                "weakness_areas": user_eval.weakness_areas or [],
                "strength_areas": user_eval.strength_areas or [],
                "evidence": user_eval.evidence or [],
                "is_verified": True,
                "status": "VERIFIED_MASTERED" if score >= 70.0 else ("IN_PROGRESS" if score >= 40.0 else "NEEDS_IMPROVEMENT"),
                "importance": req.importance,
                "target_proficiency": req.min_proficiency,
            }

            if score >= 70.0:
                verified_skills.append(skill_data)
            elif score >= 40.0:
                in_progress_skills.append(skill_data)
            else:
                weak_skills.append(skill_data)
        else:
            # Skill required by target career has NOT been assessed
            is_self_declared = skill_lower in self_declared_names
            unassessed_skills.append({
                "id": f"unassessed-{skill_name.lower().replace(' ', '-')}",
                "skill_name": skill_name,
                "score_percentage": None,  # Explicitly null, NEVER 0%
                "proficiency_level": "self_declared" if is_self_declared else "not_assessed",
                "strength_level": "not_assessed",
                "learning_priority": "high" if req.importance == "required" else "medium",
                "weakness_areas": [],
                "strength_areas": [],
                "evidence": ["Self-declared during profile setup"] if is_self_declared else [],
                "is_verified": False,
                "status": "SELF_DECLARED_UNVERIFIED" if is_self_declared else "NOT_ASSESSED",
                "importance": req.importance,
                "target_proficiency": req.min_proficiency,
            })

    # Also include evaluated skills not explicitly listed in target career requirements
    additional_evaluated_skills: List[Dict[str, Any]] = []
    for e in evaluations:
        if e.skill_name.lower().strip() not in processed_req_skill_names:
            score = float(e.score_percentage or 0.0)
            item = {
                "id": e.id,
                "skill_name": e.skill_name,
                "score_percentage": score,
                "proficiency_level": e.proficiency_level or "intermediate",
                "strength_level": e.strength_level or "intermediate",
                "learning_priority": e.learning_priority or "low",
                "weakness_areas": e.weakness_areas or [],
                "strength_areas": e.strength_areas or [],
                "evidence": e.evidence or [],
                "is_verified": True,
                "status": "VERIFIED_MASTERED" if score >= 70.0 else ("IN_PROGRESS" if score >= 40.0 else "NEEDS_IMPROVEMENT"),
                "importance": "supplementary",
                "target_proficiency": "intermediate",
            }
            additional_evaluated_skills.append(item)
            if score >= 70.0:
                verified_skills.append(item)
            elif score >= 40.0:
                in_progress_skills.append(item)
            else:
                weak_skills.append(item)

    # 5. Career Readiness Score Calculation
    # If student has completed 0 assessments, career readiness is 0.0 (or "Not Assessed")
    completed_assessments_count = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.status == "completed")
        .count()
    )

    if completed_assessments_count == 0 or total_weight == 0:
        career_readiness_score = 0.0
        career_readiness_label = "Not Assessed"
    else:
        career_readiness_score = round((earned_weight / total_weight) * 100.0, 1)
        if career_readiness_score < 40.0:
            career_readiness_label = "Novice / Early Stage"
        elif career_readiness_score < 70.0:
            career_readiness_label = "Developing Alignment"
        elif career_readiness_score < 90.0:
            career_readiness_label = "Job Ready"
        else:
            career_readiness_label = "Highly Qualified"

    # Estimated study weeks: ~2.5 weeks per missing/unassessed skill + ~1 week per in-progress skill
    estimated_study_weeks = max(2, len(unassessed_skills) * 2 + len(in_progress_skills) * 1 + len(weak_skills) * 1)

    # 6. Active Roadmap Progress
    active_roadmap = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.user_id == user_id, LearningRoadmap.is_active == True)
        .first()
    )

    roadmap_data = {
        "has_roadmap": active_roadmap is not None,
        "id": active_roadmap.id if active_roadmap else None,
        "title": active_roadmap.title if active_roadmap else f"{target_role_name} Pathway",
        "overall_progress": active_roadmap.overall_progress if active_roadmap else 0.0,
        "completed_modules": active_roadmap.completed_modules if active_roadmap else 0,
        "total_modules": active_roadmap.total_modules if active_roadmap else 0,
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "order_index": m.order_index,
                "status": m.status,
                "difficulty": m.difficulty,
                "estimated_hours": m.estimated_hours,
                "learning_objectives": m.learning_objectives or [],
                "topics": m.topics or [],
            }
            for m in (active_roadmap.modules if active_roadmap else [])
        ],
    }

    # 7. Academic Summary & Document Evidence
    documents = db.query(StudentDocument).filter(StudentDocument.user_id == user_id).all()
    academic_summary = {
        "educational_qualification": profile.educational_qualification or "Not Specified",
        "college_or_university": profile.college_or_university or "Not Specified",
        "academic_year": profile.academic_year or "Not Specified",
        "department": profile.department or "Not Specified",
        "gpa_or_percentage": profile.gpa_or_percentage or "Not Specified",
        "uploaded_documents_count": len(documents),
        "document_types": [d.file_type for d in documents],
    }

    # 8. Learning Interests
    interests = db.query(Interest).filter(Interest.user_id == user_id).all()
    primary_interest = next((i.category for i in interests if i.is_primary), None)
    if not primary_interest and interests:
        primary_interest = interests[0].category

    # 9. Recent Assessments History
    recent_assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id)
        .order_by(Assessment.created_at.desc())
        .limit(5)
        .all()
    )

    assessment_history = [
        {
            "id": a.id,
            "title": a.title,
            "type": a.type,
            "status": a.status,
            "score_percentage": a.score_percentage,
            "total_questions": a.total_questions,
            "answered_questions": a.answered_questions,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "time_completed": a.time_completed.isoformat() if a.time_completed else None,
        }
        for a in recent_assessments
    ]

    # 10. Proactive AI Insights
    insights = (
        db.query(LearnerInsight)
        .filter(LearnerInsight.user_id == user_id, LearnerInsight.is_active == True)
        .order_by(LearnerInsight.created_at.desc())
        .all()
    )

    recommendations = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == user_id, RecommendationHistory.status == "pending")
        .order_by(RecommendationHistory.created_at.desc())
        .all()
    )

    # All Combined Skills List for Skills Page & Radar Chart
    all_combined_skills = verified_skills + in_progress_skills + weak_skills + unassessed_skills

    return {
        "learner": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "onboarding_complete": str(profile.onboarding_complete).lower() == "true",
            "primary_career_goal": target_role_name,
            "target_career_role_id": target_role_id,
        },
        "stats": {
            "assessments_completed": completed_assessments_count,
            "skills_evaluated_count": len(evaluations),
            "verified_skills_count": len(verified_skills),
            "in_progress_skills_count": len(in_progress_skills),
            "weak_skills_count": len(weak_skills),
            "unassessed_skills_count": len(unassessed_skills),
            "career_readiness_score": career_readiness_score,
            "career_readiness_label": career_readiness_label,
            "roadmap_progress": roadmap_data["overall_progress"],
            "modules_completed": roadmap_data["completed_modules"],
            "total_modules": roadmap_data["total_modules"],
            "estimated_weeks_to_ready": estimated_study_weeks,
        },
        "career_alignment": {
            "career_role_id": target_role_id,
            "career_name": target_role_name,
            "readiness_score": career_readiness_score,
            "readiness_label": career_readiness_label,
            "estimated_weeks": estimated_study_weeks,
            "verified_competencies": [s["skill_name"] for s in verified_skills],
            "in_progress_competencies": [s["skill_name"] for s in in_progress_skills],
            "missing_or_unassessed": [s["skill_name"] for s in unassessed_skills],
            "priority_gaps": [
                {
                    "skill": s["skill_name"],
                    "importance": s.get("importance", "required"),
                    "status": s.get("status"),
                    "target_proficiency": s.get("target_proficiency", "intermediate"),
                }
                for s in (weak_skills + unassessed_skills)[:5]
            ],
        },
        "skills": {
            "all": all_combined_skills,
            "verified": verified_skills,
            "in_progress": in_progress_skills,
            "weak": weak_skills,
            "unassessed": unassessed_skills,
        },
        "roadmap": roadmap_data,
        "academic": academic_summary,
        "interests": {
            "categories": [i.category for i in interests],
            "primary": primary_interest,
        },
        "recent_assessments": assessment_history,
        "insights": [
            {
                "id": ins.id,
                "insight_type": ins.insight_type,
                "category": ins.category,
                "title": ins.title,
                "description": ins.description,
                "evidence": ins.evidence or [],
                "priority": ins.priority,
                "created_at": ins.created_at.isoformat() if ins.created_at else None,
            }
            for ins in insights
        ],
        "recommendations": [
            {
                "id": r.id,
                "recommendation_type": r.recommendation_type,
                "priority": "high",
                "title": r.title,
                "reason": r.reasoning or r.description,
                "action_label": (r.action_items[0] if (r.action_items and isinstance(r.action_items, list)) else "Review Pathway"),
                "action_target": "/roadmap",
            }
            for r in recommendations
        ],
        "generated_at": datetime.utcnow().isoformat(),
    }
