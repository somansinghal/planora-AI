# System Architecture – Planora AI

## 1. High-Level Architecture Overview

Planora AI is engineered as a decoupled, asynchronous SaaS platform separating client-side presentation, API services, persistent data storage, and external AI inference.

```mermaid
graph TD
    Client["Client Web Browser<br/>(Vanilla JS / HTML5 / CSS3 / ES Modules)"]
    FirebaseAuth["Firebase Authentication<br/>(Identity Platform & JWT Tokens)"]
    FastAPI["FastAPI Backend Service<br/>(Uvicorn / Python 3.10+)"]
    Firestore["Cloud Firestore / In-Memory Fallback<br/>(User-Isolated Collections)"]
    Groq["Groq AI Cloud<br/>(LLaMA 3.1 8B Instant)"]

    Client -->|1. Sign in / OAuth| FirebaseAuth
    FirebaseAuth -->|2. Returns Firebase ID Token| Client
    Client -->|3. REST API Requests + Bearer Token| FastAPI
    FastAPI -->|4. Verify Token Claims| FirebaseAuth
    FastAPI -->|5. Store / Query User Data (Ownership Enforced)| Firestore
    FastAPI -->|6. Structured JSON Inference Prompt| Groq
    Groq -->|7. Raw JSON Plan| FastAPI
    FastAPI -->|8. Pydantic Validation & Normalization| Client
```

## 2. Component Breakdown

### 2.1 Frontend Client
- **Tech Stack**: HTML5, Vanilla CSS3, Modern ES Modules.
- **Role**: Render user interfaces, manage client session state via Firebase SDK, invoke REST endpoints, render Chart.js graphics, and handle modal dialogues.
- **Design System**: Tailored HSL color palette with deep obsidian canvas (`#080811`), translucent surface cards (`rgba(255,255,255,0.03)`), violet-cyan gradient accents, and Lucide vector iconography.

### 2.2 Backend Service (FastAPI)
- **Tech Stack**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2.
- **Role**: Secure API gateway, ID token validation middleware, input sanitization, database query coordinator, AI rate limiting, and output validation.
- **Key Modules**:
  - `core/config.py`: Environment variable validation and service defaults.
  - `core/security.py`: Server-side Firebase Admin ID token verification and ownership validator.
  - `core/logging.py`: Structured logger with automated credential redaction.
  - `services/ai_service.py`: Groq client manager, structured prompt builder, and token budget manager.
  - `repositories/__init__.py`: Firestore CRUD abstraction with automated in-memory dev fallback.

### 2.3 Authentication (Firebase Auth)
- Manages user identity, credentials, Google OAuth popups, and secure JWT token refresh loops.
- Emits short-lived cryptographically signed ID tokens sent via `Authorization: Bearer <token>`.

### 2.4 Persistent Storage (Cloud Firestore)
- Document-oriented NoSQL database organized by isolated user ownership collections (`events`, `eventPlans`, `expenses`, `tasks`, `vendors`, `guests`).
- Protected by Firestore Security Rules preventing browser-side unauthorized writes.

### 2.5 AI Model Provider (Groq Cloud)
- Serves low-latency inference for LLaMA 3.1 8B Instant.
- Constrained with `response_format={"type": "json_object"}` to guarantee deterministic JSON output, which is subsequently validated against Pydantic models.

## 3. Data Flow Workflows

### 3.1 Authentication Workflow
1. User logs in on `login.html` via email/password or Google OAuth.
2. Firebase Client SDK issues a JWT ID token.
3. Client stores token in memory and attaches it to all subsequent requests via `js/api.js`.
4. FastAPI `get_current_user` dependency intercepts the Authorization header, verifies signature, expiry, and revocation, and attaches `AuthenticatedUser(uid=...)` to request context.

### 3.2 AI Plan Generation Workflow
1. User configures event parameters (budget, guests, theme) in AI Event Studio.
2. Client submits `POST /api/events/{id}/generate-plan`.
3. Backend checks user ownership of event and validates that the user is within hourly rate limits (20 req/hr).
4. `build_event_plan_prompt` constructs an injection-resistant prompt including budget ceiling and cultural context.
5. Groq returns structured JSON.
6. Pydantic `EventPlanResponse` validates cost ranges and normalizes budget percentage allocations to 100%.
7. User reviews the plan and clicks "Apply to Workspace", which automatically commits expenses, timeline milestones, and task checklists into Firestore.
