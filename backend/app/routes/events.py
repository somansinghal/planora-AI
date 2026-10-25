"""
Planora AI – Events Routes

CRUD operations for user-owned events with strict resource ownership enforcement.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.repositories import (
    create_event,
    get_events_for_user,
    get_event,
    update_event,
    delete_event,
    get_expenses,
    get_tasks,
    get_guests,
    FirestoreError,
)
from app.schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/events",
    response_model=EventListResponse,
    summary="List all events for current user",
    status_code=status.HTTP_200_OK,
)
async def list_events(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns events created by the authenticated user.
    """
    offset = (page - 1) * page_size
    events = await get_events_for_user(user_id=current_user.uid, limit=page_size, offset=offset)

    # Calculate actual spent and task_completion dynamically for each event
    enriched_events = []
    for ev in events:
        event_id = ev["id"]
        expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
        total_spent = sum(
            ex.get("actual_amount") or ex.get("estimated_amount", 0.0)
            for ex in expenses
            if ex.get("is_paid") or ex.get("actual_amount") is not None
        )

        tasks = await get_tasks(event_id=event_id, user_id=current_user.uid)
        completed_tasks = sum(1 for t in tasks if t.get("status") == "done")
        task_pct = (completed_tasks / len(tasks) * 100) if tasks else 0.0

        ev_copy = dict(ev)
        ev_copy["spent"] = round(total_spent, 2)
        ev_copy["task_completion"] = round(task_pct, 1)
        enriched_events.append(EventResponse(**ev_copy))

    return EventListResponse(
        events=enriched_events,
        total=len(enriched_events),
        page=page,
        page_size=page_size,
    )


@router.post(
    "/events",
    response_model=EventResponse,
    summary="Create a new event",
    status_code=status.HTTP_201_CREATED,
)
async def create_new_event(
    payload: EventCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Create a new event record owned by the authenticated user.
    """
    try:
        event_dict = payload.model_dump()
        new_event = await create_event(user_id=current_user.uid, event_data=event_dict)
        return EventResponse(**new_event)
    except FirestoreError as exc:
        logger.error(f"Failed to create event: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save event. Please try again.",
        )


@router.get(
    "/events/{event_id}",
    response_model=EventResponse,
    summary="Get event by ID",
    status_code=status.HTTP_200_OK,
)
async def get_event_by_id(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Get a single event. Verifies user ownership.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    # Calculate real-time stats
    expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
    total_spent = sum(
        ex.get("actual_amount") or ex.get("estimated_amount", 0.0)
        for ex in expenses
        if ex.get("is_paid") or ex.get("actual_amount") is not None
    )
    tasks = await get_tasks(event_id=event_id, user_id=current_user.uid)
    completed_tasks = sum(1 for t in tasks if t.get("status") == "done")
    task_pct = (completed_tasks / len(tasks) * 100) if tasks else 0.0

    ev_copy = dict(event)
    ev_copy["spent"] = round(total_spent, 2)
    ev_copy["task_completion"] = round(task_pct, 1)

    return EventResponse(**ev_copy)


@router.patch(
    "/events/{event_id}",
    response_model=EventResponse,
    summary="Update event details",
    status_code=status.HTTP_200_OK,
)
async def update_event_by_id(
    event_id: str,
    payload: EventUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Update fields on an event. Verifies ownership.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    update_dict = payload.model_dump(exclude_unset=True)
    if not update_dict:
        return EventResponse(**event)

    try:
        updated = await update_event(event_id, update_dict)
        return EventResponse(**updated)
    except FirestoreError as exc:
        logger.error(f"Failed to update event {event_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event.",
        )


@router.delete(
    "/events/{event_id}",
    response_model=MessageResponse,
    summary="Delete event",
    status_code=status.HTTP_200_OK,
)
async def delete_event_by_id(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Deletes an event and all associated tasks, expenses, vendors, and guests.
    Strictly verifies ownership before deletion.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    try:
        await delete_event(event_id)
        return MessageResponse(message=f"Event '{event.get('name')}' and all associated records deleted successfully.")
    except FirestoreError as exc:
        logger.error(f"Failed to delete event {event_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event.",
        )
