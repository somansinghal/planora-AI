"""
Planora AI – Logging Configuration

Structured, safe logging that avoids leaking sensitive data.
"""

import logging
import sys
import re
from app.core.config import settings

# Patterns for sensitive data that should never be logged
SENSITIVE_PATTERNS = [
    re.compile(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'),  # JWT tokens
    re.compile(r'password["\s]*[:=]["\s]*\S+', re.IGNORECASE),
    re.compile(r'api[_-]?key["\s]*[:=]["\s]*\S+', re.IGNORECASE),
    re.compile(r'secret["\s]*[:=]["\s]*\S+', re.IGNORECASE),
    re.compile(r'(?:AIza|ya29\.)[A-Za-z0-9_-]+'),  # Google API keys
]

REDACT_PLACEHOLDER = "[REDACTED]"


class SensitiveDataFilter(logging.Filter):
    """Filters out sensitive data from log messages."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self._redact(record.msg)
        return True

    def _redact(self, text: str) -> str:
        for pattern in SENSITIVE_PATTERNS:
            text = pattern.sub(REDACT_PLACEHOLDER, text)
        return text


def configure_logging():
    """Configure application-wide logging."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # Format
    if settings.ENVIRONMENT == "production":
        # JSON-like structured logging for production
        formatter = logging.Formatter(
            '{"time":"%(asctime)s","level":"%(levelname)s","name":"%(name)s","msg":"%(message)s"}'
        )
    else:
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)-8s %(name)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    console_handler.setFormatter(formatter)
    console_handler.addFilter(SensitiveDataFilter())

    # Clear existing handlers and add ours
    root_logger.handlers.clear()
    root_logger.addHandler(console_handler)

    # Suppress noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("firebase_admin").setLevel(logging.WARNING)
