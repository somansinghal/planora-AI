"""
Planora AI – Reports and Export Routes

Generates comprehensive executive event summaries and downloadable data exports
(JSON, CSV, and formatted summaries).
"""

import io
import csv
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.repositories import (
    get_event,
    get_expenses,
    get_tasks,
    get_vendors,
    get_guests,
    get_event_plans,
)

logger = logging.getLogger(__name__)

router = APIRouter()


class EventReportResponse(BaseModel):
    event: Dict[str, Any]
    budget_overview: Dict[str, Any]
    tasks_overview: Dict[str, Any]
    vendors_overview: Dict[str, Any]
    guests_overview: Dict[str, Any]
    latest_plan: Optional[Dict[str, Any]] = None


@router.get(
    "/events/{event_id}/report",
    response_model=EventReportResponse,
    summary="Get complete event master report",
    status_code=status.HTTP_200_OK,
)
async def get_event_report(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns an aggregated report containing event details, budget metrics,
    task completion status, vendor roster, and guest RSVP breakdown.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
    tasks = await get_tasks(event_id=event_id, user_id=current_user.uid)
    vendors = await get_vendors(event_id=event_id, user_id=current_user.uid)
    guests = await get_guests(event_id=event_id, user_id=current_user.uid)
    plans = await get_event_plans(event_id=event_id, user_id=current_user.uid)

    total_budget = float(event.get("budget", 0.0))
    total_est_expenses = sum(float(e.get("estimated_amount", 0.0) or 0.0) for e in expenses)
    total_act_expenses = sum(
        float(e.get("actual_amount", 0.0) or (e.get("estimated_amount", 0.0) if e.get("is_paid") else 0.0))
        for e in expenses
    )

    completed_tasks = sum(1 for t in tasks if t.get("status") == "done")
    todo_tasks = sum(1 for t in tasks if t.get("status") == "todo")
    in_progress_tasks = sum(1 for t in tasks if t.get("status") == "in_progress")
    progress_pct = (completed_tasks / len(tasks) * 100) if tasks else 0.0

    confirmed_guests = sum(1 for g in guests if g.get("rsvp_status") == "confirmed")
    pending_guests = sum(1 for g in guests if g.get("rsvp_status") == "pending")

    return EventReportResponse(
        event=event,
        budget_overview={
            "total_budget": total_budget,
            "currency": event.get("currency", "INR"),
            "total_estimated": round(total_est_expenses, 2),
            "total_actual": round(total_act_expenses, 2),
            "remaining": round(total_budget - total_act_expenses, 2),
            "utilization_pct": round((total_act_expenses / total_budget * 100) if total_budget > 0 else 0.0, 1),
            "expenses_count": len(expenses),
        },
        tasks_overview={
            "total_tasks": len(tasks),
            "completed": completed_tasks,
            "in_progress": in_progress_tasks,
            "todo": todo_tasks,
            "progress_pct": round(progress_pct, 1),
        },
        vendors_overview={
            "total_vendors": len(vendors),
            "booked_count": sum(1 for v in vendors if v.get("booking_status") == "booked"),
            "quoted_count": sum(1 for v in vendors if v.get("booking_status") == "quoted"),
        },
        guests_overview={
            "total_invited": len(guests),
            "confirmed": confirmed_guests,
            "pending": pending_guests,
        },
        latest_plan=plans[0] if plans else None,
    )


@router.get(
    "/events/{event_id}/export/csv",
    summary="Export budget or guest list as CSV",
    status_code=status.HTTP_200_OK,
)
async def export_csv(
    event_id: str,
    export_type: str = "expenses",  # or 'guests', 'tasks'
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Download CSV export of expenses, guests, or tasks.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "guests":
        guests = await get_guests(event_id=event_id, user_id=current_user.uid)
        writer.writerow(["Name", "Email", "Phone", "RSVP Status", "Plus One", "Dietary Preference", "Table"])
        for g in guests:
            writer.writerow([
                g.get("name", ""),
                g.get("email", ""),
                g.get("phone", ""),
                g.get("rsvp_status", ""),
                "Yes" if g.get("plus_one") else "No",
                g.get("dietary_preference", ""),
                g.get("table_assignment", ""),
            ])
        filename = f"{event.get('name', 'event')}_guests.csv"
    elif export_type == "tasks":
        tasks = await get_tasks(event_id=event_id, user_id=current_user.uid)
        writer.writerow(["Title", "Status", "Priority", "Due Date", "Assigned To", "Description"])
        for t in tasks:
            writer.writerow([
                t.get("title", ""),
                t.get("status", ""),
                t.get("priority", ""),
                t.get("due_date", ""),
                t.get("assigned_to", ""),
                t.get("description", ""),
            ])
        filename = f"{event.get('name', 'event')}_tasks.csv"
    else:  # default expenses
        expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
        writer.writerow(["Name", "Category", "Estimated Amount", "Actual Amount", "Paid", "Vendor", "Notes"])
        for e in expenses:
            writer.writerow([
                e.get("name", ""),
                e.get("category", ""),
                e.get("estimated_amount", 0.0),
                e.get("actual_amount", ""),
                "Yes" if e.get("is_paid") else "No",
                e.get("vendor_name", ""),
                e.get("notes", ""),
            ])
        filename = f"{event.get('name', 'event')}_budget.csv"

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
