from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class StartAssessmentRequest(BaseModel):
    type: str = Field(default="diagnostic", description="diagnostic | practice | mastery | initial | module")
    mode: Optional[str] = None
    target_skills: Optional[List[str]] = None
    career_goal: Optional[str] = None
    target_difficulty: Optional[str] = None


class QuestionResponse(BaseModel):
    id: str
    type: str
    difficulty: str
    skill_name: str
    question_text: str
    code_snippet: Optional[str] = None
    options: Optional[List[Any]] = None
    test_cases: Optional[List[Any]] = None
    tags: Optional[List[str]] = None
    # Note: correct_answer is NOT included in the question response to prevent cheating

    class Config:
        from_attributes = True


class AssessmentResponse(BaseModel):
    id: str
    title: str
    type: str
    status: str
    target_skills: List[str]
    total_questions: int
    answered_questions: int
    score_percentage: Optional[float]
    questions: Optional[List[QuestionResponse]] = None
    time_started: Optional[datetime]
    time_completed: Optional[datetime]
    ai_analysis: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


class SubmitAnswerRequest(BaseModel):
    question_id: str
    user_answer: str
    time_taken_seconds: Optional[int] = None


class AnswerResult(BaseModel):
    question_id: str
    is_correct: bool
    score: float
    max_score: float
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    ai_feedback: Optional[str] = None
    test_case_results: Optional[List[Dict[str, Any]]] = None
    rubric_evaluation: Optional[Dict[str, Any]] = None


class CompleteAssessmentResponse(BaseModel):
    assessment_id: str
    attempt_id: str
    score_percentage: float
    correct_count: int
    incorrect_count: int
    skipped_count: int
    skill_scores: List[Any]
    recommendations: List[str]
    next_steps: List[str]
    ai_analysis: Optional[Any]
