import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class StudentDocument(Base):
    __tablename__ = "student_documents"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=True)  # marksheet | resume | certificate | report | other
    mime_type = Column(String(100), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    storage_path = Column(String(1000), nullable=False)
    analysis_consent = Column(Boolean, default=False)
    analysis_status = Column(String(50), default="pending")  # pending | processing | completed | failed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="documents")
    analysis = relationship("DocumentAnalysis", back_populates="document", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document {self.original_filename} user={self.user_id}>"


class DocumentAnalysis(Base):
    __tablename__ = "document_analysis"

    id = Column(String, primary_key=True, default=gen_uuid)
    document_id = Column(String, ForeignKey("student_documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    extracted_skills = Column(JSON, default=list)
    extracted_scores = Column(JSON, default=list)  # [{subject, score, grade}, ...]
    extracted_certifications = Column(JSON, default=list)
    extracted_experience = Column(JSON, default=list)
    academic_performance = Column(JSON, nullable=True)  # Overall GPA, ranking, etc.
    key_insights = Column(JSON, default=list)  # AI-generated bullet points
    raw_text = Column(Text, nullable=True)
    confidence_score = Column(String(10), nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    agent_version = Column(String(50), nullable=True)

    # Relationships
    document = relationship("StudentDocument", back_populates="analysis")

    def __repr__(self):
        return f"<DocumentAnalysis doc={self.document_id}>"
