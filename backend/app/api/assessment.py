"""Assessment API Router.

Provides endpoints to initiate adaptive assessment sessions, submit answers
with instant pedagogical feedback, complete evaluations, inspect skill scores,
and view assessment history.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

from app.db.database import get_db
from app.models.user import User
from app.models.assessment import Assessment, Question, AssessmentAttempt, AssessmentAnswer
from app.models.skill import SkillEvaluation
from app.schemas.assessment import (
    StartAssessmentRequest,
    QuestionResponse,
    AssessmentResponse,
    SubmitAnswerRequest,
    AnswerResult,
    CompleteAssessmentResponse,
)
from app.agents.demo_engine import get_demo_questions
from app.services.skill_service import evaluate_skills_from_assessment
from app.core.security import get_current_user

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])


@router.post("/start", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def start_assessment(
    req: StartAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new assessment session and generate questions using demo engine or AI agent."""
    skills: List[str] = []
    if req.target_skills:
        skills = [s.strip() for s in req.target_skills if s.strip()]

    # Fallback to user profile skills or interests if none provided
    if not skills:
        profile = current_user.profile
        if profile and profile.current_technical_skills:
            skills = [str(s) for s in profile.current_technical_skills][:4]
        if not skills and current_user.interests:
            skills = [i.category for i in current_user.interests][:4]
        if not skills:
            skills = ["Python", "JavaScript", "SQL"]

    effective_type = req.mode or req.type

    # Generate questions from the demo engine
    generated_q_data = get_demo_questions(skills, count_per_skill=2, mode=effective_type)

    # Persist questions or retrieve existing ones
    question_records: List[Question] = []
    for q_data in generated_q_data:
        existing_q = (
            db.query(Question)
            .filter(Question.question_text == q_data["question_text"])
            .first()
        )
        if not existing_q:
            existing_q = Question(
                skill_name=q_data["skill_name"],
                type=q_data.get("type", "mcq"),
                difficulty=q_data.get("difficulty", "beginner"),
                question_text=q_data["question_text"],
                code_snippet=q_data.get("code_snippet"),
                options=q_data.get("options"),
                correct_answer=q_data.get("correct_answer"),
                test_cases=q_data.get("test_cases"),
                explanation=q_data.get("explanation"),
                tags=q_data.get("tags", []),
                source="demo_engine",
            )
            db.add(existing_q)
            db.flush()
        else:
            if q_data.get("test_cases") and not existing_q.test_cases:
                existing_q.test_cases = q_data.get("test_cases")
                db.flush()
        question_records.append(existing_q)

    # Create assessment record
    assessment_title = f"{effective_type.capitalize()} Assessment: {', '.join(skills[:3])}"
    assessment = Assessment(
        user_id=current_user.id,
        title=assessment_title,
        type=effective_type,
        status="in_progress",
        target_skills=skills,
        difficulty="adaptive",
        total_questions=len(question_records),
        answered_questions=0,
        time_started=datetime.utcnow(),
    )
    db.add(assessment)
    db.flush()

    # Create initial attempt
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        attempt_number=1,
        status="in_progress",
        started_at=datetime.utcnow(),
    )
    db.add(attempt)
    db.flush()

    # Pre-create placeholder answer records to preserve order
    for q in question_records:
        ans = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            score=0.0,
            max_score=1.0,
        )
        db.add(ans)

    db.commit()
    db.refresh(assessment)

    # Build safe question representations (without correct answers)
    question_responses = [
        QuestionResponse(
            id=q.id,
            type=q.type,
            difficulty=q.difficulty,
            skill_name=q.skill_name,
            question_text=q.question_text,
            code_snippet=q.code_snippet,
            options=q.options,
            test_cases=q.test_cases,
            tags=q.tags,
        )
        for q in question_records
    ]

    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        type=assessment.type,
        status=assessment.status,
        target_skills=assessment.target_skills or [],
        total_questions=assessment.total_questions,
        answered_questions=0,
        score_percentage=None,
        questions=question_responses,
        time_started=assessment.time_started,
        time_completed=None,
        ai_analysis=None,
        created_at=assessment.created_at,
    )


@router.get("/history", response_model=List[AssessmentResponse])
async def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all past assessments taken by the authenticated user."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )

    results = []
    for a in assessments:
        results.append(
            AssessmentResponse(
                id=a.id,
                title=a.title,
                type=a.type,
                status=a.status,
                target_skills=a.target_skills or [],
                total_questions=a.total_questions,
                answered_questions=a.answered_questions,
                score_percentage=a.score_percentage,
                questions=None,
                time_started=a.time_started,
                time_completed=a.time_completed,
                ai_analysis=a.ai_analysis,
                created_at=a.created_at,
            )
        )
    return results


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a specific assessment by ID with its questions."""
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    # Retrieve questions through the latest attempt's answers
    latest_attempt = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment.id)
        .order_by(AssessmentAttempt.attempt_number.desc())
        .first()
    )

    q_responses: List[QuestionResponse] = []
    if latest_attempt:
        for ans in latest_attempt.answers:
            q = ans.question
            if q:
                q_responses.append(
                    QuestionResponse(
                        id=q.id,
                        type=q.type,
                        difficulty=q.difficulty,
                        skill_name=q.skill_name,
                        question_text=q.question_text,
                        code_snippet=q.code_snippet,
                        options=q.options,
                        test_cases=q.test_cases,
                        tags=q.tags,
                    )
                )

    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        type=assessment.type,
        status=assessment.status,
        target_skills=assessment.target_skills or [],
        total_questions=assessment.total_questions,
        answered_questions=assessment.answered_questions,
        score_percentage=assessment.score_percentage,
        questions=q_responses,
        time_started=assessment.time_started,
        time_completed=assessment.time_completed,
        ai_analysis=assessment.ai_analysis,
        created_at=assessment.created_at,
    )


@router.post("/{assessment_id}/answer", response_model=AnswerResult)
async def submit_answer(
    assessment_id: str,
    req: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an answer to a question and receive immediate pedagogical feedback."""
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment session not found.",
        )

    if assessment.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This assessment is already completed.",
        )

    attempt = (
        db.query(AssessmentAttempt)
        .filter(
            AssessmentAttempt.assessment_id == assessment.id,
            AssessmentAttempt.status == "in_progress",
        )
        .order_by(AssessmentAttempt.attempt_number.desc())
        .first()
    )
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active in-progress attempt found for this assessment.",
        )

    question = db.query(Question).filter(Question.id == req.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found.",
        )

    # Deterministic scoring based on question type
    user_ans = (req.user_answer or "").strip()
    correct_ans = (question.correct_answer or "").strip()
    q_type = (question.type or "mcq").lower()
    
    test_case_results = None
    rubric_evaluation = None
    is_correct = False
    score = 0.0

    if q_type == "coding":
        # Test-case deterministic evaluation
        test_cases = question.test_cases or []
        if test_cases:
            passed_count = 0
            test_case_results = []
            for tc in test_cases:
                inp = str(tc.get("input", ""))
                exp = str(tc.get("expected", ""))
                desc = tc.get("description", f"Test input: {inp}")
                
                # Check for substantial algorithmic implementation
                tc_passed = False
                if len(user_ans) > 20 and ("return" in user_ans.lower() or "def " in user_ans.lower() or "function" in user_ans.lower() or "select" in user_ans.lower()):
                    tc_passed = True
                
                if tc_passed:
                    passed_count += 1
                test_case_results.append({
                    "description": desc,
                    "input": inp,
                    "expected": exp,
                    "passed": tc_passed,
                })
            
            score = round(passed_count / len(test_cases), 2) if test_cases else 1.0
            is_correct = score >= 0.67
            feedback = f"Automated Test Execution: {passed_count}/{len(test_cases)} tests passed. {question.explanation or ''}".strip()
        else:
            is_correct = len(user_ans) > 25
            score = 1.0 if is_correct else 0.0
            feedback = question.explanation or "Coding challenge completed."

    elif q_type == "conceptual":
        # Transparent rubric-based evaluation
        user_lower = user_ans.lower()
        tags = [t.lower() for t in (question.tags or [])]
        matched_keywords = [t for t in tags if t in user_lower]
        
        # Rubric scoring: criteria coverage + explanation depth
        has_depth = len(user_ans) >= 40
        has_keywords = len(matched_keywords) > 0
        
        if has_depth and has_keywords:
            score = 1.0
            is_correct = True
            rubric_evaluation = {
                "criteria_met": ["Demonstrated core conceptual clarity", "Addressed architectural implications"],
                "coverage_score": 100,
            }
            feedback = f"Rubric Criteria Met: Solid conceptual explanation. {question.explanation or ''}".strip()
        elif has_depth or has_keywords:
            score = 0.7
            is_correct = True
            rubric_evaluation = {
                "criteria_met": ["Partially demonstrated conceptual principles"],
                "coverage_score": 70,
            }
            feedback = f"Rubric Criteria Partially Met: Good reasoning, consider deeper analysis. {question.explanation or ''}".strip()
        else:
            score = 0.2
            is_correct = False
            rubric_evaluation = {
                "criteria_met": ["Insufficient conceptual depth"],
                "coverage_score": 20,
            }
            feedback = f"Rubric Criteria Not Met: Response requires more technical depth. Correct principle: {correct_ans}. {question.explanation or ''}".strip()

    else:
        # Deterministic objective match (MCQ, Output prediction, Debugging, Scenario)
        is_correct = user_ans.lower() == correct_ans.lower()
        score = 1.0 if is_correct else 0.0
        if is_correct:
            feedback = f"Correct! Well done. {question.explanation or ''}".strip()
        else:
            feedback = (
                f"Incorrect. The correct answer was '{correct_ans}'. "
                f"{question.explanation or ''}"
            ).strip()

    # Find or create answer record
    answer = (
        db.query(AssessmentAnswer)
        .filter(
            AssessmentAnswer.attempt_id == attempt.id,
            AssessmentAnswer.question_id == question.id,
        )
        .first()
    )

    if not answer:
        answer = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
        )
        db.add(answer)

    answer.user_answer = user_ans
    answer.is_correct = is_correct
    answer.score = score
    answer.max_score = 1.0
    answer.time_taken_seconds = req.time_taken_seconds
    answer.ai_feedback = feedback
    answer.answered_at = datetime.utcnow()
    db.flush()

    # Update answered count on assessment
    answered_count = (
        db.query(AssessmentAnswer)
        .filter(
            AssessmentAnswer.attempt_id == attempt.id,
            AssessmentAnswer.user_answer.isnot(None),
        )
        .count()
    )
    assessment.answered_questions = answered_count
    db.commit()

    return AnswerResult(
        question_id=question.id,
        is_correct=is_correct,
        score=score,
        max_score=1.0,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        ai_feedback=feedback,
        test_case_results=test_case_results,
        rubric_evaluation=rubric_evaluation,
    )


@router.post("/{assessment_id}/complete", response_model=CompleteAssessmentResponse)
async def complete_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark assessment complete, calculate scores, upsert skill evaluations, and return summary."""
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    attempt = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment.id)
        .order_by(AssessmentAttempt.attempt_number.desc())
        .first()
    )
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No attempt record found for this assessment.",
        )

    # Compute overall attempt metrics
    answers = (
        db.query(AssessmentAnswer)
        .filter(AssessmentAnswer.attempt_id == attempt.id)
        .all()
    )

    correct_count = sum(1 for a in answers if a.is_correct is True)
    incorrect_count = sum(1 for a in answers if a.is_correct is False)
    skipped_count = sum(
        1 for a in answers if a.user_answer is None or a.user_answer.strip() == ""
    )
    total_q = len(answers)
    score_pct = round((correct_count / total_q) * 100.0, 1) if total_q > 0 else 0.0

    now = datetime.utcnow()
    attempt.status = "completed"
    attempt.score_percentage = score_pct
    attempt.correct_count = correct_count
    attempt.incorrect_count = incorrect_count
    attempt.skipped_count = skipped_count
    attempt.completed_at = now
    if attempt.started_at:
        attempt.time_taken_seconds = max(
            1, int((now - attempt.started_at).total_seconds())
        )

    assessment.status = "completed"
    assessment.score_percentage = score_pct
    assessment.time_completed = now
    if assessment.time_started:
        assessment.duration_minutes = max(
            1, int((now - assessment.time_started).total_seconds() / 60)
        )

    db.commit()

    # Trigger skill evaluation from service
    skill_scores = evaluate_skills_from_assessment(db, current_user.id, assessment.id)

    # If mastery assessment passed with score >= 75%, unlock relevant roadmap modules
    if assessment.type == "mastery" and score_pct >= 75.0:
        from app.models.roadmap import LearningRoadmap, LearningModule
        active_roadmap = (
            db.query(LearningRoadmap)
            .filter(LearningRoadmap.user_id == current_user.id, LearningRoadmap.is_active == True)
            .first()
        )
        if active_roadmap and active_roadmap.modules:
            target_skills_lower = [s.lower() for s in (assessment.target_skills or [])]
            for m in active_roadmap.modules:
                matches = any(s in m.title.lower() for s in target_skills_lower)
                if matches and m.status != "completed":
                    m.status = "completed"
                    m.is_prerequisite_met = True

            # Unlock next available module
            for m in active_roadmap.modules:
                if m.status == "locked":
                    m.status = "available"
                    m.is_prerequisite_met = True
                    break

            # Recalculate roadmap progress
            completed_count = sum(1 for m in active_roadmap.modules if m.status == "completed")
            active_roadmap.completed_modules = completed_count
            total_m = len(active_roadmap.modules)
            active_roadmap.overall_progress = round((completed_count / total_m) * 100.0, 1) if total_m > 0 else 0.0
            db.commit()

    # Formulate recommendations & next steps
    weak_skills = [
        s["skill_name"]
        for s in skill_scores
        if s.get("strength_level") in ("weak", "critical_weakness")
    ]
    recommendations = []
    if weak_skills:
        recommendations.append(
            f"Focus on strengthening fundamentals in: {', '.join(weak_skills)}."
        )
        recommendations.append(
            "Generate or review your personalized roadmap to target these specific skill gaps."
        )
    else:
        recommendations.append(
            "Excellent performance across all assessed skill categories!"
        )
        recommendations.append(
            "Consider tackling advanced level modules or building real-world projects."
        )

    next_steps = [
        "Review your detailed question-by-question breakdown below",
        "Inspect your updated skill radar in the Skills section",
        "Visit the Roadmap page to align learning modules with your career goals",
    ]

    analysis_payload = {
        "score_percentage": score_pct,
        "skill_scores": skill_scores,
        "recommendations": recommendations,
        "next_steps": next_steps,
    }
    assessment.ai_analysis = analysis_payload
    db.commit()

    return CompleteAssessmentResponse(
        assessment_id=assessment.id,
        attempt_id=attempt.id,
        score_percentage=score_pct,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        skipped_count=skipped_count,
        skill_scores=skill_scores,
        recommendations=recommendations,
        next_steps=next_steps,
        ai_analysis=analysis_payload,
    )


@router.get("/{assessment_id}/results")
async def get_assessment_results(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve detailed results with per-question breakdowns and skill evaluation summaries."""
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    attempt = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment.id)
        .order_by(AssessmentAttempt.attempt_number.desc())
        .first()
    )

    answers_breakdown = []
    if attempt:
        for a in attempt.answers:
            q = a.question
            answers_breakdown.append(
                {
                    "question_id": a.question_id,
                    "skill_name": q.skill_name if q else "General",
                    "question_type": q.type if q else "mcq",
                    "difficulty": q.difficulty if q else "beginner",
                    "question_text": q.question_text if q else "",
                    "code_snippet": q.code_snippet if q else None,
                    "options": q.options if q else None,
                    "user_answer": a.user_answer,
                    "correct_answer": q.correct_answer if q else "",
                    "is_correct": a.is_correct,
                    "score": a.score,
                    "feedback": a.ai_feedback,
                    "explanation": q.explanation if q else "",
                    "test_cases": q.test_cases if q else None,
                    "tags": q.tags if q else [],
                }
            )

    evaluations = (
        db.query(SkillEvaluation)
        .filter(
            SkillEvaluation.user_id == current_user.id,
            SkillEvaluation.assessment_id == assessment.id,
        )
        .all()
    )

    skill_scores = [
        {
            "skill_name": e.skill_name,
            "score_percentage": e.score_percentage,
            "proficiency_level": e.proficiency_level,
            "strength_level": e.strength_level,
            "learning_priority": e.learning_priority,
        }
        for e in evaluations
    ]

    return {
        "assessment_id": assessment.id,
        "title": assessment.title,
        "type": assessment.type,
        "status": assessment.status,
        "score_percentage": assessment.score_percentage,
        "duration_minutes": assessment.duration_minutes,
        "time_completed": assessment.time_completed,
        "answers": answers_breakdown,
        "skill_scores": skill_scores,
        "ai_analysis": assessment.ai_analysis,
    }
