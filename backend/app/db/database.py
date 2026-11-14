from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.effective_database_url

# SQLite needs connect_args for thread safety
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Ensure directory exists for sqlite file if needed
    try:
        if db_url.startswith("sqlite:////"):
            db_path = db_url[10:]
            dir_name = os.path.dirname(db_path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
        elif db_url.startswith("sqlite:///"):
            db_path = db_url[10:]
            dir_name = os.path.dirname(db_path)
            if dir_name and not dir_name.startswith("."):
                os.makedirs(dir_name, exist_ok=True)
    except Exception as exc:
        logger.warning(f"Could not pre-create directory for SQLite: {exc}")

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=settings.APP_ENV == "development",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_db_initialized = False


def init_db():
    """Create all tables. Called at startup or on first request."""
    from app.models import (  # noqa: F401 — imports trigger model registration
        user,
        learner_profile,
        assessment,
        skill,
        roadmap,
        career,
        document,
        course,
        project,
        intelligence,
    )
    Base.metadata.create_all(bind=engine)


def ensure_db_initialized():
    """Ensure database tables and initial seed data exist before servicing requests.
    
    Protects against serverless runtimes (like Vercel) where ASGI lifespan events
    may be skipped or executed lazily.
    """
    global _db_initialized
    if not _db_initialized:
        try:
            init_db()
            from app.models.career import CareerRole
            db = SessionLocal()
            try:
                if db.query(CareerRole).count() == 0:
                    import sys
                    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
                    if backend_dir not in sys.path:
                        sys.path.append(backend_dir)
                    try:
                        import seed as seed_module
                        seed_module.seed()
                        logger.info("Database lazy initialization and seed completed successfully.")
                    except Exception as seed_err:
                        logger.warning(f"Could not complete seed during lazy init: {seed_err}")
            finally:
                db.close()
            _db_initialized = True
        except Exception as exc:
            logger.error(f"Error during ensure_db_initialized: {exc}")


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
