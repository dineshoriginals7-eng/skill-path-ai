import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    provider = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    description = Column(Text, nullable=True)
    skill_tags = Column(JSON, default=list)
    difficulty = Column(String(50), default="beginner")
    duration_hours = Column(Float, nullable=True)
    is_free = Column(Boolean, default=True)
    thumbnail_url = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activities = relationship("CourseActivity", back_populates="course")

    def __repr__(self):
        return f"<Course {self.title}>"


class CourseActivity(Base):
    __tablename__ = "course_activity"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=True, index=True)
    course_title = Column(String(500), nullable=False)  # In case external course
    provider = Column(String(255), nullable=True)
    status = Column(String(50), default="started")  # started | in_progress | completed | abandoned
    completion_percentage = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    certificate_url = Column(String(1000), nullable=True)
    source = Column(String(50), default="manual")  # manual | document_extracted | platform

    # Relationships
    user = relationship("User", back_populates="course_activities")
    course = relationship("Course", back_populates="activities")

    def __repr__(self):
        return f"<CourseActivity {self.course_title} user={self.user_id}>"


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list)
    github_url = Column(String(1000), nullable=True)
    live_url = Column(String(1000), nullable=True)
    status = Column(String(50), default="in_progress")  # planned | in_progress | completed
    skills_demonstrated = Column(JSON, default=list)
    source = Column(String(50), default="manual")  # manual | document_extracted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    evaluation = relationship("ProjectEvaluation", back_populates="project", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.title} user={self.user_id}>"


class ProjectEvaluation(Base):
    __tablename__ = "project_evaluations"

    id = Column(String, primary_key=True, default=gen_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    code_quality_score = Column(Float, nullable=True)
    complexity_score = Column(Float, nullable=True)
    skills_verified = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    overall_feedback = Column(Text, nullable=True)
    evaluated_by = Column(String(50), default="ai")  # ai | admin
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="evaluation")

    def __repr__(self):
        return f"<ProjectEval project={self.project_id}>"
