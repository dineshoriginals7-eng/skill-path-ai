from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.assessment import router as assessment_router
from app.api.skills import router as skills_router
from app.api.roadmap import router as roadmap_router
from app.api.mentor import router as mentor_router
from app.api.documents import router as documents_router
from app.api.intelligence import router as intelligence_router

__all__ = [
    "auth_router",
    "profile_router",
    "assessment_router",
    "skills_router",
    "roadmap_router",
    "mentor_router",
    "documents_router",
    "intelligence_router",
]
