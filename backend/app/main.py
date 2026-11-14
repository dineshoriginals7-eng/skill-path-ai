"""SkillPath AI - FastAPI Application Entrypoint.

Initializes the application, configures CORS middleware, mounts static upload
directories, registers all API routers, provisions database tables on startup,
and seeds initial career catalog data and skill requirements.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import init_db, SessionLocal
from app.models.career import CareerRole, SkillCatalog, CareerSkillRequirement
from app.models.user import User
from app.models.learner_profile import LearnerProfile

# Import all API routers
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.assessment import router as assessment_router
from app.api.skills import router as skills_router
from app.api.roadmap import router as roadmap_router
from app.api.mentor import router as mentor_router
from app.api.documents import router as documents_router
from app.api.intelligence import router as intelligence_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillpath.main")


def seed_database():
    """Seed initial career roles, skill catalog items, mappings, and admin user."""
    db = SessionLocal()
    try:
        # 1. Seed Admin User
        admin_email = settings.ADMIN_EMAIL.lower().strip()
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            logger.info(f"Seeding default administrator account: {admin_email}")
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="SkillPath Administrator",
                is_active=True,
                is_admin=True,
                is_verified=True,
            )
            db.add(admin)
            db.flush()
            admin_profile = LearnerProfile(
                user_id=admin.id,
                onboarding_step=6,
                onboarding_complete="true",
            )
            db.add(admin_profile)
            db.commit()

        # 2. Check if Career Roles exist
        if db.query(CareerRole).count() == 0:
            logger.info("Seeding career roles catalog...")
            career_roles_data = [
                {"name": "Full Stack Developer", "category": "Engineering", "icon": "code", "description": "Builds both client-side and server-side software."},
                {"name": "Frontend Developer", "category": "Engineering", "icon": "layout", "description": "Crafts responsive, engaging user interfaces."},
                {"name": "Backend Developer", "category": "Engineering", "icon": "server", "description": "Architects robust APIs, microservices, and databases."},
                {"name": "Data Scientist", "category": "Data", "icon": "bar-chart-2", "description": "Transforms raw datasets into predictive insights and models."},
                {"name": "Machine Learning Engineer", "category": "AI/ML", "icon": "cpu", "description": "Researches, trains, and deploys production machine learning systems."},
                {"name": "Mobile Developer", "category": "Engineering", "icon": "smartphone", "description": "Develops native and cross-platform mobile apps."},
                {"name": "DevOps Engineer", "category": "Operations", "icon": "cloud-lightning", "description": "Automates CI/CD pipelines and infrastructure reliability."},
                {"name": "UI/UX Designer", "category": "Design", "icon": "pen-tool", "description": "Designs intuitive user journeys, wireframes, and prototypes."},
                {"name": "Cybersecurity Analyst", "category": "Security", "icon": "shield", "description": "Safeguards systems, networks, and data from cyber threats."},
                {"name": "Cloud Engineer", "category": "Cloud", "icon": "cloud", "description": "Manages scalable cloud infrastructure and serverless services."},
            ]

            role_instances = {}
            for r in career_roles_data:
                role_obj = CareerRole(
                    name=r["name"],
                    category=r["category"],
                    icon=r["icon"],
                    description=r["description"],
                    is_active=True,
                )
                db.add(role_obj)
                db.flush()
                role_instances[r["name"]] = role_obj

            # 3. Seed Skill Catalog (at least 20 skills)
            logger.info("Seeding skill catalog...")
            skills_catalog_data = [
                ("Python", "Programming", "Versatile high-level programming language", "beginner"),
                ("JavaScript", "Programming", "Language of the web for client and server", "beginner"),
                ("TypeScript", "Programming", "Typed superset of JavaScript", "intermediate"),
                ("Java", "Programming", "Object-oriented, class-based language", "intermediate"),
                ("C++", "Programming", "High-performance systems programming language", "advanced"),
                ("SQL", "Database", "Declarative language for relational databases", "beginner"),
                ("HTML", "Frontend", "Standard markup language for documents on the web", "beginner"),
                ("CSS", "Frontend", "Style sheet language for presentation design", "beginner"),
                ("React", "Framework", "Component-based UI library for web interfaces", "intermediate"),
                ("Vue.js", "Framework", "Progressive framework for building user interfaces", "intermediate"),
                ("Angular", "Framework", "TypeScript-based open-source web application platform", "intermediate"),
                ("Node.js", "Backend", "Asynchronous event-driven JavaScript runtime", "intermediate"),
                ("Express.js", "Framework", "Fast, unopinionated minimalist web framework for Node.js", "intermediate"),
                ("FastAPI", "Framework", "Modern high-performance web framework for Python APIs", "intermediate"),
                ("Django", "Framework", "High-level Python web framework with battery-included philosophy", "intermediate"),
                ("Machine Learning", "AI/ML", "Algorithms that learn patterns from datasets", "intermediate"),
                ("Deep Learning", "AI/ML", "Neural network architectures with multiple hidden layers", "advanced"),
                ("Data Analysis", "AI/ML", "Cleaning, exploring, and deriving insights from data", "beginner"),
                ("Statistics", "Concept", "Mathematical study of data collection, analysis and interpretation", "intermediate"),
                ("Git", "Tool", "Distributed version control system for source code", "beginner"),
                ("Docker", "DevOps", "OS-level virtualization delivering containerized applications", "intermediate"),
                ("AWS", "Cloud", "Comprehensive cloud computing platform by Amazon", "intermediate"),
                ("MongoDB", "Database", "Document-oriented NoSQL database program", "intermediate"),
                ("PostgreSQL", "Database", "Powerful open source object-relational database system", "intermediate"),
                ("Figma", "Design", "Collaborative interface design and prototyping tool", "beginner"),
                ("TensorFlow", "AI/ML", "End-to-end open source platform for machine learning", "advanced"),
                ("Pandas", "AI/ML", "Fast, powerful and flexible data analysis library for Python", "beginner"),
                ("NumPy", "AI/ML", "Fundamental package for scientific computing with Python", "beginner"),
            ]

            skill_instances = {}
            for name, cat, desc, diff in skills_catalog_data:
                skill_obj = SkillCatalog(
                    name=name,
                    category=cat,
                    description=desc,
                    difficulty_level=diff,
                    is_active=True,
                )
                db.add(skill_obj)
                db.flush()
                skill_instances[name] = skill_obj

            # 4. Seed Career Skill Requirements Mappings
            logger.info("Mapping career role requirements...")
            mappings = [
                # Full Stack Developer
                ("Full Stack Developer", "HTML", "required", 1.0, "beginner"),
                ("Full Stack Developer", "CSS", "required", 1.0, "beginner"),
                ("Full Stack Developer", "JavaScript", "required", 1.5, "intermediate"),
                ("Full Stack Developer", "React", "required", 1.3, "intermediate"),
                ("Full Stack Developer", "Node.js", "required", 1.3, "intermediate"),
                ("Full Stack Developer", "SQL", "required", 1.0, "intermediate"),
                ("Full Stack Developer", "Git", "required", 0.8, "beginner"),
                # Data Scientist
                ("Data Scientist", "Python", "required", 1.5, "intermediate"),
                ("Data Scientist", "Statistics", "required", 1.3, "intermediate"),
                ("Data Scientist", "Machine Learning", "required", 1.5, "advanced"),
                ("Data Scientist", "Pandas", "required", 1.0, "intermediate"),
                ("Data Scientist", "NumPy", "required", 1.0, "intermediate"),
                ("Data Scientist", "SQL", "required", 1.0, "intermediate"),
                # Machine Learning Engineer
                ("Machine Learning Engineer", "Python", "required", 1.5, "advanced"),
                ("Machine Learning Engineer", "Machine Learning", "required", 1.5, "advanced"),
                ("Machine Learning Engineer", "Deep Learning", "required", 1.3, "advanced"),
                ("Machine Learning Engineer", "TensorFlow", "required", 1.0, "intermediate"),
                ("Machine Learning Engineer", "Statistics", "required", 1.2, "intermediate"),
            ]

            for role_name, skill_name, importance, weight, min_prof in mappings:
                role_ref = role_instances.get(role_name)
                skill_ref = skill_instances.get(skill_name)
                if role_ref and skill_ref:
                    req_entry = CareerSkillRequirement(
                        career_role_id=role_ref.id,
                        skill_id=skill_ref.id,
                        importance=importance,
                        weight=weight,
                        min_proficiency=min_prof,
                    )
                    db.add(req_entry)

            db.commit()
            logger.info("Successfully seeded career roles, skill catalog, and requirements.")
    except Exception as exc:
        logger.error(f"Error during database startup seed: {exc}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup preparation and graceful shutdown."""
    logger.info("Executing SkillPath AI startup routines...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    init_db()
    seed_database()
    yield
    logger.info("SkillPath AI application shutting down.")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Adaptive AI-driven learning pathway and career navigation backend engine.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static media files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(assessment_router)
app.include_router(skills_router)
app.include_router(roadmap_router)
app.include_router(mentor_router)
app.include_router(documents_router)
app.include_router(intelligence_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": settings.LLM_PROVIDER,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root metadata endpoint with status, version, and documentation link."""
    return {
        "status": "online",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs",
    }
