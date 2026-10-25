# Known Limitations – Planora AI

In adherence to Non-Negotiable Requirement 20 & 24 (*"Maintain a clear record of incomplete work, limitations, and known defects. Do not claim verification that has not actually occurred"*), this document records current platform constraints and boundaries.

---

## 1. External Service & Credential Dependencies

### 1.1 Third-Party AI Inference (Groq)
- **Status**: Implemented and validated via structured Pydantic schemas.
- **Limitation**: Requires a valid `GROQ_API_KEY` in `backend/.env`. Free-tier rate limits and model availability are subject to Groq Cloud's terms.
- **Handling**: When credentials are unset, the system does **not** silently fake live AI calls. It explicitly activates **Demonstration Mode**, stamping the plan with a clear disclaimer and badge.

### 1.2 Cloud Firestore Database
- **Status**: Implemented with Firestore Security Rules.
- **Limitation**: Requires a GCP Service Account JSON key or Application Default Credentials (ADC) on Google Cloud.
- **Handling**: During local offline development or tests when credentials are not configured, Planora AI automatically falls back to an in-memory repository store that enforces identical user-isolation rules throughout the server process lifetime.

---

## 2. Product Scope Boundaries (v1.0.0)

### 2.1 Online Payment Gateway & Direct Checkout
- **Current State**: Not implemented in v1.0.0.
- **Rationale**: Planora AI acts as an event management and budgeting workspace. We intentionally do not simulate credit card payments or pretend checkout transactions have occurred without real banking integration.

### 2.2 Automated SMS / WhatsApp Invitation Delivery
- **Current State**: Guest management tracks phone numbers, emails, and RSVP statuses.
- **Rationale**: Direct automated dispatch of SMS or WhatsApp messages requires external Twilio/Meta Business credentials. In v1.0.0, users export guest lists to CSV to interface with their messaging tools of choice.

### 2.3 Multi-User Organization Roles & Permissions
- **Current State**: Events have a single owner (`user_id`).
- **Rationale**: Kept focused on individual organizers and multi-event planners. Multi-user collaboration (inviting co-planners with view/edit permissions) is architecturally prepared in the data model and scheduled for v1.1.0.
