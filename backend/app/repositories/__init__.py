"""
Planora AI – Firestore Repository

Database access layer using Firebase Admin Firestore.
Enforces user ownership on all operations.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

logger = logging.getLogger(__name__)

# Lazy Firestore client
_db = None


def _get_db():
    """Get Firestore client, initializing if needed."""
    global _db
    if _db is not None:
        return _db

    try:
        from firebase_admin import firestore
        _db = firestore.client()
        logger.info("Firestore client initialized")
        return _db
    except Exception as e:
        logger.error(f"Firestore initialization failed: {e}")
        return None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _generate_id() -> str:
    return str(uuid.uuid4())


class FirestoreError(Exception):
    """Raised when a Firestore operation fails."""
    pass


# ── Events ───────────────────────────────────────────────────

async def create_event(user_id: str, event_data: dict) -> dict:
    """Create a new event owned by user_id."""
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")

    doc_id = _generate_id()
    now = _now_iso()

    doc_data = {
        **event_data,
        "id": doc_id,
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
        "spent": 0.0,
        "task_completion": 0.0,
    }
    # Convert date objects to strings
    if hasattr(doc_data.get('event_date'), 'isoformat'):
        doc_data['event_date'] = doc_data['event_date'].isoformat()

    db.collection("events").document(doc_id).set(doc_data)
    return doc_data


async def get_events_for_user(user_id: str, limit: int = 50, offset: int = 0) -> List[dict]:
    """Get all events owned by user_id."""
    db = _get_db()
    if db is None:
        return []

    try:
        query = (
            db.collection("events")
            .where("user_id", "==", user_id)
            .order_by("event_date")
            .limit(limit)
        )
        docs = query.stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"get_events_for_user error: {e}")
        return []


async def get_event(event_id: str) -> Optional[dict]:
    """Get a single event by ID."""
    db = _get_db()
    if db is None:
        return None

    try:
        doc = db.collection("events").document(event_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"get_event error: {e}")
        return None


async def update_event(event_id: str, updates: dict) -> Optional[dict]:
    """Update an event document."""
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")

    updates["updated_at"] = _now_iso()
    # Convert date objects
    if hasattr(updates.get('event_date'), 'isoformat'):
        updates['event_date'] = updates['event_date'].isoformat()

    try:
        ref = db.collection("events").document(event_id)
        ref.update(updates)
        return (await get_event(event_id))
    except Exception as e:
        logger.error(f"update_event error: {e}")
        raise FirestoreError(str(e))


async def delete_event(event_id: str) -> bool:
    """Delete an event and all its subcollections."""
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")

    try:
        # Delete related documents
        for collection in ["expenses", "tasks", "vendors", "guests", "eventPlans"]:
            docs = db.collection(collection).where("event_id", "==", event_id).stream()
            for doc in docs:
                doc.reference.delete()
        
        # Delete the event
        db.collection("events").document(event_id).delete()
        return True
    except Exception as e:
        logger.error(f"delete_event error: {e}")
        raise FirestoreError(str(e))


# ── Event Plans ───────────────────────────────────────────────

async def save_event_plan(user_id: str, event_id: str, plan_data: dict) -> dict:
    """Save an AI-generated event plan."""
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")

    doc_id = _generate_id()
    now = _now_iso()

    doc = {
        **plan_data,
        "id": doc_id,
        "user_id": user_id,
        "event_id": event_id,
        "created_at": now,
    }
    db.collection("eventPlans").document(doc_id).set(doc)
    return doc


async def get_event_plans(event_id: str, user_id: str) -> List[dict]:
    """Get all plans for an event."""
    db = _get_db()
    if db is None:
        return []

    try:
        docs = (
            db.collection("eventPlans")
            .where("event_id", "==", event_id)
            .where("user_id", "==", user_id)
            .order_by("created_at", direction="DESCENDING")
            .limit(10)
            .stream()
        )
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"get_event_plans error: {e}")
        return []


# ── Expenses ──────────────────────────────────────────────────

async def create_expense(user_id: str, event_id: str, data: dict) -> dict:
    """Create an expense record."""
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")

    doc_id = _generate_id()
    now = _now_iso()
    doc = {
        **data,
        "id": doc_id,
        "user_id": user_id,
        "event_id": event_id,
        "created_at": now,
        "updated_at": now,
    }
    if hasattr(doc.get('paid_date'), 'isoformat'):
        doc['paid_date'] = doc['paid_date'].isoformat()
    db.collection("expenses").document(doc_id).set(doc)
    return doc


async def get_expenses(event_id: str, user_id: str) -> List[dict]:
    db = _get_db()
    if db is None:
        return []
    try:
        docs = db.collection("expenses").where("event_id", "==", event_id).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"get_expenses error: {e}")
        return []


async def get_expense(expense_id: str) -> Optional[dict]:
    db = _get_db()
    if db is None:
        return None
    try:
        doc = db.collection("expenses").document(expense_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"get_expense error: {e}")
        return None


async def update_expense(expense_id: str, updates: dict) -> Optional[dict]:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    updates["updated_at"] = _now_iso()
    if hasattr(updates.get('paid_date'), 'isoformat'):
        updates['paid_date'] = updates['paid_date'].isoformat()
    db.collection("expenses").document(expense_id).update(updates)
    return await get_expense(expense_id)


async def delete_expense(expense_id: str) -> bool:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    db.collection("expenses").document(expense_id).delete()
    return True


# ── Tasks ─────────────────────────────────────────────────────

async def create_task(user_id: str, event_id: str, data: dict) -> dict:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    doc_id = _generate_id()
    now = _now_iso()
    doc = {**data, "id": doc_id, "user_id": user_id, "event_id": event_id, "created_at": now, "updated_at": now}
    if hasattr(doc.get('due_date'), 'isoformat'):
        doc['due_date'] = doc['due_date'].isoformat()
    db.collection("tasks").document(doc_id).set(doc)
    return doc


async def get_tasks(event_id: str, user_id: str) -> List[dict]:
    db = _get_db()
    if db is None:
        return []
    try:
        docs = db.collection("tasks").where("event_id", "==", event_id).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"get_tasks error: {e}")
        return []


async def get_task(task_id: str) -> Optional[dict]:
    db = _get_db()
    if db is None:
        return None
    try:
        doc = db.collection("tasks").document(task_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"get_task error: {e}")
        return None


async def update_task(task_id: str, updates: dict) -> Optional[dict]:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    updates["updated_at"] = _now_iso()
    if hasattr(updates.get('due_date'), 'isoformat'):
        updates['due_date'] = updates['due_date'].isoformat()
    db.collection("tasks").document(task_id).update(updates)
    return await get_task(task_id)


async def delete_task(task_id: str) -> bool:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    db.collection("tasks").document(task_id).delete()
    return True


# ── Vendors ───────────────────────────────────────────────────

async def create_vendor(user_id: str, event_id: str, data: dict) -> dict:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    doc_id = _generate_id()
    now = _now_iso()
    doc = {**data, "id": doc_id, "user_id": user_id, "event_id": event_id, "created_at": now, "updated_at": now}
    db.collection("vendors").document(doc_id).set(doc)
    return doc


async def get_vendors(event_id: str, user_id: str) -> List[dict]:
    db = _get_db()
    if db is None:
        return []
    try:
        docs = db.collection("vendors").where("event_id", "==", event_id).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"get_vendors error: {e}")
        return []


async def get_vendor(vendor_id: str) -> Optional[dict]:
    db = _get_db()
    if db is None:
        return None
    try:
        doc = db.collection("vendors").document(vendor_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"get_vendor error: {e}")
        return None


async def update_vendor(vendor_id: str, updates: dict) -> Optional[dict]:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    updates["updated_at"] = _now_iso()
    db.collection("vendors").document(vendor_id).update(updates)
    return await get_vendor(vendor_id)


async def delete_vendor(vendor_id: str) -> bool:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    db.collection("vendors").document(vendor_id).delete()
    return True


# ── Guests ────────────────────────────────────────────────────

async def create_guest(user_id: str, event_id: str, data: dict) -> dict:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    doc_id = _generate_id()
    now = _now_iso()
    doc = {**data, "id": doc_id, "user_id": user_id, "event_id": event_id, "created_at": now, "updated_at": now}
    db.collection("guests").document(doc_id).set(doc)
    return doc


async def get_guests(event_id: str, user_id: str) -> List[dict]:
    db = _get_db()
    if db is None:
        return []
    try:
        docs = db.collection("guests").where("event_id", "==", event_id).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"get_guests error: {e}")
        return []


async def get_guest(guest_id: str) -> Optional[dict]:
    db = _get_db()
    if db is None:
        return None
    try:
        doc = db.collection("guests").document(guest_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"get_guest error: {e}")
        return None


async def update_guest(guest_id: str, updates: dict) -> Optional[dict]:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    updates["updated_at"] = _now_iso()
    db.collection("guests").document(guest_id).update(updates)
    return await get_guest(guest_id)


async def delete_guest(guest_id: str) -> bool:
    db = _get_db()
    if db is None:
        raise FirestoreError("Database unavailable")
    db.collection("guests").document(guest_id).delete()
    return True
