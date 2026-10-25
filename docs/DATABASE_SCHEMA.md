# Database Schema Documentation – Planora AI

Planora AI utilizes Cloud Firestore as its primary document database, structured with a flat, ownership-indexed collection layout. Every record contains an explicit `user_id` foreign reference to ensure multi-tenant security and straightforward query filtering.

## 1. Collections Overview

```
Firestore Database
├── users/{userId}
├── events/{eventId}
├── eventPlans/{planId}
├── expenses/{expenseId}
├── tasks/{taskId}
├── vendors/{vendorId}
├── guests/{guestId}
└── usageRecords/{recordId}
```

---

## 2. Document Schema Definitions

### 2.1 `users`
Represents an authenticated user account profile.

| Field Name | Type | Description |
|---|---|---|
| `uid` | string (PK) | Firebase Auth unique user identifier. |
| `email` | string | User's verified email address. |
| `display_name` | string | User's full name or greeting. |
| `preferred_currency` | string | Default currency code (e.g. `"INR"`). |
| `created_at` | string (ISO-8601) | Timestamp of registration. |
| `updated_at` | string (ISO-8601) | Timestamp of last preference update. |

---

### 2.2 `events`
Core event workspace entity.

| Field Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique event identifier. |
| `user_id` | string (FK) | Firebase UID of the owner. |
| `name` | string | Title of celebration (1–200 characters). |
| `event_type` | string (enum) | `wedding`, `birthday`, `anniversary`, `corporate`, etc. |
| `event_date` | string (YYYY-MM-DD) | Scheduled event date. |
| `location` | string (optional) | City, venue name, or address. |
| `guest_count` | integer | Planned attendee count (1–100,000). |
| `budget` | float | Target total budget in specified currency. |
| `currency` | string | `"INR"`, `"USD"`, `"EUR"`, `"GBP"`, `"AED"`, `"SGD"`. |
| `theme` | string (optional) | Decor/aesthetic direction. |
| `dietary_preferences` | string (optional) | Catering preferences (e.g. Jain, Vegetarian). |
| `additional_requirements`| string (optional) | Special notes or constraints. |
| `spent` | float | Calculated actual spent amount. |
| `task_completion` | float | Percentage of completed tasks (0–100%). |
| `created_at` | string (ISO-8601) | Record creation timestamp. |
| `updated_at` | string (ISO-8601) | Last modification timestamp. |

---

### 2.3 `eventPlans`
AI-generated master blueprint associated with an event.

| Field Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique plan identifier. |
| `user_id` | string (FK) | Owner UID. |
| `event_id` | string (FK) | Associated event ID. |
| `event_summary` | string | AI synthesized executive overview. |
| `theme_ideas` | array[string] | Curated decor & styling concepts. |
| `budget_breakdown` | array[object] | Array of `{category, estimated_amount, percentage, notes}`. |
| `timeline_milestones` | array[object] | Array of `{days_before, title, description, priority}`. |
| `event_day_schedule` | array[object] | Array of `{time, activity, duration_minutes, notes}`. |
| `vendor_checklist` | array[object] | Array of `{category, description, estimated_cost_min, estimated_cost_max, tips}`. |
| `task_suggestions` | array[string] | Key preparation tasks suggested by AI. |
| `personalized_recommendations` | array[string] | Bespoke logistics tips. |
| `cost_saving_suggestions` | array[string] | Practical budget optimization ideas. |
| `disclaimer` | string | AI estimation notice. |
| `ai_provider` | string | AI model provider (e.g. `"groq"` or `"demonstration_mode"`). |
| `ai_model` | string | Model name (e.g. `"llama-3.1-8b-instant"`). |
| `created_at` | string (ISO-8601) | Generation timestamp. |

---

### 2.4 `expenses`
Itemized budget items and vendor receipts.

| Field Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique expense identifier. |
| `user_id` | string (FK) | Owner UID. |
| `event_id` | string (FK) | Associated event ID. |
| `category` | string (enum) | `venue`, `catering`, `decoration`, `photography`, `entertainment`, etc. |
| `name` | string | Expense title / line item. |
| `estimated_amount` | float | Projected cost. |
| `actual_amount` | float (optional) | Verified paid or quoted cost. |
| `vendor_name` | string (optional) | Payee / vendor. |
| `is_paid` | boolean | Settlement status. |
| `paid_date` | string (optional) | Payment date. |
| `notes` | string (optional) | Invoice or receipt reference. |
| `created_at` | string (ISO-8601) | Creation timestamp. |
| `updated_at` | string (ISO-8601) | Update timestamp. |

---

### 2.5 `tasks`
Operational checklist items.

| Field Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique task identifier. |
| `user_id` | string (FK) | Owner UID. |
| `event_id` | string (FK) | Associated event ID. |
| `title` | string | Task summary. |
| `description` | string (optional) | Actionable instructions. |
| `status` | string (enum) | `todo`, `in_progress`, `done`. |
| `priority` | string (enum) | `high`, `medium`, `low`. |
| `due_date` | string (optional) | Target deadline. |
| `assigned_to` | string (optional) | Responsible person. |
| `created_at` | string (ISO-8601) | Creation timestamp. |
| `updated_at` | string (ISO-8601) | Update timestamp. |

---

### 2.6 `vendors`
Contractors and vendor directory.

| Field Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique vendor record ID. |
| `user_id` | string (FK) | Owner UID. |
| `event_id` | string (FK) | Associated event ID. |
| `name` | string | Vendor / business name. |
| `category` | string | Service domain (e.g. Florist, Audio). |
| `contact_name` | string (optional) | Point of contact. |
| `contact_phone` | string (optional) | Phone number. |
| `contact_email` | string (optional) | Email address. |
| `booking_status` | string (enum) | `not_contacted`, `contacted`, `quoted`, `booked`, `cancelled`. |
| `estimated_cost` | float (optional) | Quoted cost. |
| `website` | string (optional) | Portfolio or booking URL. |
| `notes` | string (optional) | Contract terms. |
| `created_at` | string (ISO-8601) | Timestamp. |

---

### 2.7 `guests`
Attendee RSVP and hospitality directory.

| Field Name | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique guest record ID. |
| `user_id` | string (FK) | Owner UID. |
| `event_id` | string (FK) | Associated event ID. |
| `name` | string | Guest full name. |
| `email` | string (optional) | Email for correspondence. |
| `phone` | string (optional) | Phone for SMS/WhatsApp. |
| `rsvp_status` | string (enum) | `pending`, `confirmed`, `declined`, `maybe`. |
| `plus_one` | boolean | Attending with a partner/guest. |
| `dietary_preference` | string (optional) | Dietary needs (e.g. Vegetarian, Jain). |
| `table_assignment` | string (optional) | Assigned table or seating zone. |
| `notes` | string (optional) | Special accommodations. |
| `created_at` | string (ISO-8601) | Timestamp. |

---

## 3. Cascading Deletion Strategy

When an event document is deleted (`DELETE /api/events/{event_id}`), the backend repository executes atomic sub-collection cleanup:
1. All `expenses` matching `event_id == event_id` are deleted.
2. All `tasks` matching `event_id == event_id` are deleted.
3. All `vendors` matching `event_id == event_id` are deleted.
4. All `guests` matching `event_id == event_id` are deleted.
5. All `eventPlans` matching `event_id == event_id` are deleted.
6. The primary `events/{event_id}` document is permanently deleted.

This ensures no orphaned records remain in the database.
