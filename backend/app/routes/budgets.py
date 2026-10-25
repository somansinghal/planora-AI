"""
Planora AI – Budget and Expenses Routes

Endpoints for tracking estimated and actual expenses, category breakdowns,
budget utilization, and itemized receipts.
"""

import logging
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.repositories import (
    get_event,
    create_expense,
    get_expenses,
    get_expense,
    update_expense,
    delete_expense,
    FirestoreError,
)
from app.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


class CategorySummary(BaseModel):
    category: str
    estimated_total: float
    actual_total: float
    item_count: int


class BudgetSummaryResponse(BaseModel):
    event_id: str
    currency: str
    total_budget: float
    total_estimated: float
    total_actual: float
    remaining_budget: float
    utilization_percentage: float
    over_budget: bool
    category_breakdown: List[CategorySummary]


@router.get(
    "/events/{event_id}/expenses",
    response_model=List[ExpenseResponse],
    summary="List all expenses for event",
    status_code=status.HTTP_200_OK,
)
async def list_expenses_for_event(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Get all expenses associated with an event. Enforces user ownership.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
    return [ExpenseResponse(**e) for e in expenses]


@router.post(
    "/events/{event_id}/expenses",
    response_model=ExpenseResponse,
    summary="Add an expense item",
    status_code=status.HTTP_201_CREATED,
)
async def add_expense_to_event(
    event_id: str,
    payload: ExpenseCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Add a new expense item to the event budget.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    expense_dict = payload.model_dump()
    new_expense = await create_expense(
        user_id=current_user.uid,
        event_id=event_id,
        data=expense_dict,
    )
    return ExpenseResponse(**new_expense)


@router.get(
    "/events/{event_id}/budget-summary",
    response_model=BudgetSummaryResponse,
    summary="Get calculated budget overview and utilization",
    status_code=status.HTTP_200_OK,
)
async def get_budget_summary(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Computes accurate totals, remaining balance, utilization percentage,
    and category-by-category breakdown from stored expenses.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    expenses = await get_expenses(event_id=event_id, user_id=current_user.uid)
    total_budget = float(event.get("budget", 0.0))

    cat_est = defaultdict(float)
    cat_act = defaultdict(float)
    cat_count = defaultdict(int)

    total_estimated = 0.0
    total_actual = 0.0

    for ex in expenses:
        cat = ex.get("category", "other")
        est = float(ex.get("estimated_amount", 0.0) or 0.0)
        act = float(ex.get("actual_amount", 0.0) or (est if ex.get("is_paid") else 0.0))

        cat_est[cat] += est
        cat_act[cat] += act
        cat_count[cat] += 1

        total_estimated += est
        total_actual += act

    remaining = total_budget - total_actual
    utilization = (total_actual / total_budget * 100) if total_budget > 0 else 0.0

    all_cats = set(list(cat_est.keys()) + list(cat_act.keys()))
    breakdown = [
        CategorySummary(
            category=c,
            estimated_total=round(cat_est[c], 2),
            actual_total=round(cat_act[c], 2),
            item_count=cat_count[c],
        )
        for c in sorted(all_cats)
    ]

    return BudgetSummaryResponse(
        event_id=event_id,
        currency=event.get("currency", "INR"),
        total_budget=round(total_budget, 2),
        total_estimated=round(total_estimated, 2),
        total_actual=round(total_actual, 2),
        remaining_budget=round(remaining, 2),
        utilization_percentage=round(utilization, 1),
        over_budget=remaining < 0,
        category_breakdown=breakdown,
    )


@router.get(
    "/expenses/{expense_id}",
    response_model=ExpenseResponse,
    summary="Get single expense",
    status_code=status.HTTP_200_OK,
)
async def get_single_expense(
    expense_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    expense = await get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")

    verify_resource_ownership(expense["user_id"], current_user)
    return ExpenseResponse(**expense)


@router.patch(
    "/expenses/{expense_id}",
    response_model=ExpenseResponse,
    summary="Update expense item",
    status_code=status.HTTP_200_OK,
)
async def update_single_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    expense = await get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")

    verify_resource_ownership(expense["user_id"], current_user)

    update_dict = payload.model_dump(exclude_unset=True)
    updated = await update_expense(expense_id, update_dict)
    return ExpenseResponse(**updated)


@router.delete(
    "/expenses/{expense_id}",
    response_model=MessageResponse,
    summary="Delete expense item",
    status_code=status.HTTP_200_OK,
)
async def delete_single_expense(
    expense_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    expense = await get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")

    verify_resource_ownership(expense["user_id"], current_user)

    await delete_expense(expense_id)
    return MessageResponse(message="Expense deleted successfully.")
