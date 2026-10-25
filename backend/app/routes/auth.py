"""
Planora AI – Authentication Routes

Endpoints for user identity, session verification, and profile.
Firebase Auth handles credential issuance on client; backend verifies ID tokens.
"""

import logging
from fastapi import APIRouter, Depends, status

from app.core.security import AuthenticatedUser, get_current_user
from app.schemas import UserProfile, MessageResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get current user profile",
    status_code=status.HTTP_200_OK,
)
async def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns the profile of the currently authenticated Firebase user.
    Token is validated server-side.
    """
    return UserProfile(
        uid=current_user.uid,
        email=current_user.email,
        display_name=current_user.display_name or (current_user.email.split("@")[0] if current_user.email else "User"),
    )


@router.post(
    "/auth/verify",
    response_model=UserProfile,
    summary="Verify Firebase ID token",
    status_code=status.HTTP_200_OK,
)
async def verify_session(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Verifies that the caller's Firebase ID token is active, not revoked, and valid.
    """
    return UserProfile(
        uid=current_user.uid,
        email=current_user.email,
        display_name=current_user.display_name or (current_user.email.split("@")[0] if current_user.email else "User"),
    )


@router.post(
    "/auth/logout",
    response_model=MessageResponse,
    summary="Sign out session",
    status_code=status.HTTP_200_OK,
)
async def logout(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Acknowledge sign-out for audit logging.
    """
    logger.info(f"User {current_user.uid[:8]}... signed out.")
    return MessageResponse(message="Successfully signed out.")
