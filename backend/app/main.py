"""
Planora AI – FastAPI Backend Application

Main application entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging
from app.routes import auth, events, plans, budgets, tasks, vendors, guests, copilot, reports

# Configure logging before anything else
configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    logger.info("Planora AI backend starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")
    yield
    logger.info("Planora AI backend shutting down...")


app = FastAPI(
    title="Planora AI API",
    description="AI-powered event planning SaaS API",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/api/openapi.json" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,
)

# ── Security Headers Middleware ──────────────────────────────
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Only set in production (HTTPS)
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# ── Request ID Middleware ────────────────────────────────────
@app.middleware("http")
async def add_request_id(request, call_next):
    import uuid
    request_id = str(uuid.uuid4())[:8]
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# ── Global Exception Handler ─────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True)
    # Never expose internal error details to clients
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# ── Routes ───────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(plans.router, prefix="/api", tags=["AI Plans"])
app.include_router(budgets.router, prefix="/api", tags=["Budget"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(vendors.router, prefix="/api", tags=["Vendors"])
app.include_router(guests.router, prefix="/api", tags=["Guests"])
app.include_router(copilot.router, prefix="/api", tags=["AI Copilot"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

# ── Health Check ─────────────────────────────────────────────
@app.get("/api/health", tags=["Health"], summary="Health check")
async def health_check():
    """Returns service health status. No authentication required."""
    return {
        "status": "ok",
        "service": "planora-ai-api",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
    )
