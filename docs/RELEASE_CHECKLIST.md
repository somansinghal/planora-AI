# Release Checklist – Planora AI v1.0.0

This checklist must be reviewed before certifying any staging or production release.

---

## 1. Product Functionality Checklist

- [x] **Public Landing Page**: Responsive layout, hero, features, workflow, pricing previews, FAQ, and footer links active.
- [x] **Authentication**: Email/Password registration, Login, and Google OAuth flows functional.
- [x] **Route Guards**: Unauthenticated users cannot view private workspace pages without redirection.
- [x] **Event Management**: Create, view, edit, and delete events with cascading sub-collection cleanup.
- [x] **AI Event Studio**: Structured plan generation, normalized budget allocations, milestone roadmap, and one-click workspace populator.
- [x] **Budget Management**: Real-time spend totals, remaining balance, utilization bar, Chart.js donut chart, and itemized expenses.
- [x] **Timeline**: T-minus milestone countdown and hour-by-hour event day schedule.
- [x] **Task Manager**: Checkbox completion toggles, status filters (All, Todo, In Progress, Done), and priority badges.
- [x] **Vendor Management**: Booking status badges, quote trackers, contact details, and card directory.
- [x] **Guest Management**: RSVP summary metrics, dietary notes, +1 headcount math, and table zones.
- [x] **AI Copilot**: Contextual co-planning assistant grounded in current event data.
- [x] **Reports & Exports**: Executive master report, print-ready PDF stylesheet, and CSV downloads for budgets, guests, and tasks.

---

## 2. Security & Compliance Checklist

- [x] **Token Verification**: Every protected API route enforces Firebase ID token verification server-side.
- [x] **Resource Ownership**: Endpoints verify that the caller owns the resource; cross-user tampering returns `403 Forbidden`.
- [x] **Firestore Security Rules**: Rules file deployed and verified in `firebase/firestore.rules`.
- [x] **Secret Isolation**: Zero private keys or AI secrets committed to Git or present in client bundles.
- [x] **Input Validation**: Pydantic v2 schemas sanitize and validate strings, numeric ranges, and dates.
- [x] **HTTP Headers**: Nosniff, Frame-Options, XSS-Protection, and Referrer-Policy headers enforced by FastAPI middleware.
- [x] **Sensitive Data Redaction**: Loggers automatically mask authorization tokens and API secrets.

---

## 3. Testing & Verification Checklist

- [x] **Backend Integration Tests**: All 15 tests in `backend/tests/test_api.py` pass cleanly.
- [x] **Playwright Browser Tests**: Automated browser navigation, forms, and workflows verified.
- [x] **Responsive Layouts**: Verified across Mobile (<768px), Tablet (768–1024px), and Desktop (1440px+).
- [x] **Accessibility**: WCAG 2.1 AA compliance verified (semantic HTML, focus indicators, labels, contrast).
- [x] **SEO Directives**: Public pages indexed; private workspace pages strictly protected with `noindex, nofollow`.

---

## 4. Documentation & Deliverables

- [x] `README.md` with complete architecture, startup, and testing guides.
- [x] Root `LICENSE` (MIT License).
- [x] `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- [x] Complete `docs/` technical library (Architecture, DB Schema, API, Audits, Troubleshooting, Deployment).
- [x] `.env.example` with clear client vs server separation.
