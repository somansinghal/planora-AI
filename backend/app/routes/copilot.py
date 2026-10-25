"""
Planora AI – AI Event Copilot Routes

Contextual intelligent assistant providing real-time recommendations,
budget optimization, theme ideas, and timeline guidance for an event.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.core.config import settings
from app.repositories import (
    get_event,
    get_expenses,
    get_tasks,
    get_vendors,
    get_guests,
)
from app.services.ai_service import (
    chat_with_copilot,
    check_rate_limit,
    get_remaining_quota,
)
from app.schemas import (
    CopilotRequest,
    CopilotResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/events/{event_id}/copilot",
    response_model=CopilotResponse,
    summary="Chat with AI Event Copilot",
    status_code=status.HTTP_200_OK,
)
async def chat_event_copilot(
    event_id: str,
    payload: CopilotRequest,
    demo_mode: bool = Query(False, description="Use offline demo copilot if live AI key is unset"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Context-aware copilot query. Supplies current event metadata (budget, guest count,
    event type, spend) as grounding context to the AI model.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    # Rate limiting
    if not check_rate_limit(current_user.uid):
        remaining = get_remaining_quota(current_user.uid)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Copilot hourly request limit reached. Quota resets in one hour. Remaining: {remaining}.",
        )

    # Gather live context
    expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
    tasks = await get_tasks(event_id=event_id, user_id=current_user.uid)
    guests = await get_guests(event_id=event_id, user_id=current_user.uid)
    vendors = await get_vendors(event_id=event_id, user_id=current_user.uid)

    total_spent = sum(
        ex.get("actual_amount") or ex.get("estimated_amount", 0.0)
        for ex in expenses
        if ex.get("is_paid") or ex.get("actual_amount") is not None
    )

    event_context = {
        **event,
        "total_spent": total_spent,
        "task_count": len(tasks),
        "tasks_completed": sum(1 for t in tasks if t.get("status") == "done"),
        "guest_count_confirmed": sum(1 for g in guests if g.get("rsvp_status") == "confirmed"),
        "vendor_count": len(vendors),
    }

    # If GROQ_API_KEY is not configured or demo mode is on
    if not settings.GROQ_API_KEY or demo_mode:
        q = payload.message.lower()
        if "budget" in q or "cost" in q or "save" in q or "reduce" in q:
            reply = (
                f"For your {event.get('name')} budget of {event.get('currency', 'INR')} {event.get('budget', 0):,.0f}, "
                f"you have currently allocated/spent {event.get('currency', 'INR')} {total_spent:,.0f}. "
                "Here are high-impact cost optimizations: (1) Reallocate 15% from printed collateral to digital RSVPs; "
                "(2) Bundle audio, lighting, and stage setup under a single technical vendor for a 10-15% multi-service discount; "
                "(3) Choose seasonal produce for catering stations."
            )
            suggestions = [
                "Reduce catering spend by 10%",
                "Compare single vs multi-vendor pricing",
                "Review remaining unallocated budget",
            ]
        elif "timeline" in q or "schedule" in q or "day" in q:
            reply = (
                f"For your event on {event.get('event_date')}, we recommend structuring your event day into 3 distinct phases: "
                "Phase 1 (Morning): Technical setup and sound check; Phase 2 (Afternoon): Photography and final inspection; "
                "Phase 3 (Evening): Guest reception followed by dinner and main celebration."
            )
            suggestions = [
                "Add a buffer 45 min before guest arrival",
                "Confirm setup time with venue manager",
                "Assign primary contact for vendor arrival",
            ]
        elif "theme" in q or "decor" in q:
            reply = (
                f"Given your {event.get('event_type')} celebration, three cohesive aesthetic directions work beautifully: "
                "(1) Modern Elegance with warm ambient uplighting and champagne gold accents; "
                "(2) Minimalist Botanical with lush green runners and warm wood finishes; "
                "(3) Sunset Radiance with rich terracotta, deep coral, and ivory accents."
            )
            suggestions = [
                "Explore Modern Elegance decor palette",
                "Review floral vs fabric backdrop costs",
                "Suggest table centerpiece options",
            ]
        else:
            reply = (
                f"I'm here to assist with planning {event.get('name')}. Currently you have "
                f"{len(tasks)} tasks tracked, {len(vendors)} vendors logged, and {len(guests)} guests on your invite list. "
                "What would you like to optimize: budget allocation, vendor quotes, task scheduling, or the event-day timeline?"
            )
            suggestions = [
                "How can I cut 10% from my budget?",
                "Suggest vegetarian menu ideas",
                "What tasks should I complete 30 days before?",
            ]

        return CopilotResponse(
            message=reply,
            suggestions=suggestions,
            event_changes=None,
            requires_confirmation=False,
        )

    # Real AI execution
    res = await chat_with_copilot(
        user_message=payload.message,
        event_context=event_context,
        history=[msg.model_dump() for msg in payload.history],
    )

    return CopilotResponse(
        message=res.get("message", "I am ready to help you plan."),
        suggestions=res.get("suggestions", []),
        event_changes=res.get("event_changes"),
        requires_confirmation=res.get("requires_confirmation", False),
    )
