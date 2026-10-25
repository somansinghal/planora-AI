# API Reference Documentation – Planora AI

**Base URL**: `http://localhost:8000/api` (or production configured domain)  
**Authentication**: Bearer Token in `Authorization: Bearer <FIREBASE_ID_TOKEN>` header (except health check).

---

## 1. System & Authentication Endpoints

### `GET /api/health`
Checks server availability and operational status.
- **Auth**: None required.
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "planora-ai-api",
  "version": "1.0.0",
  "environment": "development"
}
```

### `GET /api/me`
Returns the verified profile of the authenticated caller.
- **Auth**: Required (`Bearer <token>`).
- **Response `200 OK`**:
```json
{
  "uid": "usr_948f2190",
  "email": "planner@example.com",
  "display_name": "Suman Singhal",
  "created_at": "2026-10-25T08:00:00Z"
}
```

### `POST /api/auth/verify`
Validates that the provided Firebase ID token is active and unrevoked.
- **Response `200 OK`**: `UserProfile`

### `POST /api/auth/logout`
Records sign-out audit entry.
- **Response `200 OK`**: `{"message": "Successfully signed out."}`

---

## 2. Event Endpoints

### `GET /api/events`
Lists all events created by the authenticated user with real-time spend & task progress metrics.
- **Query Parameters**:
  - `page`: integer (default: `1`)
  - `page_size`: integer (default: `50`, max: `100`)
- **Response `200 OK`**:
```json
{
  "events": [
    {
      "id": "e9b72c91-92f1-4c12-bda2-1b12b591b920",
      "user_id": "usr_948f2190",
      "name": "Arjun & Priya's Sangeet Celebration",
      "event_type": "wedding",
      "event_date": "2026-12-15",
      "location": "The Oberoi Grand, Mumbai",
      "guest_count": 250,
      "budget": 1200000.0,
      "currency": "INR",
      "theme": "Modern Royal Bollywood",
      "dietary_preferences": "Jain & Vegetarian",
      "additional_requirements": "Sound curfew at 11 PM",
      "spent": 450000.0,
      "task_completion": 62.5,
      "created_at": "2026-10-25T08:30:00Z",
      "updated_at": "2026-10-25T08:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

### `POST /api/events`
Creates a new event workspace.
- **Request Body**:
```json
{
  "name": "Annual Product Keynote 2026",
  "event_type": "corporate",
  "event_date": "2026-11-20",
  "location": "Bangalore Tech Convention Center",
  "guest_count": 400,
  "budget": 2000000.0,
  "currency": "INR",
  "theme": "Futuristic Minimalist",
  "dietary_preferences": "Continental & North Indian",
  "additional_requirements": "High speed Wi-Fi for 500 devices"
}
```
- **Response `201 Created`**: Returns created `EventResponse`.

### `GET /api/events/{event_id}`
Retrieves a single event. Enforces user ownership (`403 Forbidden` if owned by another user).

### `PATCH /api/events/{event_id}`
Updates editable fields on an event.

### `DELETE /api/events/{event_id}`
Cascades deletion to all expenses, tasks, vendors, and guests associated with this event.
- **Response `200 OK`**: `{"message": "Event deleted successfully."}`

---

## 3. AI Event Studio Endpoints

### `POST /api/events/{event_id}/generate-plan`
Generates a structured, validated AI event plan via Groq (or clearly labeled demo mode if uncredentialed).
- **Rate Limit**: 20 requests per hour per user.
- **Request Body**:
```json
{
  "preferred_themes": "Pastel Bloom & Fairy Lights",
  "budget_priority": "venue_food",
  "additional_preferences": "Include mocktail bar for cocktail hour",
  "include_vendor_suggestions": true,
  "include_timeline": true,
  "include_task_list": true
}
```
- **Response `200 OK`**: Returns validated `EventPlanResponse` including summary, budget allocations, milestones, day-of schedule, vendor recommendations, and cost-saving ideas.

### `POST /api/events/{event_id}/plans?apply_to_workspace=true`
Accepts and persists a plan. When `apply_to_workspace=true`, automatically seeds expenses, milestone tasks, and vendor checklists into the event workspace.

### `GET /api/events/{event_id}/plans`
Lists previously generated and saved plans for an event.

---

## 4. Budget & Expense Endpoints

### `GET /api/events/{event_id}/expenses`
Lists all itemized expense records for an event.

### `POST /api/events/{event_id}/expenses`
Creates a new expense item.
- **Request Body**:
```json
{
  "category": "catering",
  "name": "Live Chaat & Dosa Counters",
  "estimated_amount": 150000.0,
  "actual_amount": 140000.0,
  "vendor_name": "Spice Route Hospitality",
  "is_paid": true,
  "notes": "Advance payment of ₹50,000 made on Oct 20"
}
```

### `GET /api/events/{event_id}/budget-summary`
Computes real-time totals, category breakdown, utilization percentage, and over-budget status.
- **Response `200 OK`**:
```json
{
  "event_id": "e9b72c91-...",
  "currency": "INR",
  "total_budget": 1200000.0,
  "total_estimated": 1150000.0,
  "total_actual": 450000.0,
  "remaining_budget": 750000.0,
  "utilization_percentage": 37.5,
  "over_budget": false,
  "category_breakdown": [
    { "category": "catering", "estimated_total": 350000.0, "actual_total": 140000.0, "item_count": 2 },
    { "category": "venue", "estimated_total": 500000.0, "actual_total": 250000.0, "item_count": 1 }
  ]
}
```

### `PATCH /api/expenses/{expense_id}`
Updates an expense item (e.g. marking as paid, updating actual amount).

### `DELETE /api/expenses/{expense_id}`
Deletes an expense item.

---

## 5. Task Endpoints

- `GET /api/events/{event_id}/tasks?status=todo&priority=high`
- `POST /api/events/{event_id}/tasks`
- `PATCH /api/tasks/{task_id}`
- `DELETE /api/tasks/{task_id}`

---

## 6. Vendor Endpoints

- `GET /api/events/{event_id}/vendors`
- `POST /api/events/{event_id}/vendors`
- `PATCH /api/vendors/{vendor_id}`
- `DELETE /api/vendors/{vendor_id}`

---

## 7. Guest Endpoints

- `GET /api/events/{event_id}/guests`
- `POST /api/events/{event_id}/guests`
- `GET /api/events/{event_id}/guests/summary`
- `PATCH /api/guests/{guest_id}`
- `DELETE /api/guests/{guest_id}`

---

## 8. AI Copilot Endpoint

### `POST /api/events/{event_id}/copilot`
Contextual query to AI Co-planner grounded in current budget, task count, and RSVP headcounts.
- **Request Body**:
```json
{
  "message": "We have 30 more guests attending than planned. How should we adjust catering?",
  "history": [
    { "role": "user", "content": "Hello Copilot" },
    { "role": "assistant", "content": "Hello! How can I assist with your planning today?" }
  ]
}
```

---

## 9. Reports & Export Endpoints

- `GET /api/events/{event_id}/report`: Returns aggregated master dossier with budget overview, task completion, and vendor roster.
- `GET /api/events/{event_id}/export/csv?export_type=expenses|guests|tasks`: Direct downloadable CSV file.
