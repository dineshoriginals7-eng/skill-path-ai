import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class SkillEvaluation(Base):
    __tablename__ = "skill_evaluations"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String, ForeignKey("skill_catalog.id"), nullable=True, index=True)
    skill_name = Column(String(255), nullable=False)
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=True)

    proficiency_level = Column(String(50), nullable=True)   # not_assessed | beginner | intermediate | advanced | expert
    score_percentage = Column(Float, nullable=True)
    strength_level = Column(String(50), nullable=True)      # strong | intermediate | weak | critical_weakness
    weakness_areas = Column(JSON, default=list)
    strength_areas = Column(JSON, default=list)
    learning_priority = Column(String(50), default="medium")  # critical | high | medium | low
    evidence = Column(JSON, default=list)  # List of evidence items (question ids, notes)
    notes = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_evaluations")
    skill = relationship("SkillCatalog", back_populates="evaluations")
    history = relationship("SkillHistory", back_populates="evaluation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SkillEval {self.skill_name} user={self.user_id}>"


class SkillHistory(Base):
    __tablename__ = "skill_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    evaluation_id = Column(String, ForeignKey("skill_evaluations.id", ondelete="CASCADE"), nullable=False, index=True)
    score_percentage = Column(Float, nullable=True)
    proficiency_level = Column(String(50), nullable=True)
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=True)
    snapshot_reason = Column(String(255), nullable=True)  # initial | module_complete | reassessment
    recorded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    evaluation = relationship("SkillEvaluation", back_populates="history")

    def __repr__(self):
        return f"<SkillHistory eval={self.evaluation_id} score={self.score_percentage}>"
