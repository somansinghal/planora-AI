"""
Planora AI – Vendor Management Routes

Endpoints for tracking event vendors, booking statuses, quotes, and contact details.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import AuthenticatedUser, get_current_user, verify_resource_ownership
from app.repositories import (
    get_event,
    create_vendor,
    get_vendors,
    get_vendor,
    update_vendor,
    delete_vendor,
    FirestoreError,
)
from app.schemas import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/events/{event_id}/vendors",
    response_model=List[VendorResponse],
    summary="List all vendors for an event",
    status_code=status.HTTP_200_OK,
)
async def list_vendors_for_event(
    event_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    vendors = await get_vendors(event_id=event_id, user_id=current_user.uid)
    return [VendorResponse(**v) for v in vendors]


@router.post(
    "/events/{event_id}/vendors",
    response_model=VendorResponse,
    summary="Add a vendor to an event",
    status_code=status.HTTP_201_CREATED,
)
async def add_vendor_to_event(
    event_id: str,
    payload: VendorCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    event = await get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    verify_resource_ownership(event["user_id"], current_user)

    vendor_dict = payload.model_dump()
    new_vendor = await create_vendor(user_id=current_user.uid, event_id=event_id, data=vendor_dict)
    return VendorResponse(**new_vendor)


@router.get(
    "/vendors/{vendor_id}",
    response_model=VendorResponse,
    summary="Get single vendor",
    status_code=status.HTTP_200_OK,
)
async def get_single_vendor(
    vendor_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    vendor = await get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")

    verify_resource_ownership(vendor["user_id"], current_user)
    return VendorResponse(**vendor)


@router.patch(
    "/vendors/{vendor_id}",
    response_model=VendorResponse,
    summary="Update vendor details",
    status_code=status.HTTP_200_OK,
)
async def update_single_vendor(
    vendor_id: str,
    payload: VendorUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    vendor = await get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")

    verify_resource_ownership(vendor["user_id"], current_user)

    update_dict = payload.model_dump(exclude_unset=True)
    updated = await update_vendor(vendor_id, update_dict)
    return VendorResponse(**updated)


@router.delete(
    "/vendors/{vendor_id}",
    response_model=MessageResponse,
    summary="Delete vendor",
    status_code=status.HTTP_200_OK,
)
async def delete_single_vendor(
    vendor_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    vendor = await get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")

    verify_resource_ownership(vendor["user_id"], current_user)

    await delete_vendor(vendor_id)
    return MessageResponse(message="Vendor deleted successfully.")
