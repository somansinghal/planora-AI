"""
Planora AI – Application Configuration

Reads configuration from environment variables.
All secrets must be set via environment variables, never hardcoded.
"""

import os
from typing import List
from functools import lru_cache


class Settings:
    """Application settings loaded from environment variables."""

    # ── Application ──────────────────────────────────────────
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # ── CORS ─────────────────────────────────────────────────
    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins_str = os.getenv(
            "CORS_ORIGINS",
            "https://planora-ai-india.vercel.app,http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500,http://127.0.0.1:3000"
        )
        return [o.strip() for o in origins_str.split(",") if o.strip()]

    # ── Firebase Admin ────────────────────────────────────────
    # NEVER expose these in frontend code
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "planora-ai")
    FIREBASE_ADMIN_CREDENTIALS: str = os.getenv("FIREBASE_ADMIN_CREDENTIALS_PATH", "")

    # ── AI Provider ───────────────────────────────────────────
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq")
    AI_MODEL: str = os.getenv("AI_MODEL", "llama-3.1-8b-instant")
    # GROQ_API_KEY must be set in environment, never in code
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AI_REQUEST_TIMEOUT: int = int(os.getenv("AI_REQUEST_TIMEOUT", "60"))
    AI_MAX_TOKENS: int = int(os.getenv("AI_MAX_TOKENS", "4000"))
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.7"))

    # ── Rate Limiting ─────────────────────────────────────────
    AI_REQUESTS_PER_USER_PER_HOUR: int = int(os.getenv("AI_REQUESTS_PER_USER_PER_HOUR", "20"))
    MAX_REQUEST_SIZE_BYTES: int = int(os.getenv("MAX_REQUEST_SIZE_BYTES", str(1024 * 1024)))  # 1MB

    # ── Pagination ────────────────────────────────────────────
    DEFAULT_PAGE_SIZE: int = int(os.getenv("DEFAULT_PAGE_SIZE", "50"))
    MAX_PAGE_SIZE: int = int(os.getenv("MAX_PAGE_SIZE", "200"))

    def validate(self):
        """Validate required configuration at startup."""
        errors = []

        if not self.FIREBASE_PROJECT_ID:
            errors.append("FIREBASE_PROJECT_ID is required")

        if self.ENVIRONMENT == "production":
            if not self.GROQ_API_KEY:
                errors.append("GROQ_API_KEY is required in production")
            if not self.FIREBASE_ADMIN_CREDENTIALS:
                errors.append("FIREBASE_ADMIN_CREDENTIALS_PATH is required in production")

        if errors:
            import logging
            logger = logging.getLogger(__name__)
            for err in errors:
                logger.warning(f"[Config] Missing: {err}")

        return errors


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Validate on import (log warnings, don't crash in development)
_config_errors = settings.validate()
