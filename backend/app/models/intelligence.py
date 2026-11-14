import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class LearnerInsight(Base):
    __tablename__ = "learner_insights"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_type = Column(String(100), nullable=False)  # skill_strength | skill_weakness | improvement | pattern | recommendation
    category = Column(String(100), nullable=True)  # skill | learning_behavior | career | consistency
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSON, default=list)  # Data points supporting this insight
    priority = Column(String(50), default="medium")  # critical | high | medium | low
    is_active = Column(Boolean, default=True)
    agent = Column(String(100), nullable=True)  # Which agent generated this
    trigger = Column(String(100), nullable=True)  # event | periodic | manual
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="insights")

    def __repr__(self):
        return f"<Insight {self.insight_type} user={self.user_id}>"


class LearnerSnapshot(Base):
    __tablename__ = "learner_snapshots"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_type = Column(String(50), default="periodic")  # onboarding | event | periodic | manual
    overall_proficiency = Column(Float, nullable=True)
    career_readiness_score = Column(Float, nullable=True)
    strong_skills = Column(JSON, default=list)
    weak_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    assessments_completed = Column(JSON, nullable=True)
    courses_completed = Column(JSON, nullable=True)
    active_interests = Column(JSON, default=list)
    full_profile_json = Column(JSON, nullable=True)  # Complete serialized learner state
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Snapshot user={self.user_id} type={self.snapshot_type}>"


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_type = Column(String(100), nullable=False)  # skill | course | resource | roadmap_update
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    action_items = Column(JSON, default=list)
    reasoning = Column(Text, nullable=True)  # Why this was recommended
    status = Column(String(50), default="pending")  # pending | acknowledged | completed | dismissed
    agent = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Recommendation {self.recommendation_type} user={self.user_id}>"


class MentorConversation(Base):
    __tablename__ = "mentor_conversations"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String, nullable=False)  # Groups messages into sessions
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    context_snapshot = Column(JSON, nullable=True)  # Learner context at time of message
    tokens_used = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="mentor_conversations")

    def __repr__(self):
        return f"<MentorMsg {self.role} session={self.session_id}>"
