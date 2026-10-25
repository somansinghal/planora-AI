"""
Planora AI – Guest Management Routes

Endpoints for guest lists, RSVP tracking, table assignments, and dietary preferences.
"""

import logging
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.repositories import (
    get_event,
    create_guest,
    get_guests,
    get_guest,
    update_guest,
    delete_guest,
    FirestoreError,
)
from app.schemas import (
    GuestCreate,
    GuestUpdate,
    GuestResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


class GuestSummaryResponse(BaseModel):
    event_id: str
    total_invitations: int
    total_attending_headcount: int
    confirmed_count: int
    pending_count: int
    declined_count: int
    maybe_count: int
    plus_one_count: int


@router.get(
    "/events/{event_id}/guests",
    response_model=List[GuestResponse],
    summary="List all guests for an event",
    status_code=status.HTTP_200_OK,
)
async def list_guests_for_event(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    guests = await get_guests(event_id=event_id, user_id=current_user.uid)
    return [GuestResponse(**g) for g in guests]


@router.post(
    "/events/{event_id}/guests",
    response_model=GuestResponse,
    summary="Add a guest to an event",
    status_code=status.HTTP_201_CREATED,
)
async def add_guest_to_event(
    event_id: str,
    payload: GuestCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    guest_dict = payload.model_dump()
    new_guest = await create_guest(user_id=current_user.uid, event_id=event_id, data=guest_dict)
    return GuestResponse(**new_guest)


@router.get(
    "/events/{event_id}/guests/summary",
    response_model=GuestSummaryResponse,
    summary="Get RSVP summary metrics",
    status_code=status.HTTP_200_OK,
)
async def get_guest_summary(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    guests = await get_guests(event_id=event_id, user_id=current_user.uid)
    
    confirmed = sum(1 for g in guests if g.get("rsvp_status") == "confirmed")
    pending = sum(1 for g in guests if g.get("rsvp_status") == "pending")
    declined = sum(1 for g in guests if g.get("rsvp_status") == "declined")
    maybe = sum(1 for g in guests if g.get("rsvp_status") == "maybe")
    plus_ones = sum(1 for g in guests if g.get("plus_one"))

    # Confirmed head count = confirmed guests + their confirmed plus-ones
    headcount = sum(
        1 + (1 if g.get("plus_one") else 0)
        for g in guests
        if g.get("rsvp_status") == "confirmed"
    )

    return GuestSummaryResponse(
        event_id=event_id,
        total_invitations=len(guests),
        total_attending_headcount=headcount,
        confirmed_count=confirmed,
        pending_count=pending,
        declined_count=declined,
        maybe_count=maybe,
        plus_one_count=plus_ones,
    )


@router.get(
    "/guests/{guest_id}",
    response_model=GuestResponse,
    summary="Get single guest",
    status_code=status.HTTP_200_OK,
)
async def get_single_guest(
    guest_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    guest = await get_guest(guest_id)
    if not guest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found.")

    verify_resource_ownership(guest["user_id"], current_user)
    return GuestResponse(**guest)


@router.patch(
    "/guests/{guest_id}",
    response_model=GuestResponse,
    summary="Update guest details or RSVP status",
    status_code=status.HTTP_200_OK,
)
async def update_single_guest(
    guest_id: str,
    payload: GuestUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    guest = await get_guest(guest_id)
    if not guest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found.")

    verify_resource_ownership(guest["user_id"], current_user)

    update_dict = payload.model_dump(exclude_unset=True)
    updated = await update_guest(guest_id, update_dict)
    return GuestResponse(**updated)


@router.delete(
    "/guests/{guest_id}",
    response_model=MessageResponse,
    summary="Delete guest",
    status_code=status.HTTP_200_OK,
)
async def delete_single_guest(
    guest_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    guest = await get_guest(guest_id)
    if not guest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found.")

    verify_resource_ownership(guest["user_id"], current_user)

    await delete_guest(guest_id)
    return MessageResponse(message="Guest deleted successfully.")
