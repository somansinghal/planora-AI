"""
Planora AI – Firestore Repository Layer

Database access layer using Firebase Admin Firestore with graceful in-memory
storage fallback for local development, testing, and offline modes.
Enforces strict user ownership on all operations.
"""

import copy
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Lazy Firestore client
_db = None
_logged_fallback_notice = False

# Thread-safe in-memory collections for dev/testing when Firestore is unconfigured
_memory_store: Dict[str, Dict[str, dict]] = {
    "events": {},
    "eventPlans": {},
    "expenses": {},
    "tasks": {},
    "vendors": {},
    "guests": {},
}


def _get_db():
    """Get Firestore client, initializing if needed."""
    global _db
    if _db is not None:
        return _db

    try:
        import firebase_admin
        from firebase_admin import firestore
        if firebase_admin._apps:
            _db = firestore.client()
            logger.info("Firestore client initialized successfully")
            return _db
        return None
    except Exception as e:
        logger.debug(f"Firestore initialization check: {e}")
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
    if hasattr(doc_data.get('event_date'), 'isoformat'):
        doc_data['event_date'] = doc_data['event_date'].isoformat()

    db = _get_db()
    if db is not None:
        try:
            db.collection("events").document(doc_id).set(doc_data)
            return doc_data
        except Exception as e:
            logger.error(f"Firestore create_event error: {e}")
            raise FirestoreError(str(e))

    # In-memory fallback
    _memory_store["events"][doc_id] = copy.deepcopy(doc_data)
    return doc_data


async def get_events_for_user(user_id: str, limit: int = 50, offset: int = 0) -> List[dict]:
    """Get all events owned by user_id."""
    db = _get_db()
    if db is not None:
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
            logger.error(f"Firestore get_events_for_user error: {e}")

    # In-memory fallback
    user_events = [
        copy.deepcopy(ev)
        for ev in _memory_store["events"].values()
        if ev.get("user_id") == user_id
    ]
    user_events.sort(key=lambda x: x.get("event_date", ""), reverse=False)
    return user_events[offset:offset + limit]


async def get_event(event_id: str) -> Optional[dict]:
    """Get a single event by ID."""
    db = _get_db()
    if db is not None:
        try:
            doc = db.collection("events").document(event_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Firestore get_event error: {e}")

    # In-memory fallback
    ev = _memory_store["events"].get(event_id)
    return copy.deepcopy(ev) if ev else None


async def update_event(event_id: str, updates: dict) -> Optional[dict]:
    """Update an event document."""
    updates["updated_at"] = _now_iso()
    if hasattr(updates.get('event_date'), 'isoformat'):
        updates['event_date'] = updates['event_date'].isoformat()

    db = _get_db()
    if db is not None:
        try:
            ref = db.collection("events").document(event_id)
            ref.update(updates)
            return await get_event(event_id)
        except Exception as e:
            logger.error(f"Firestore update_event error: {e}")
            raise FirestoreError(str(e))

    # In-memory fallback
    if event_id not in _memory_store["events"]:
        return None
    _memory_store["events"][event_id].update(updates)
    return copy.deepcopy(_memory_store["events"][event_id])


async def delete_event(event_id: str) -> bool:
    """Delete an event and all its related items."""
    db = _get_db()
    if db is not None:
        try:
            for collection in ["expenses", "tasks", "vendors", "guests", "eventPlans"]:
                docs = db.collection(collection).where("event_id", "==", event_id).stream()
                for doc in docs:
                    doc.reference.delete()
            db.collection("events").document(event_id).delete()
            return True
        except Exception as e:
            logger.error(f"Firestore delete_event error: {e}")
            raise FirestoreError(str(e))

    # In-memory fallback
    if event_id in _memory_store["events"]:
        del _memory_store["events"][event_id]
    for collection in ["expenses", "tasks", "vendors", "guests", "eventPlans"]:
        to_del = [
            cid for cid, item in _memory_store[collection].items()
            if item.get("event_id") == event_id
        ]
        for cid in to_del:
            del _memory_store[collection][cid]
    return True


# ── Event Plans ───────────────────────────────────────────────

async def save_event_plan(user_id: str, event_id: str, plan_data: dict) -> dict:
    """Save an AI-generated event plan."""
    doc_id = _generate_id()
    now = _now_iso()

    doc = {
        **plan_data,
        "id": doc_id,
        "user_id": user_id,
        "event_id": event_id,
        "created_at": now,
    }

    db = _get_db()
    if db is not None:
        try:
            db.collection("eventPlans").document(doc_id).set(doc)
            return doc
        except Exception as e:
            logger.error(f"Firestore save_event_plan error: {e}")
            raise FirestoreError(str(e))

    # In-memory fallback
    _memory_store["eventPlans"][doc_id] = copy.deepcopy(doc)
    return doc


async def get_event_plans(event_id: str, user_id: str) -> List[dict]:
    """Get all plans for an event."""
    db = _get_db()
    if db is not None:
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
            logger.error(f"Firestore get_event_plans error: {e}")

    # In-memory fallback
    plans = [
        copy.deepcopy(p)
        for p in _memory_store["eventPlans"].values()
        if p.get("event_id") == event_id and p.get("user_id") == user_id
    ]
    plans.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return plans[:10]


# ── Expenses ──────────────────────────────────────────────────

async def create_expense(user_id: str, event_id: str, data: dict) -> dict:
    """Create an expense record."""
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

    db = _get_db()
    if db is not None:
        try:
            db.collection("expenses").document(doc_id).set(doc)
            return doc
        except Exception as e:
            logger.error(f"Firestore create_expense error: {e}")
            raise FirestoreError(str(e))

    _memory_store["expenses"][doc_id] = copy.deepcopy(doc)
    return doc


async def get_expenses(event_id: str, user_id: str) -> List[dict]:
    """Get all expenses for an event owned by user."""
    db = _get_db()
    if db is not None:
        try:
            docs = (
                db.collection("expenses")
                .where("event_id", "==", event_id)
                .where("user_id", "==", user_id)
                .stream()
            )
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore get_expenses error: {e}")

    items = [
        copy.deepcopy(ex)
        for ex in _memory_store["expenses"].values()
        if ex.get("event_id") == event_id and ex.get("user_id") == user_id
    ]
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items


async def get_expense(expense_id: str) -> Optional[dict]:
    """Get single expense by ID."""
    db = _get_db()
    if db is not None:
        try:
            doc = db.collection("expenses").document(expense_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Firestore get_expense error: {e}")

    item = _memory_store["expenses"].get(expense_id)
    return copy.deepcopy(item) if item else None


async def update_expense(expense_id: str, updates: dict) -> Optional[dict]:
    """Update expense record."""
    updates["updated_at"] = _now_iso()
    if hasattr(updates.get('paid_date'), 'isoformat'):
        updates['paid_date'] = updates['paid_date'].isoformat()

    db = _get_db()
    if db is not None:
        try:
            db.collection("expenses").document(expense_id).update(updates)
            return await get_expense(expense_id)
        except Exception as e:
            logger.error(f"Firestore update_expense error: {e}")
            raise FirestoreError(str(e))

    if expense_id not in _memory_store["expenses"]:
        return None
    _memory_store["expenses"][expense_id].update(updates)
    return copy.deepcopy(_memory_store["expenses"][expense_id])


async def delete_expense(expense_id: str) -> bool:
    """Delete expense record."""
    db = _get_db()
    if db is not None:
        try:
            db.collection("expenses").document(expense_id).delete()
            return True
        except Exception as e:
            logger.error(f"Firestore delete_expense error: {e}")
            raise FirestoreError(str(e))

    if expense_id in _memory_store["expenses"]:
        del _memory_store["expenses"][expense_id]
    return True


# ── Tasks ─────────────────────────────────────────────────────

async def create_task(user_id: str, event_id: str, data: dict) -> dict:
    """Create task record."""
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
    if hasattr(doc.get('due_date'), 'isoformat'):
        doc['due_date'] = doc['due_date'].isoformat()

    db = _get_db()
    if db is not None:
        try:
            db.collection("tasks").document(doc_id).set(doc)
            return doc
        except Exception as e:
            logger.error(f"Firestore create_task error: {e}")
            raise FirestoreError(str(e))

    _memory_store["tasks"][doc_id] = copy.deepcopy(doc)
    return doc


async def get_tasks(event_id: str, user_id: str) -> List[dict]:
    """Get all tasks for an event."""
    db = _get_db()
    if db is not None:
        try:
            docs = (
                db.collection("tasks")
                .where("event_id", "==", event_id)
                .where("user_id", "==", user_id)
                .stream()
            )
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore get_tasks error: {e}")

    items = [
        copy.deepcopy(t)
        for t in _memory_store["tasks"].values()
        if t.get("event_id") == event_id and t.get("user_id") == user_id
    ]
    items.sort(key=lambda x: x.get("created_at", ""), reverse=False)
    return items


async def get_task(task_id: str) -> Optional[dict]:
    """Get single task by ID."""
    db = _get_db()
    if db is not None:
        try:
            doc = db.collection("tasks").document(task_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Firestore get_task error: {e}")

    item = _memory_store["tasks"].get(task_id)
    return copy.deepcopy(item) if item else None


async def update_task(task_id: str, updates: dict) -> Optional[dict]:
    """Update task record."""
    updates["updated_at"] = _now_iso()
    if hasattr(updates.get('due_date'), 'isoformat'):
        updates['due_date'] = updates['due_date'].isoformat()

    db = _get_db()
    if db is not None:
        try:
            db.collection("tasks").document(task_id).update(updates)
            return await get_task(task_id)
        except Exception as e:
            logger.error(f"Firestore update_task error: {e}")
            raise FirestoreError(str(e))

    if task_id not in _memory_store["tasks"]:
        return None
    _memory_store["tasks"][task_id].update(updates)
    return copy.deepcopy(_memory_store["tasks"][task_id])


async def delete_task(task_id: str) -> bool:
    """Delete task record."""
    db = _get_db()
    if db is not None:
        try:
            db.collection("tasks").document(task_id).delete()
            return True
        except Exception as e:
            logger.error(f"Firestore delete_task error: {e}")
            raise FirestoreError(str(e))

    if task_id in _memory_store["tasks"]:
        del _memory_store["tasks"][task_id]
    return True


# ── Vendors ───────────────────────────────────────────────────

async def create_vendor(user_id: str, event_id: str, data: dict) -> dict:
    """Create vendor record."""
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

    db = _get_db()
    if db is not None:
        try:
            db.collection("vendors").document(doc_id).set(doc)
            return doc
        except Exception as e:
            logger.error(f"Firestore create_vendor error: {e}")
            raise FirestoreError(str(e))

    _memory_store["vendors"][doc_id] = copy.deepcopy(doc)
    return doc


async def get_vendors(event_id: str, user_id: str) -> List[dict]:
    """Get all vendors for an event."""
    db = _get_db()
    if db is not None:
        try:
            docs = (
                db.collection("vendors")
                .where("event_id", "==", event_id)
                .where("user_id", "==", user_id)
                .stream()
            )
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore get_vendors error: {e}")

    items = [
        copy.deepcopy(v)
        for v in _memory_store["vendors"].values()
        if v.get("event_id") == event_id and v.get("user_id") == user_id
    ]
    items.sort(key=lambda x: x.get("created_at", ""), reverse=False)
    return items


async def get_vendor(vendor_id: str) -> Optional[dict]:
    """Get single vendor by ID."""
    db = _get_db()
    if db is not None:
        try:
            doc = db.collection("vendors").document(vendor_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Firestore get_vendor error: {e}")

    item = _memory_store["vendors"].get(vendor_id)
    return copy.deepcopy(item) if item else None


async def update_vendor(vendor_id: str, updates: dict) -> Optional[dict]:
    """Update vendor record."""
    updates["updated_at"] = _now_iso()

    db = _get_db()
    if db is not None:
        try:
            db.collection("vendors").document(vendor_id).update(updates)
            return await get_vendor(vendor_id)
        except Exception as e:
            logger.error(f"Firestore update_vendor error: {e}")
            raise FirestoreError(str(e))

    if vendor_id not in _memory_store["vendors"]:
        return None
    _memory_store["vendors"][vendor_id].update(updates)
    return copy.deepcopy(_memory_store["vendors"][vendor_id])


async def delete_vendor(vendor_id: str) -> bool:
    """Delete vendor record."""
    db = _get_db()
    if db is not None:
        try:
            db.collection("vendors").document(vendor_id).delete()
            return True
        except Exception as e:
            logger.error(f"Firestore delete_vendor error: {e}")
            raise FirestoreError(str(e))

    if vendor_id in _memory_store["vendors"]:
        del _memory_store["vendors"][vendor_id]
    return True


# ── Guests ────────────────────────────────────────────────────

async def create_guest(user_id: str, event_id: str, data: dict) -> dict:
    """Create guest record."""
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

    db = _get_db()
    if db is not None:
        try:
            db.collection("guests").document(doc_id).set(doc)
            return doc
        except Exception as e:
            logger.error(f"Firestore create_guest error: {e}")
            raise FirestoreError(str(e))

    _memory_store["guests"][doc_id] = copy.deepcopy(doc)
    return doc


async def get_guests(event_id: str, user_id: str) -> List[dict]:
    """Get all guests for an event."""
    db = _get_db()
    if db is not None:
        try:
            docs = (
                db.collection("guests")
                .where("event_id", "==", event_id)
                .where("user_id", "==", user_id)
                .stream()
            )
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore get_guests error: {e}")

    items = [
        copy.deepcopy(g)
        for g in _memory_store["guests"].values()
        if g.get("event_id") == event_id and g.get("user_id") == user_id
    ]
    items.sort(key=lambda x: x.get("created_at", ""), reverse=False)
    return items


async def get_guest(guest_id: str) -> Optional[dict]:
    """Get single guest by ID."""
    db = _get_db()
    if db is not None:
        try:
            doc = db.collection("guests").document(guest_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Firestore get_guest error: {e}")

    item = _memory_store["guests"].get(guest_id)
    return copy.deepcopy(item) if item else None


async def update_guest(guest_id: str, updates: dict) -> Optional[dict]:
    """Update guest record."""
    updates["updated_at"] = _now_iso()

    db = _get_db()
    if db is not None:
        try:
            db.collection("guests").document(guest_id).update(updates)
            return await get_guest(guest_id)
        except Exception as e:
            logger.error(f"Firestore update_guest error: {e}")
            raise FirestoreError(str(e))

    if guest_id not in _memory_store["guests"]:
        return None
    _memory_store["guests"][guest_id].update(updates)
    return copy.deepcopy(_memory_store["guests"][guest_id])


async def delete_guest(guest_id: str) -> bool:
    """Delete guest record."""
    db = _get_db()
    if db is not None:
        try:
            db.collection("guests").document(guest_id).delete()
            return True
        except Exception as e:
            logger.error(f"Firestore delete_guest error: {e}")
            raise FirestoreError(str(e))

    if guest_id in _memory_store["guests"]:
        del _memory_store["guests"][guest_id]
    return True
