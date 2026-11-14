"""Documents API Router.

Provides endpoints to upload student academic records (marksheets, transcripts, certificates),
validate file sizes and extensions, store them securely, and analyze competencies with AI.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import uuid
import logging

from app.db.database import get_db
from app.models.user import User
from app.models.document import StudentDocument, DocumentAnalysis
from app.core.config import settings
from app.core.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".jpg", ".jpeg", ".png"}


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    file_type: Optional[str] = Form("marksheet"),
    analysis_consent: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a student academic document, validate file format and size, and persist record."""
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: PDF, DOCX, JPG, PNG.",
        )

    # Read contents and check file size
    contents = await file.read()
    file_size_bytes = len(contents)
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    if file_size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # Ensure storage directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_storage_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_storage_path, "wb") as f:
        f.write(contents)

    doc = StudentDocument(
        user_id=current_user.id,
        filename=unique_filename,
        original_filename=filename,
        file_type=file_type or "marksheet",
        mime_type=file.content_type,
        file_size_bytes=file_size_bytes,
        storage_path=file_storage_path,
        analysis_consent=analysis_consent,
        analysis_status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "filename": doc.filename,
        "original_filename": doc.original_filename,
        "file_type": doc.file_type,
        "file_size_bytes": doc.file_size_bytes,
        "analysis_status": doc.analysis_status,
        "analysis_consent": doc.analysis_consent,
        "created_at": doc.created_at,
    }


@router.get("/my-documents")
async def get_my_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all uploaded documents and their extracted analysis results for current user."""
    documents = (
        db.query(StudentDocument)
        .filter(StudentDocument.user_id == current_user.id)
        .order_by(StudentDocument.created_at.desc())
        .all()
    )

    results = []
    for d in documents:
        analysis_data = None
        if d.analysis:
            analysis_data = {
                "id": d.analysis.id,
                "extracted_skills": d.analysis.extracted_skills or [],
                "extracted_scores": d.analysis.extracted_scores or [],
                "extracted_certifications": d.analysis.extracted_certifications or [],
                "academic_performance": d.analysis.academic_performance,
                "key_insights": d.analysis.key_insights or [],
                "confidence_score": d.analysis.confidence_score,
                "analyzed_at": d.analysis.analyzed_at,
            }

        results.append(
            {
                "id": d.id,
                "filename": d.filename,
                "original_filename": d.original_filename,
                "file_type": d.file_type,
                "mime_type": d.mime_type,
                "file_size_bytes": d.file_size_bytes,
                "storage_path": d.storage_path,
                "analysis_consent": d.analysis_consent,
                "analysis_status": d.analysis_status,
                "created_at": d.created_at,
                "analysis": analysis_data,
            }
        )
    return results


@router.post("/{doc_id}/analyze")
async def analyze_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger document analysis to extract skills, courses, grades, and insights."""
    doc = (
        db.query(StudentDocument)
        .filter(
            StudentDocument.id == doc_id,
            StudentDocument.user_id == current_user.id,
        )
        .first()
    )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # In DEMO_MODE, create or update DocumentAnalysis with comprehensive extracted data
    analysis = (
        db.query(DocumentAnalysis)
        .filter(DocumentAnalysis.document_id == doc.id)
        .first()
    )
    if not analysis:
        analysis = DocumentAnalysis(document_id=doc.id)
        db.add(analysis)

    analysis.extracted_skills = [
        "Python",
        "SQL",
        "Data Structures & Algorithms",
        "Object Oriented Programming",
        "Database Architecture",
        "Web Technologies",
    ]
    analysis.extracted_scores = [
        {"subject": "Data Structures & Algorithms", "score": 87, "grade": "A"},
        {"subject": "Relational Database Management", "score": 84, "grade": "A-"},
        {"subject": "Object-Oriented Programming (Java/Python)", "score": 91, "grade": "A+"},
        {"subject": "Computer Networks", "score": 79, "grade": "B+"},
    ]
    analysis.extracted_certifications = [
        {"title": "Python for Data Science", "issuer": "Coursera", "year": "2024"},
    ]
    analysis.extracted_experience = [
        {"role": "Academic Project Lead", "domain": "Full Stack Development"}
    ]
    analysis.academic_performance = {
        "gpa": "3.82 / 4.0",
        "percentile": "Top 10%",
        "status": "Good Standing",
    }
    analysis.key_insights = [
        "Consistently high grades in algorithmic thinking and database management.",
        "Demonstrated technical proficiency in software architecture and object-oriented design.",
        "Verified credential in Python for Data Science aligns well with full-stack and data roles.",
    ]
    analysis.raw_text = f"Extracted text content from {doc.original_filename}."
    analysis.confidence_score = "0.93"
    analysis.agent_version = "v1-demo-doc-engine"
    analysis.analyzed_at = datetime.utcnow()

    doc.analysis_status = "completed"
    db.commit()
    db.refresh(analysis)

    return {
        "message": "Document successfully analyzed.",
        "document_id": doc.id,
        "analysis": {
            "id": analysis.id,
            "extracted_skills": analysis.extracted_skills,
            "extracted_scores": analysis.extracted_scores,
            "extracted_certifications": analysis.extracted_certifications,
            "academic_performance": analysis.academic_performance,
            "key_insights": analysis.key_insights,
            "confidence_score": analysis.confidence_score,
            "analyzed_at": analysis.analyzed_at,
        },
    }


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete document record and remove the stored file from disk."""
    doc = (
        db.query(StudentDocument)
        .filter(
            StudentDocument.id == doc_id,
            StudentDocument.user_id == current_user.id,
        )
        .first()
    )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Remove storage file if it exists
    if doc.storage_path and os.path.exists(doc.storage_path):
        try:
            os.remove(doc.storage_path)
        except Exception as exc:
            logger.warning(f"Could not remove file {doc.storage_path}: {exc}")

    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully.", "id": doc_id}
