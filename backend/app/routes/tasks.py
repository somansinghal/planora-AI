"""
Planora AI – Task Management Routes

Endpoints for creating, updating, prioritizing, and completing event tasks.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.repositories import (
    get_event,
    create_task,
    get_tasks,
    get_task,
    update_task,
    delete_task,
    FirestoreError,
)
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    MessageResponse,
    TaskStatus,
    TaskPriority,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/events/{event_id}/tasks",
    response_model=List[TaskResponse],
    summary="List all tasks for an event",
    status_code=status.HTTP_200_OK,
)
async def list_tasks_for_event(
    event_id: str,
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority_filter: Optional[TaskPriority] = Query(None, alias="priority"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    List all tasks for an event with optional filtering by status or priority.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    tasks = await get_tasks(event_id=event_id, user_id=current_user.uid)

    if status_filter:
        tasks = [t for t in tasks if t.get("status") == status_filter.value]
    if priority_filter:
        tasks = [t for t in tasks if t.get("priority") == priority_filter.value]

    return [TaskResponse(**t) for t in tasks]


@router.post(
    "/events/{event_id}/tasks",
    response_model=TaskResponse,
    summary="Create a new task",
    status_code=status.HTTP_201_CREATED,
)
async def create_new_task(
    event_id: str,
    payload: TaskCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Create a task for the specified event.
    """
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    task_dict = payload.model_dump()
    new_task = await create_task(user_id=current_user.uid, event_id=event_id, data=task_dict)
    return TaskResponse(**new_task)


@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Get single task",
    status_code=status.HTTP_200_OK,
)
async def get_single_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    verify_resource_ownership(task["user_id"], current_user)
    return TaskResponse(**task)


@router.patch(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Update task details or status",
    status_code=status.HTTP_200_OK,
)
async def update_single_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    verify_resource_ownership(task["user_id"], current_user)

    update_dict = payload.model_dump(exclude_unset=True)
    updated = await update_task(task_id, update_dict)
    return TaskResponse(**updated)


@router.delete(
    "/tasks/{task_id}",
    response_model=MessageResponse,
    summary="Delete task",
    status_code=status.HTTP_200_OK,
)
async def delete_single_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    verify_resource_ownership(task["user_id"], current_user)

    await delete_task(task_id)
    return MessageResponse(message="Task deleted successfully.")
