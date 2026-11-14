import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    skill_requirements = relationship("CareerSkillRequirement", back_populates="career_role", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CareerRole {self.name}>"


class SkillCatalog(Base):
    __tablename__ = "skill_catalog"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(255), unique=True, nullable=False)
    category = Column(String(100), nullable=True)  # Programming, Framework, Tool, Concept
    description = Column(Text, nullable=True)
    prerequisites = Column(JSON, default=list)  # List of skill IDs
    difficulty_level = Column(String(50), default="beginner")  # beginner | intermediate | advanced
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    career_requirements = relationship("CareerSkillRequirement", back_populates="skill", cascade="all, delete-orphan")
    evaluations = relationship("SkillEvaluation", back_populates="skill")

    def __repr__(self):
        return f"<Skill {self.name}>"


class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"

    id = Column(String, primary_key=True, default=gen_uuid)
    career_role_id = Column(String, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String, ForeignKey("skill_catalog.id", ondelete="CASCADE"), nullable=False, index=True)
    importance = Column(String(50), default="required")  # required | preferred | optional
    weight = Column(Float, default=1.0)  # Weight for readiness score calculation
    min_proficiency = Column(String(50), default="intermediate")  # beginner | intermediate | advanced

    # Relationships
    career_role = relationship("CareerRole", back_populates="skill_requirements")
    skill = relationship("SkillCatalog", back_populates="career_requirements")

    def __repr__(self):
        return f"<CareerSkillReq career={self.career_role_id} skill={self.skill_id}>"
