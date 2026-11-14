"""Skill Evaluation and Career Readiness Service.

Calculates per-skill scores from assessment responses, updates skill evaluations,
maintains historical progression snapshots, and computes career readiness scores.
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.assessment import Assessment, AssessmentAttempt, AssessmentAnswer, Question
from app.models.skill import SkillEvaluation, SkillHistory
from app.models.career import CareerRole, CareerSkillRequirement, SkillCatalog
from datetime import datetime
import uuid


def evaluate_skills_from_assessment(
    db: Session, user_id: str, assessment_id: str
) -> List[Dict[str, Any]]:
    """Calculate per-skill scores from assessment answers and upsert SkillEvaluation records.

    1. Load the assessment and all associated attempts + answers.
    2. Group answers by skill_name.
    3. Calculate score percentage per skill.
    4. Determine proficiency_level (<40 beginner, 40-70 intermediate, >70 advanced).
    5. Determine strength_level (<40 weak, 40-70 intermediate, >70 strong).
    6. Determine learning_priority (critical for <30, high for <40, medium 40-70, low >70).
    7. Upsert SkillEvaluation (create or update, add SkillHistory entry).
    8. Return list of skill evaluation dicts.
    """
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == user_id)
        .first()
    )
    if not assessment:
        return []

    # Retrieve all answers for this assessment
    answers = (
        db.query(AssessmentAnswer)
        .join(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment_id)
        .all()
    )

    if not answers:
        return []

    # Group answers by skill_name
    skills_map: Dict[str, Dict[str, Any]] = {}
    for ans in answers:
        q = ans.question
        if not q:
            q = db.query(Question).filter(Question.id == ans.question_id).first()
        if not q:
            continue

        skill_name = q.skill_name or "General"
        if skill_name not in skills_map:
            skills_map[skill_name] = {
                "total_score": 0.0,
                "max_score": 0.0,
                "weakness_areas": [],
                "strength_areas": [],
                "evidence": [],
            }

        s_entry = skills_map[skill_name]
        max_s = float(ans.max_score if ans.max_score is not None else 1.0)
        earned_s = float(
            ans.score
            if ans.score is not None
            else (1.0 if ans.is_correct else 0.0)
        )

        s_entry["total_score"] += earned_s
        s_entry["max_score"] += max_s

        if ans.is_correct:
            if q.tags:
                s_entry["strength_areas"].extend(q.tags)
            else:
                s_entry["strength_areas"].append(q.question_text[:60])
        else:
            if q.tags:
                s_entry["weakness_areas"].extend(q.tags)
            else:
                s_entry["weakness_areas"].append(q.question_text[:60])

        s_entry["evidence"].append(
            f"Q: '{q.question_text[:45]}...' -> {'Correct' if ans.is_correct else 'Incorrect'} "
            f"({earned_s}/{max_s})"
        )

    evaluations_result = []

    for skill_name, data in skills_map.items():
        total_score = data["total_score"]
        max_score = data["max_score"]
        score_pct = (
            round((total_score / max_score) * 100.0, 1) if max_score > 0 else 0.0
        )

        # 4. Proficiency level
        if score_pct < 40.0:
            proficiency = "beginner"
        elif score_pct <= 70.0:
            proficiency = "intermediate"
        else:
            proficiency = "advanced"

        # 5. Strength level
        if score_pct < 40.0:
            strength = "weak"
        elif score_pct <= 70.0:
            strength = "intermediate"
        else:
            strength = "strong"

        # 6. Learning priority
        if score_pct < 30.0:
            priority = "critical"
        elif score_pct < 40.0:
            priority = "high"
        elif score_pct <= 70.0:
            priority = "medium"
        else:
            priority = "low"

        # Find corresponding skill in catalog if present
        catalog_entry = (
            db.query(SkillCatalog)
            .filter(SkillCatalog.name.ilike(skill_name))
            .first()
        )
        catalog_id = catalog_entry.id if catalog_entry else None

        weak_list = list(dict.fromkeys(data["weakness_areas"]))
        strong_list = list(dict.fromkeys(data["strength_areas"]))

        is_practice = assessment.type == "practice"
        is_mastery = assessment.type == "mastery"
        is_diagnostic = assessment.type in ("diagnostic", "initial")

        # 7. Upsert SkillEvaluation respecting assessment mode
        eval_record = (
            db.query(SkillEvaluation)
            .filter(
                SkillEvaluation.user_id == user_id,
                SkillEvaluation.skill_name == skill_name,
            )
            .first()
        )

        if not eval_record:
            eval_record = SkillEvaluation(
                user_id=user_id,
                skill_id=catalog_id,
                skill_name=skill_name,
                assessment_id=assessment_id if not is_practice else None,
                proficiency_level=proficiency,
                score_percentage=score_pct,
                strength_level=strength,
                weakness_areas=weak_list,
                strength_areas=strong_list,
                learning_priority=priority,
                evidence=data["evidence"][:10],
                is_verified=not is_practice,
                evaluated_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(eval_record)
            db.flush()
        else:
            if catalog_id and not eval_record.skill_id:
                eval_record.skill_id = catalog_id

            if is_practice:
                # PRACTICE DRILL: Never overwrite diagnostic baseline scores or assessment_id!
                existing_evidence = eval_record.evidence or []
                eval_record.evidence = (data["evidence"][:3] + existing_evidence)[:15]
                eval_record.updated_at = datetime.utcnow()
            elif is_mastery:
                # MASTERY EXAM: Elevate proficiency if passing score achieved
                if score_pct >= 75.0:
                    eval_record.score_percentage = max(eval_record.score_percentage or 0, score_pct)
                    eval_record.proficiency_level = "advanced"
                    eval_record.strength_level = "strong"
                    eval_record.learning_priority = "low"
                    eval_record.is_verified = True
                eval_record.assessment_id = assessment_id
                eval_record.evidence = (data["evidence"][:5] + (eval_record.evidence or []))[:15]
                eval_record.updated_at = datetime.utcnow()
            else:
                # DIAGNOSTIC / INITIAL BASELINE
                eval_record.assessment_id = assessment_id
                eval_record.proficiency_level = proficiency
                eval_record.score_percentage = score_pct
                eval_record.strength_level = strength
                eval_record.weakness_areas = weak_list
                eval_record.strength_areas = strong_list
                eval_record.learning_priority = priority
                eval_record.evidence = data["evidence"][:10]
                eval_record.is_verified = True
                eval_record.updated_at = datetime.utcnow()

        # Add history entry
        snapshot_reason = (
            "practice_session"
            if is_practice
            else ("mastery_examination" if is_mastery else "diagnostic_baseline")
        )
        history_entry = SkillHistory(
            evaluation_id=eval_record.id,
            score_percentage=score_pct,
            proficiency_level=proficiency,
            assessment_id=assessment_id,
            snapshot_reason=snapshot_reason,
            recorded_at=datetime.utcnow(),
        )
        db.add(history_entry)

        evaluations_result.append(
            {
                "id": eval_record.id,
                "skill_name": skill_name,
                "score_percentage": score_pct,
                "proficiency_level": proficiency,
                "strength_level": strength,
                "learning_priority": priority,
                "weakness_areas": weak_list,
                "strength_areas": strong_list,
            }
        )

    db.commit()
    return evaluations_result


def get_career_readiness(db: Session, user_id: str, career_role_id: str) -> Dict[str, Any]:
    """Compare user skill evaluations against career role requirements.

    Calculates weighted readiness percentage, gaps, and estimated weeks to readiness
    using the centralized unified intelligence profile.
    """
    from app.services.learner_service import get_unified_learner_profile
    unified = get_unified_learner_profile(db, user_id, target_career_role_id=career_role_id)
    ca = unified.get("career_alignment", {})

    verified_list = ca.get("verified_competencies", [])
    in_prog_list = ca.get("in_progress_competencies", [])
    unassessed_list = ca.get("missing_or_unassessed", [])

    return {
        "career": ca.get("career_name", "Software Engineer"),
        "career_role_id": ca.get("career_role_id", career_role_id),
        "readiness_score": ca.get("readiness_score", 0.0),
        "label": ca.get("readiness_label", "Novice"),
        "skills_verified": [(s if isinstance(s, str) else s.get("skill_name", "")) for s in verified_list],
        "skills_in_progress": [(s if isinstance(s, str) else s.get("skill_name", "")) for s in in_prog_list],
        "skills_missing": [(s if isinstance(s, str) else s.get("skill_name", "")) for s in unassessed_list],
        "verified_competencies": verified_list,
        "in_progress_competencies": in_prog_list,
        "unassessed_competencies": unassessed_list,
        "estimated_weeks_to_ready": ca.get("estimated_weeks", 10),
        "is_diagnostic_pending": unified.get("is_diagnostic_pending", False),
        "disclaimer": "This score is computed directly from verified diagnostic assessments.",
    }
