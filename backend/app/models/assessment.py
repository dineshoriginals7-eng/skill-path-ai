import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50), default="initial")  # initial | module | reassessment | practice
    status = Column(String(50), default="pending")  # pending | in_progress | completed | abandoned
    target_skills = Column(JSON, default=list)  # List of skill names being assessed
    difficulty = Column(String(50), default="adaptive")
    total_questions = Column(Integer, default=0)
    answered_questions = Column(Integer, default=0)
    score_percentage = Column(Float, nullable=True)
    time_started = Column(DateTime, nullable=True)
    time_completed = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    ai_analysis = Column(JSON, nullable=True)  # AI-generated post-assessment analysis
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="assessments")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Assessment {self.title} user={self.user_id}>"


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    skill_id = Column(String, ForeignKey("skill_catalog.id"), nullable=True, index=True)
    skill_name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # mcq | output_prediction | debugging | coding | conceptual | scenario
    difficulty = Column(String(50), nullable=False)  # beginner | intermediate | advanced
    question_text = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    options = Column(JSON, nullable=True)  # For MCQ: [{"id": "a", "text": "..."}, ...]
    correct_answer = Column(Text, nullable=True)  # For MCQ: option id; For coding: expected output
    test_cases = Column(JSON, nullable=True)  # For coding challenges
    explanation = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    source = Column(String(50), default="ai_generated")  # ai_generated | manual | bank
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    answers = relationship("AssessmentAnswer", back_populates="question")

    def __repr__(self):
        return f"<Question {self.type} skill={self.skill_name}>"


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String, primary_key=True, default=gen_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_number = Column(Integer, default=1)
    score_percentage = Column(Float, nullable=True)
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, nullable=True)
    status = Column(String(50), default="in_progress")  # in_progress | completed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Attempt assessment={self.assessment_id} #{self.attempt_number}>"


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(String, primary_key=True, default=gen_uuid)
    attempt_id = Column(String, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False, index=True)
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=1.0)
    time_taken_seconds = Column(Integer, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    answered_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("Question", back_populates="answers")

    def __repr__(self):
        return f"<Answer attempt={self.attempt_id} q={self.question_id}>"
