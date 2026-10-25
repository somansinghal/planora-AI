"""
Planora AI – Security Module

Firebase ID token verification and authorization utilities.
"""

import logging
from functools import lru_cache
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# Lazy Firebase Admin initialization
_firebase_app = None
_firebase_auth = None


def _get_firebase_auth():
    """Initialize and return Firebase Admin Auth client (lazy)."""
    global _firebase_app, _firebase_auth

    if _firebase_auth is not None:
        return _firebase_auth

    try:
        import firebase_admin
        from firebase_admin import auth, credentials
        from app.core.config import settings

        if not firebase_admin._apps:
            if settings.FIREBASE_ADMIN_CREDENTIALS:
                cred = credentials.Certificate(settings.FIREBASE_ADMIN_CREDENTIALS)
            else:
                # Use application default credentials (e.g., on GCP / Vercel with env vars)
                cred = credentials.ApplicationDefault()

            _firebase_app = firebase_admin.initialize_app(cred, {
                "projectId": settings.FIREBASE_PROJECT_ID,
            })
        else:
            _firebase_app = firebase_admin.get_app()

        _firebase_auth = auth
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_auth

    except Exception as exc:
        logger.error(f"Firebase Admin initialization failed: {exc}")
        return None


class AuthenticatedUser:
    """Represents a verified Firebase user."""

    def __init__(self, uid: str, email: Optional[str] = None, display_name: Optional[str] = None):
        self.uid = uid
        self.email = email
        self.display_name = display_name

    def __repr__(self):
        return f"AuthenticatedUser(uid={self.uid[:8]}...)"


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> AuthenticatedUser:
    """
    FastAPI dependency: verifies Firebase ID token from Authorization header.
    
    Returns AuthenticatedUser if valid.
    Raises HTTP 401 if token is missing, invalid, or expired.
    
    IMPORTANT: This verifies the token server-side. Never trust user IDs
    from request bodies as proof of identity.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Basic sanity check on token format (JWT has 3 parts)
    if token.count('.') != 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    firebase_auth = _get_firebase_auth()

    if firebase_auth is None:
        # Firebase Admin not configured – development fallback
        logger.warning("Firebase Admin not configured. Auth verification skipped (dev mode).")
        # In production this should never happen
        from app.core.config import settings
        if settings.ENVIRONMENT == "production":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable.",
            )
        # Dev mode: extract UID from token claims without verification
        try:
            import base64, json
            payload_b64 = token.split('.')[1]
            # Add padding if needed
            payload_b64 += '=' * (4 - len(payload_b64) % 4)
            payload = json.loads(base64.b64decode(payload_b64))
            uid = payload.get('user_id') or payload.get('sub', 'dev-user')
            return AuthenticatedUser(uid=uid, email=payload.get('email'))
        except Exception:
            return AuthenticatedUser(uid='dev-user-001', email='dev@planora.ai')

    try:
        decoded_token = firebase_auth.verify_id_token(token, check_revoked=True)

        return AuthenticatedUser(
            uid=decoded_token['uid'],
            email=decoded_token.get('email'),
            display_name=decoded_token.get('name'),
        )

    except firebase_admin.auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has been revoked. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_admin.auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid ID token: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as exc:
        logger.error(f"Token verification error: {type(exc).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_resource_ownership(resource_user_id: str, current_user: AuthenticatedUser) -> None:
    """
    Verify that the current user owns the requested resource.
    Raises HTTP 403 if ownership check fails.
    
    This MUST be called for all user-owned resource access.
    Never trust user IDs from request bodies as authorization.
    """
    if resource_user_id != current_user.uid:
        logger.warning(
            f"Unauthorized access attempt: user {current_user.uid[:8]}... "
            f"attempted to access resource owned by {resource_user_id[:8]}..."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )
