# Product Requirements Document (PRD) – Planora AI

## 1. Functional Requirements

### 1.1 Authentication & Authorization
- **FR-AUTH-1**: Users must be able to register and sign in using Email/Password and Google OAuth via Firebase Authentication.
- **FR-AUTH-2**: All protected frontend pages must verify session tokens before rendering workspace components.
- **FR-AUTH-3**: All backend API endpoints under `/api/*` (except `/api/health`) must require a valid Bearer token and verify it server-side.
- **FR-AUTH-4**: Users can sign out gracefully, clearing stored session tokens and redirecting to the public landing page.

### 1.2 Event Creation & Workspace Lifecycle
- **FR-EVT-1**: Users can create events specifying: Name, Event Type, Future Event Date, Location, Expected Guest Count, Budget Target, and Currency (INR default).
- **FR-EVT-2**: Input validation must reject negative budgets, empty names, and past event dates.
- **FR-EVT-3**: Users can edit event metadata and delete events with cascading removal of associated sub-records.
- **FR-EVT-4**: Strict cross-user data isolation: Users cannot view or modify events belonging to other accounts (HTTP 403 Forbidden).

### 1.3 AI Event Studio
- **FR-AI-1**: The AI Event Studio accepts event parameters and user preferences (theme direction, budget priorities, custom requirements).
- **FR-AI-2**: Generated plans must adhere to a structured schema: Executive Summary, Theme Ideas, Budget Allocations, Milestones, Day-of Run Sheet, Vendor Recommendations, Task Suggestions, and Cost-Saving Ideas.
- **FR-AI-3**: Budget allocation percentages must be normalized to sum to 100%.
- **FR-AI-4**: In offline or uncredentialed mode, the system must clearly label output as "Demonstration Mode" rather than pretending it was a live AI response.
- **FR-AI-5**: Users can review generated plans and click "Apply to Workspace" to automatically populate expenses, tasks, and vendors into their workspace.

### 1.4 Financial & Budget Management
- **FR-BDG-1**: Track estimated and actual expenses across 14 event categories (venue, catering, decor, photography, entertainment, etc.).
- **FR-BDG-2**: Display real-time total budget, estimated spend, actual spend, remaining balance, and utilization percentage.
- **FR-BDG-3**: Highlight over-budget status when actual expenses exceed the planned budget.
- **FR-BDG-4**: Render category distribution charts using Chart.js.
- **FR-BDG-5**: Export itemized expenses to CSV.

### 1.5 Timeline & Operations
- **FR-TIM-1**: Display countdown days remaining until target event date.
- **FR-TIM-2**: Render preparation roadmap organized by T-minus days before event.
- **FR-TIM-3**: Render hour-by-hour event-day run sheet with start times, activities, and durations.

### 1.6 Task Management
- **FR-TSK-1**: Create, edit, and delete tasks with priority (High, Medium, Low) and due dates.
- **FR-TSK-2**: Filter tasks by status (All, To Do, In Progress, Done) and search query.
- **FR-TSK-3**: Quick toggle task completion with instant dashboard metric updates.

### 1.7 Vendor & Guest Management
- **FR-VND-1**: Organize vendor contacts, quotes, websites, and booking status badges (Booked, Quoted, Contacted, Not Contacted).
- **FR-GST-1**: Manage guest lists with RSVP statuses (Confirmed, Pending, Declined, Maybe), +1 headcount tracking, dietary preferences, and table assignments.
- **FR-GST-2**: Compute real-time confirmed attendee headcounts.

### 1.8 AI Event Copilot
- **FR-COP-1**: Conversational co-planner grounded in current event data (budget, timeline, tasks, guests).
- **FR-COP-2**: Quick prompt chips for instant budget cutting suggestions, timeline checks, and catering advice.

### 1.9 Reports & Exports
- **FR-REP-1**: Executive master report summarizing event dossier, financial audit, task readiness, and attendance.
- **FR-REP-2**: One-click downloads for JSON master dossier, Expenses CSV, Tasks CSV, and Guests CSV.
- **FR-REP-3**: Print-optimized stylesheet for paper or PDF export.

## 2. Non-Functional Requirements

- **Performance**: Public landing page loads in < 1 second. Backend API response latency < 150ms for database operations.
- **Security**: Zero plain-text credentials in logs or frontend. CORS restricted to authorized domains. OWASP Top 10 defenses active.
- **Accessibility**: Semantic HTML5 tags, WCAG AA color contrast, visible focus indicators, and ARIA labels on all modal and navigation elements.
- **Responsiveness**: Fluid layout across Desktop (1440px+), Tablet (768px–1024px), and Mobile (< 768px).
