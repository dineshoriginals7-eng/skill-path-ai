import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(String, ForeignKey("career_roles.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    total_modules = Column(Integer, default=0)
    completed_modules = Column(Integer, default=0)
    overall_progress = Column(Float, default=0.0)  # 0.0 - 100.0
    ai_generated = Column(Boolean, default=True)
    generation_basis = Column(JSON, nullable=True)  # What data was used to generate
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="roadmaps")
    modules = relationship("LearningModule", back_populates="roadmap", cascade="all, delete-orphan", order_by="LearningModule.order_index")

    def __repr__(self):
        return f"<Roadmap {self.title} user={self.user_id}>"


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(String, primary_key=True, default=gen_uuid)
    roadmap_id = Column(String, ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String, ForeignKey("skill_catalog.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    learning_objectives = Column(JSON, default=list)
    topics = Column(JSON, default=list)
    resources = Column(JSON, default=list)  # [{type, title, url, description}, ...]
    exercises = Column(JSON, default=list)
    mini_project = Column(JSON, nullable=True)
    order_index = Column(Integer, default=0)
    estimated_hours = Column(Float, nullable=True)
    difficulty = Column(String(50), default="beginner")
    status = Column(String(50), default="locked")  # locked | available | in_progress | completed
    is_prerequisite_met = Column(Boolean, default=False)
    prerequisite_module_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    roadmap = relationship("LearningRoadmap", back_populates="modules")
    progress = relationship("LearningProgress", back_populates="module", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Module {self.title} roadmap={self.roadmap_id}>"


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String, primary_key=True, default=gen_uuid)
    module_id = Column(String, ForeignKey("learning_modules.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="not_started")  # not_started | in_progress | completed
    progress_percentage = Column(Float, default=0.0)
    time_spent_minutes = Column(Integer, default=0)
    resources_viewed = Column(JSON, default=list)
    exercises_completed = Column(JSON, default=list)
    assessment_score = Column(Float, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    module = relationship("LearningModule", back_populates="progress")

    def __repr__(self):
        return f"<Progress module={self.module_id} user={self.user_id}>"
