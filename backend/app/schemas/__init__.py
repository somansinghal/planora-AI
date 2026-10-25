"""
Planora AI – Pydantic Schemas

Request and response validation schemas for all API endpoints.
"""

from datetime import datetime, date
from typing import Any, Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator
import re


# ── Enums ────────────────────────────────────────────────────

class EventType(str, Enum):
    WEDDING     = "wedding"
    BIRTHDAY    = "birthday"
    ANNIVERSARY = "anniversary"
    CORPORATE   = "corporate"
    GRADUATION  = "graduation"
    BABY_SHOWER = "baby_shower"
    ENGAGEMENT  = "engagement"
    RETIREMENT  = "retirement"
    FESTIVAL    = "festival"
    CONFERENCE  = "conference"
    FUNDRAISER  = "fundraiser"
    OTHER       = "other"


class Currency(str, Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    AED = "AED"
    SGD = "SGD"


class TaskStatus(str, Enum):
    TODO       = "todo"
    IN_PROGRESS = "in_progress"
    DONE       = "done"


class TaskPriority(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"


class RSVPStatus(str, Enum):
    PENDING  = "pending"
    CONFIRMED = "confirmed"
    DECLINED  = "declined"
    MAYBE    = "maybe"


class BookingStatus(str, Enum):
    NOT_CONTACTED = "not_contacted"
    CONTACTED     = "contacted"
    QUOTED        = "quoted"
    BOOKED        = "booked"
    CANCELLED     = "cancelled"


class ExpenseCategory(str, Enum):
    VENUE         = "venue"
    CATERING      = "catering"
    DECORATION    = "decoration"
    ENTERTAINMENT = "entertainment"
    PHOTOGRAPHY   = "photography"
    TRANSPORTATION = "transportation"
    ACCOMMODATION = "accommodation"
    CLOTHING      = "clothing"
    INVITATIONS   = "invitations"
    FLOWERS       = "flowers"
    CAKE          = "cake"
    SOUND_LIGHTING = "sound_lighting"
    SECURITY      = "security"
    OTHER         = "other"


# ── Validators ───────────────────────────────────────────────

def sanitize_string(v: str, max_length: int = 500) -> str:
    """Basic input sanitization."""
    if v is None:
        return v
    v = v.strip()
    # Remove null bytes
    v = v.replace('\x00', '')
    if len(v) > max_length:
        raise ValueError(f"Field must be at most {max_length} characters")
    return v


# ── Event Schemas ─────────────────────────────────────────────

class EventCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Event name")
    event_type: EventType = Field(..., description="Type of event")
    event_date: date = Field(..., description="Event date (YYYY-MM-DD)")
    location: Optional[str] = Field(None, max_length=300)
    guest_count: int = Field(..., ge=1, le=100000, description="Expected guest count")
    budget: float = Field(..., ge=0, le=1_000_000_000, description="Total budget in specified currency")
    currency: Currency = Field(default=Currency.INR)
    theme: Optional[str] = Field(None, max_length=200)
    dietary_preferences: Optional[str] = Field(None, max_length=500)
    additional_requirements: Optional[str] = Field(None, max_length=1000)

    @field_validator('name', 'location', 'theme', 'dietary_preferences', 'additional_requirements', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v

    @field_validator('event_date')
    @classmethod
    def validate_future_date(cls, v):
        from datetime import date as date_type
        today = date_type.today()
        if v < today:
            raise ValueError("Event date must be today or in the future")
        # Reasonable upper limit
        max_future = date_type(today.year + 10, today.month, today.day)
        if v > max_future:
            raise ValueError("Event date cannot be more than 10 years in the future")
        return v

    @field_validator('budget')
    @classmethod
    def validate_budget(cls, v):
        if v < 0:
            raise ValueError("Budget cannot be negative")
        return round(v, 2)


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    event_type: Optional[EventType] = None
    event_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=300)
    guest_count: Optional[int] = Field(None, ge=1, le=100000)
    budget: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    currency: Optional[Currency] = None
    theme: Optional[str] = Field(None, max_length=200)
    dietary_preferences: Optional[str] = Field(None, max_length=500)
    additional_requirements: Optional[str] = Field(None, max_length=1000)

    @field_validator('name', 'location', 'theme', 'dietary_preferences', 'additional_requirements', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v


class EventResponse(BaseModel):
    id: str
    user_id: str
    name: str
    event_type: str
    event_date: str
    location: Optional[str]
    guest_count: int
    budget: float
    currency: str
    theme: Optional[str]
    dietary_preferences: Optional[str]
    additional_requirements: Optional[str]
    created_at: str
    updated_at: str
    spent: Optional[float] = 0.0
    task_completion: Optional[float] = 0.0


class EventListResponse(BaseModel):
    events: List[EventResponse]
    total: int
    page: int = 1
    page_size: int = 50


# ── AI Plan Schemas ───────────────────────────────────────────

class GeneratePlanRequest(BaseModel):
    """User preferences for AI plan generation."""
    preferred_themes: Optional[str] = Field(None, max_length=500)
    budget_priority: Optional[str] = Field(None, max_length=200)
    additional_preferences: Optional[str] = Field(None, max_length=1000)
    include_vendor_suggestions: bool = True
    include_timeline: bool = True
    include_task_list: bool = True

    @field_validator('preferred_themes', 'budget_priority', 'additional_preferences', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v


class BudgetBreakdownItem(BaseModel):
    category: str
    estimated_amount: float
    percentage: float
    notes: Optional[str] = None

    @field_validator('estimated_amount')
    @classmethod
    def validate_amount(cls, v):
        if v < 0:
            raise ValueError("Amount cannot be negative")
        return round(v, 2)

    @field_validator('percentage')
    @classmethod
    def validate_percentage(cls, v):
        if not (0 <= v <= 100):
            raise ValueError("Percentage must be between 0 and 100")
        return round(v, 2)


class TimelineMilestone(BaseModel):
    days_before: int = Field(..., ge=0, le=3650)
    title: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    priority: str = Field(default="medium")


class EventDayScheduleItem(BaseModel):
    time: str = Field(..., max_length=20)
    activity: str = Field(..., max_length=300)
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440)
    notes: Optional[str] = Field(None, max_length=300)


class VendorSuggestion(BaseModel):
    category: str
    description: str
    estimated_cost_min: float = Field(ge=0)
    estimated_cost_max: float = Field(ge=0)
    tips: Optional[str] = None

    @model_validator(mode='after')
    def validate_cost_range(self):
        if self.estimated_cost_max < self.estimated_cost_min:
            raise ValueError("estimated_cost_max must be >= estimated_cost_min")
        return self


class EventPlanResponse(BaseModel):
    """Validated AI-generated event plan."""
    id: Optional[str] = None
    event_id: str
    event_summary: str = Field(..., max_length=2000)
    theme_ideas: List[str] = Field(..., max_items=10)
    budget_breakdown: List[BudgetBreakdownItem]
    timeline_milestones: List[TimelineMilestone]
    event_day_schedule: List[EventDayScheduleItem]
    vendor_checklist: List[VendorSuggestion]
    task_suggestions: List[str] = Field(..., max_items=50)
    personalized_recommendations: List[str] = Field(..., max_items=20)
    cost_saving_suggestions: List[str] = Field(..., max_items=15)
    disclaimer: str = Field(
        default="These are AI-generated suggestions. Costs are estimates only. Verify all vendor availability and pricing independently."
    )
    created_at: Optional[str] = None
    ai_provider: Optional[str] = None
    ai_model: Optional[str] = None

    @model_validator(mode='after')
    def validate_budget_total(self):
        """Validate that budget breakdown percentages sum to approximately 100%."""
        if self.budget_breakdown:
            total_pct = sum(item.percentage for item in self.budget_breakdown)
            if not (95 <= total_pct <= 105):
                # Normalize percentages rather than rejecting
                for item in self.budget_breakdown:
                    item.percentage = round(item.percentage * 100 / total_pct, 2)
        return self


# ── Expense Schemas ───────────────────────────────────────────

class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    name: str = Field(..., min_length=1, max_length=200)
    estimated_amount: float = Field(..., ge=0, le=1_000_000_000)
    actual_amount: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    vendor_name: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=500)
    is_paid: bool = False
    paid_date: Optional[date] = None

    @field_validator('name', 'vendor_name', 'notes', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v

    @field_validator('actual_amount', 'estimated_amount')
    @classmethod
    def validate_amount(cls, v):
        if v is not None:
            return round(v, 2)
        return v


class ExpenseUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    estimated_amount: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    actual_amount: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    vendor_name: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=500)
    is_paid: Optional[bool] = None
    paid_date: Optional[date] = None


class ExpenseResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    category: str
    name: str
    estimated_amount: float
    actual_amount: Optional[float]
    vendor_name: Optional[str]
    notes: Optional[str]
    is_paid: bool
    paid_date: Optional[str]
    created_at: str
    updated_at: str


# ── Task Schemas ──────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=1000)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    due_date: Optional[date] = None
    assigned_to: Optional[str] = Field(None, max_length=200)

    @field_validator('title', 'description', 'assigned_to', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    assigned_to: Optional[str] = Field(None, max_length=200)


class TaskResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[str]
    assigned_to: Optional[str]
    created_at: str
    updated_at: str


# ── Vendor Schemas ────────────────────────────────────────────

class VendorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., max_length=100)
    contact_name: Optional[str] = Field(None, max_length=200)
    contact_phone: Optional[str] = Field(None, max_length=20)
    contact_email: Optional[str] = Field(None, max_length=254)
    estimated_cost: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    actual_cost: Optional[float] = Field(None, ge=0, le=1_000_000_000)
    booking_status: BookingStatus = Field(default=BookingStatus.NOT_CONTACTED)
    notes: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=500)

    @field_validator('name', 'category', 'contact_name', 'notes', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v

    @field_validator('contact_email', mode='before')
    @classmethod
    def validate_email(cls, v):
        if v is not None:
            v = sanitize_string(str(v), 254)
            email_re = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
            if v and not email_re.match(v):
                raise ValueError("Invalid email address")
        return v

    @field_validator('contact_phone', mode='before')
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            v = re.sub(r'[^0-9+\-\(\) ]', '', str(v))[:20]
        return v

    @field_validator('website', mode='before')
    @classmethod
    def validate_website(cls, v):
        if v is not None:
            v = sanitize_string(str(v), 500)
            if v and not (v.startswith('http://') or v.startswith('https://')):
                v = 'https://' + v
        return v


class VendorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    contact_name: Optional[str] = Field(None, max_length=200)
    contact_phone: Optional[str] = Field(None, max_length=20)
    contact_email: Optional[str] = Field(None, max_length=254)
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    booking_status: Optional[BookingStatus] = None
    notes: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=500)


class VendorResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    name: str
    category: str
    contact_name: Optional[str]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    estimated_cost: Optional[float]
    actual_cost: Optional[float]
    booking_status: str
    notes: Optional[str]
    website: Optional[str]
    created_at: str
    updated_at: str


# ── Guest Schemas ─────────────────────────────────────────────

class GuestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: Optional[str] = Field(None, max_length=254)
    phone: Optional[str] = Field(None, max_length=20)
    rsvp_status: RSVPStatus = Field(default=RSVPStatus.PENDING)
    plus_one: bool = False
    dietary_preference: Optional[str] = Field(None, max_length=200)
    table_assignment: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator('name', 'dietary_preference', 'table_assignment', 'notes', mode='before')
    @classmethod
    def sanitize_text(cls, v):
        if v is not None:
            return sanitize_string(str(v))
        return v

    @field_validator('email', mode='before')
    @classmethod
    def validate_email(cls, v):
        if v is not None:
            v = sanitize_string(str(v), 254)
            email_re = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
            if v and not email_re.match(v):
                raise ValueError("Invalid email address")
        return v


class GuestUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[str] = Field(None, max_length=254)
    phone: Optional[str] = Field(None, max_length=20)
    rsvp_status: Optional[RSVPStatus] = None
    plus_one: Optional[bool] = None
    dietary_preference: Optional[str] = Field(None, max_length=200)
    table_assignment: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)


class GuestResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    rsvp_status: str
    plus_one: bool
    dietary_preference: Optional[str]
    table_assignment: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str


# ── Copilot Schemas ───────────────────────────────────────────

class CopilotMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., max_length=4000)


class CopilotRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[CopilotMessage] = Field(default_factory=list, max_length=20)

    @field_validator('message', mode='before')
    @classmethod
    def sanitize_message(cls, v):
        return sanitize_string(str(v), 2000)


class CopilotResponse(BaseModel):
    message: str
    suggestions: List[str] = Field(default_factory=list)
    event_changes: Optional[Dict[str, Any]] = None
    requires_confirmation: bool = False


# ── Common Response Schemas ───────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class UserProfile(BaseModel):
    uid: str
    email: Optional[str]
    display_name: Optional[str]
    created_at: Optional[str] = None
