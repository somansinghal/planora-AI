"""
Planora AI – Application Configuration

Reads configuration from environment variables.
All secrets must be set via environment variables, never hardcoded.
"""

import os
from pathlib import Path
from typing import List
from functools import lru_cache

try:
    from dotenv import load_dotenv
    # Load backend/.env if present; fallback to standard search without overriding existing env
    _backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
    if _backend_env.is_file():
        load_dotenv(dotenv_path=_backend_env, override=False)
    else:
        load_dotenv(override=False)
except ImportError:
    pass


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
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "planora-ai-india")
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

    @property
    def is_ai_configured(self) -> bool:
        """Checks if a valid, non-placeholder Groq API key is present."""
        return bool(
            self.GROQ_API_KEY
            and self.GROQ_API_KEY.startswith("gsk_")
            and not self.GROQ_API_KEY.startswith("gsk_example")
            and len(self.GROQ_API_KEY) > 20
        )

    @property
    def is_firebase_admin_configured(self) -> bool:
        """Checks if service account path or ADC credentials exist."""
        if self.FIREBASE_ADMIN_CREDENTIALS and os.path.exists(self.FIREBASE_ADMIN_CREDENTIALS):
            return True
        return bool(os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or (self.ENVIRONMENT == "production" and not self.FIREBASE_ADMIN_CREDENTIALS))

    def validate(self):
        """Validate required and optional configuration at startup with actionable error messages."""
        import logging
        logger = logging.getLogger(__name__)

        diagnostics = []

        if not self.FIREBASE_PROJECT_ID:
            diagnostics.append(
                "CRITICAL: FIREBASE_PROJECT_ID is missing. Configure in backend/.env or server environment variables."
            )

        if not self.is_ai_configured:
            if self.ENVIRONMENT == "production":
                diagnostics.append(
                    "WARNING: GROQ_API_KEY is not configured or is a placeholder in production. AI plan generation and Copilot endpoints will fail gracefully."
                )
            else:
                logger.info(
                    "[Config] GROQ_API_KEY is unset or placeholder. Real AI calls disabled; mock copilot and demo mode active."
                )

        if not self.is_firebase_admin_configured and self.ENVIRONMENT == "production":
            diagnostics.append(
                "WARNING: FIREBASE_ADMIN_CREDENTIALS_PATH is missing or path does not exist. Server-side token verification will fall back to ADC or fail."
            )

        for diag in diagnostics:
            logger.warning(f"[Config Validation] {diag}")

        return diagnostics


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Validate on import (log warnings, never crash in development)
_config_errors = settings.validate()
