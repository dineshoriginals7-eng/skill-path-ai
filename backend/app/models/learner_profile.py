import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Float
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Personal & Academic
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    educational_qualification = Column(String(255), nullable=True)
    college_or_university = Column(String(255), nullable=True)
    academic_year = Column(String(50), nullable=True)
    department = Column(String(255), nullable=True)
    gpa_or_percentage = Column(String(50), nullable=True)

    # Skills & Experience
    current_technical_skills = Column(JSON, default=list)  # ["Python","SQL",...]
    previously_completed_courses = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    work_experience = Column(JSON, default=list)

    # Career
    career_aspirations = Column(Text, nullable=True)
    primary_career_goal = Column(String(255), nullable=True)
    target_career_role_id = Column(String, ForeignKey("career_roles.id"), nullable=True)

    # Onboarding
    onboarding_step = Column(Integer, default=1)  # 1-6
    onboarding_complete = Column(String(10), default="false")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    target_career = relationship("CareerRole", foreign_keys=[target_career_role_id])

    def __repr__(self):
        return f"<LearnerProfile user_id={self.user_id}>"


class Interest(Base):
    __tablename__ = "interests"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    is_primary = Column(String(10), default="false")
    source = Column(String(50), default="manual")  # manual | ai_discovered
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="interests")
    history = relationship("InterestHistory", back_populates="interest", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Interest {self.category} user={self.user_id}>"


class InterestHistory(Base):
    __tablename__ = "interest_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    interest_id = Column(String, ForeignKey("interests.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)  # added | removed | changed_primary
    previous_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interest = relationship("Interest", back_populates="history")
