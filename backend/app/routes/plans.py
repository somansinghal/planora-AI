"""
Planora AI – AI Event Studio & Plans Routes

AI-powered plan generation and persistence with rate limiting and structured schema validation.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.core.config import settings
from app.repositories import (
    get_event,
    save_event_plan,
    get_event_plans,
    create_task,
    create_expense,
    create_vendor,
    FirestoreError,
)
from app.services.ai_service import (
    generate_event_plan,
    check_rate_limit,
    get_remaining_quota,
)
from app.schemas import (
    GeneratePlanRequest,
    EventPlanResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/events/{event_id}/generate-plan",
    response_model=EventPlanResponse,
    summary="Generate AI event plan",
    status_code=status.HTTP_200_OK,
)
async def generate_plan_for_event(
    event_id: str,
    payload: GeneratePlanRequest,
    demo_mode: bool = Query(False, description="Explicitly request demonstration mode if live AI key is unset"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Generates a structured, validated AI event plan using Groq.
    Enforces user ownership, hourly rate limits, and output schema validation.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    # Check rate limit
    if not check_rate_limit(current_user.uid):
        remaining = get_remaining_quota(current_user.uid)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI generation hourly limit reached ({settings.AI_REQUESTS_PER_USER_PER_HOUR}/hr). Quota remaining: {remaining}. Please try again later.",
        )

    # Call AI service
    ai_result = await generate_event_plan(
        event_data=event,
        preferences=payload.model_dump(),
    )

    if not ai_result.get("success"):
        # If client explicitly allows demo mode and GROQ_API_KEY is not set
        if demo_mode or not settings.GROQ_API_KEY:
            logger.info("Using clearly labeled demonstration plan because live AI key is unset or demo mode requested.")
            budget = float(event.get("budget", 100000))
            currency = event.get("currency", "INR")
            demo_plan = {
                "event_id": event_id,
                "event_summary": f"Curated comprehensive plan for {event.get('name')} ({event.get('event_type').title()}) tailored to {event.get('guest_count')} guests with a target budget of {currency} {budget:,.0f}.",
                "theme_ideas": [
                    f"Elegance & Modern Luxury: Palette of deep navy, ivory, and champagne gold",
                    f"Classic Garden Botanical: Lush greenery, delicate floral installations, soft pastel lighting",
                    f"Royal Heritage: Regal motifs, rich fabrics, and majestic ceremonial touches",
                ],
                "budget_breakdown": [
                    {"category": "venue", "estimated_amount": round(budget * 0.35, 2), "percentage": 35.0, "notes": "Primary venue rental, setup & breakdown"},
                    {"category": "catering", "estimated_amount": round(budget * 0.28, 2), "percentage": 28.0, "notes": "Full-course dining, welcome drinks, desserts"},
                    {"category": "decoration", "estimated_amount": round(budget * 0.14, 2), "percentage": 14.0, "notes": "Stage backdrop, table centrepieces, atmospheric lighting"},
                    {"category": "photography", "estimated_amount": round(budget * 0.10, 2), "percentage": 10.0, "notes": "Candid photography, cinematic highlight video"},
                    {"category": "entertainment", "estimated_amount": round(budget * 0.08, 2), "percentage": 8.0, "notes": "DJ, audio-visual system, master of ceremonies"},
                    {"category": "other", "estimated_amount": round(budget * 0.05, 2), "percentage": 5.0, "notes": "Contingency reserve and miscellaneous permits"},
                ],
                "timeline_milestones": [
                    {"days_before": 60, "title": "Finalize venue contract & deposit", "description": "Lock in venue dates and sign vendor clauses", "priority": "high"},
                    {"days_before": 45, "title": "Catering menu tasting & confirmation", "description": "Select appetizers, main courses, and dietary requirements", "priority": "high"},
                    {"days_before": 30, "title": "Send official invitations & track RSVPs", "description": "Dispatch digital & printed invites", "priority": "medium"},
                    {"days_before": 14, "title": "Finalize décor, seating chart & playlist", "description": "Confirm floorplan layout and schedule with DJ", "priority": "medium"},
                    {"days_before": 3, "title": "Final headcount confirmation with vendors", "description": "Review final timing run-sheet with all coordinators", "priority": "high"},
                ],
                "event_day_schedule": [
                    {"time": "09:00 AM", "activity": "Vendor arrival & venue access", "duration_minutes": 120, "notes": "Stage build, floral delivery, sound checks"},
                    {"time": "04:00 PM", "activity": "Final inspection & photography briefing", "duration_minutes": 60, "notes": "Check lighting, table settings, and welcome signage"},
                    {"time": "06:00 PM", "activity": "Guest arrival & welcome refreshments", "duration_minutes": 60, "notes": "Signature drinks, acoustic background music"},
                    {"time": "07:30 PM", "activity": "Main ceremony / key proceedings", "duration_minutes": 90, "notes": "Speeches, presentations, and celebratory moments"},
                    {"time": "09:00 PM", "activity": "Dinner banquet & entertainment", "duration_minutes": 120, "notes": "Full dinner buffet, open dance floor, cake cutting"},
                ],
                "vendor_checklist": [
                    {"category": "Venue & Banquets", "description": "Spacious hall or outdoor garden with parking & audio facilities", "estimated_cost_min": round(budget * 0.30, 2), "estimated_cost_max": round(budget * 0.40, 2), "tips": "Negotiate complimentary dressing rooms and overtime rates"},
                    {"category": "Catering & Hospitality", "description": "Premier banquet caterer with live food stations", "estimated_cost_min": round(budget * 0.25, 2), "estimated_cost_max": round(budget * 0.32, 2), "tips": "Request a tasting session before paying the booking deposit"},
                    {"category": "Décor & Floral Styling", "description": "Contemporary event stylist for entrance arch, stage & tables", "estimated_cost_min": round(budget * 0.12, 2), "estimated_cost_max": round(budget * 0.16, 2), "tips": "Opt for seasonal flowers to maximize visual impact within budget"},
                    {"category": "Photography & Film", "description": "Professional 2-camera team with drone and drone coverage", "estimated_cost_min": round(budget * 0.08, 2), "estimated_cost_max": round(budget * 0.12, 2), "tips": "Specify delivery turnaround time for edited photo teasers"},
                ],
                "task_suggestions": [
                    "Sign venue lease agreement and record deposit receipt",
                    "Conduct dietary preference survey for RSVPs",
                    "Select theme color swatches for floral styling",
                    "Appoint designated point of contact for day-of vendor coordination",
                    "Assemble guest welcome hampers / favors",
                    "Prepare run-sheet cue cards for the MC and audio engineer",
                ],
                "personalized_recommendations": [
                    f"For an event of {event.get('guest_count')} guests, allow at least 2 distinct beverage counters to eliminate queues.",
                    "Schedule formal photos 30 minutes before guest arrival while decor and lighting are pristine.",
                    "Always allocate a 5% contingency reserve in your expense tracker for unforeseen last-minute additions.",
                ],
                "cost_saving_suggestions": [
                    "Combining the ceremony and reception at the same venue saves significantly on guest transportation and setup fees.",
                    "Select a seasonal signature mocktail/cocktail rather than an open multi-brand bar to trim beverage spend by 25%.",
                    "Use digital RSVP collection to eliminate postage costs and streamline guest counts in real time.",
                ],
                "disclaimer": "DEMONSTRATION MODE: This plan was generated in offline demonstration mode. To generate live plans using the AI model, set GROQ_API_KEY in the backend environment.",
                "ai_provider": "demonstration_mode",
                "ai_model": "planora-offline-demo",
            }
            validated_demo = EventPlanResponse(**demo_plan)
            return validated_demo

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ai_result.get("error") or "AI service failed to generate plan.",
        )

    return EventPlanResponse(**ai_result["plan"])


@router.post(
    "/events/{event_id}/plans",
    response_model=EventPlanResponse,
    summary="Accept and save an event plan",
    status_code=status.HTTP_201_CREATED,
)
async def accept_and_save_plan(
    event_id: str,
    plan: EventPlanResponse,
    apply_to_workspace: bool = Query(True, description="Automatically populate budget categories, timeline, and tasks"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Saves an accepted event plan into persistent storage.
    If apply_to_workspace is true, automatically initializes expenses, tasks,
    and vendors in the event workspace so the user can immediately manage them.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    saved = await save_event_plan(
        user_id=current_user.uid,
        event_id=event_id,
        plan_data=plan.model_dump(),
    )

    # Optionally seed workspace tasks and budget categories
    if apply_to_workspace:
        # Create budget expenses
        for item in plan.budget_breakdown:
            await create_expense(
                user_id=current_user.uid,
                event_id=event_id,
                data={
                    "category": item.category if item.category in ["venue", "catering", "decoration", "entertainment", "photography", "transportation", "accommodation", "clothing", "invitations", "flowers", "cake", "sound_lighting", "security", "other"] else "other",
                    "name": f"{item.category.title()} ({item.notes or 'Estimated allocation'})",
                    "estimated_amount": item.estimated_amount,
                    "actual_amount": None,
                    "notes": item.notes or "",
                    "is_paid": False,
                },
            )

        # Create tasks from suggestions and milestones
        for idx, task_text in enumerate(plan.task_suggestions[:8]):
            await create_task(
                user_id=current_user.uid,
                event_id=event_id,
                data={
                    "title": task_text,
                    "description": "Suggested by Planora AI Event Studio",
                    "status": "todo",
                    "priority": "high" if idx < 3 else "medium",
                },
            )

        # Create vendors checklist
        for v in plan.vendor_checklist[:6]:
            await create_vendor(
                user_id=current_user.uid,
                event_id=event_id,
                data={
                    "name": v.category,
                    "category": v.category,
                    "notes": f"{v.description}. Tips: {v.tips or 'N/A'}",
                    "estimated_cost": v.estimated_cost_max,
                    "booking_status": "not_contacted",
                },
            )

    return EventPlanResponse(**saved)


@router.get(
    "/events/{event_id}/plans",
    response_model=List[EventPlanResponse],
    summary="List saved plans for event",
    status_code=status.HTTP_200_OK,
)
async def list_event_plans(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    List all generated and saved plans for an event.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    plans = await get_event_plans(event_id=event_id, user_id=current_user.uid)
    return [EventPlanResponse(**p) for p in plans]
