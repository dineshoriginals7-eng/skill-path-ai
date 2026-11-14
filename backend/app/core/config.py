from pydantic_settings import BaseSettings
from typing import List
import json
import os
import tempfile


class Settings(BaseSettings):
    APP_NAME: str = "SkillPath AI"
    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "sqlite:///./skillpath.db"

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    DEMO_MODE: bool = True
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "demo"

    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    ADMIN_EMAIL: str = "admin@skillpath.ai"
    ADMIN_PASSWORD: str = "AdminPass@123"

    @property
    def is_vercel(self) -> bool:
        """Detect whether running in Vercel Serverless environment."""
        return bool(
            os.environ.get("VERCEL")
            or os.environ.get("VERCEL_ENV")
            or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
        )

    @property
    def is_readonly_fs(self) -> bool:
        """Check if current working directory is read-only."""
        if self.is_vercel:
            return True
        try:
            testfile = os.path.join(".", ".perm_check")
            with open(testfile, "w") as f:
                f.write("test")
            os.remove(testfile)
            return False
        except Exception:
            return True

    @property
    def effective_database_url(self) -> str:
        """Return the database connection string, safely resolving Vercel/serverless environments."""
        url = self.DATABASE_URL
        # Normalize legacy postgres:// to postgresql:// (e.g. from Supabase / Heroku / Neon)
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)

        # In read-only or Vercel serverless environments with default SQLite, fallback to /tmp
        if (self.is_vercel or self.is_readonly_fs) and (url.startswith("sqlite:///.") or url == "sqlite:///skillpath.db"):
            tmp_dir = tempfile.gettempdir()
            return f"sqlite:///{os.path.join(tmp_dir, 'skillpath.db')}"

        return url

    @property
    def effective_upload_dir(self) -> str:
        """Return writable upload directory path for local or serverless environments."""
        if self.is_vercel or self.is_readonly_fs:
            tmp_uploads = os.path.join(tempfile.gettempdir(), "uploads")
            return tmp_uploads
        return self.UPLOAD_DIR

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            origins = json.loads(self.CORS_ORIGINS)
            if isinstance(origins, list):
                return origins
            return [str(origins)]
        except Exception:
            return ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
