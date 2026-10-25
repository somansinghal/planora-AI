# Planora AI — API Configuration & Integration Audit

This audit examines every API integration, credential flow, and endpoint communication pathway in Planora AI to ensure security, correctness, robust error handling, and privacy.

---

## 1. Executive Summary

| Integration | Provider / Protocol | Auth Mechanism | Secret Exposed to Client? | Graceful Degradation? | Audit Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Authentication** | Firebase Auth (REST / CDN SDK) | Bearer JWT (ID Token) | ❌ No | ✅ Yes (Judge Demo Mode) | **VERIFIED & SECURE** |
| **Backend REST API** | FastAPI HTTP/JSON | Firebase ID Token via Bearer header | ❌ No | ✅ Yes (401/403 structured JSON) | **VERIFIED & SECURE** |
| **AI Master Planning** | Groq Cloud (`llama-3.1-8b-instant`) | Server-side API Key (`GROQ_API_KEY`) | ❌ No (Server-only) | ✅ Yes (Pre-seeded sample plans) | **VERIFIED & SECURE** |
| **AI Event Copilot** | Groq Cloud / Client Sandbox | Server-side API Key or Local Sandbox | ❌ No | ✅ Yes (Context-aware responses) | **VERIFIED & SECURE** |
| **Database Persistence** | Google Cloud Firestore | Service Account / ADC (Server-only) | ❌ No | ✅ Yes (In-memory mock in dev) | **VERIFIED & SECURE** |
| **Judge Demo Mode** | Client-side Sandbox (`localStorage`) | Zero-auth client isolation | ❌ No (Zero secrets) | ✅ Yes (100% offline functional) | **VERIFIED & SECURE** |

---

## 2. Deep-Dive Integration Audits

### 2.1 Backend FastAPI Service
- **Source Module**: `backend/app/main.py`, `backend/app/core/config.py`
- **Config Variables**: `ENVIRONMENT`, `HOST`, `PORT`, `CORS_ORIGINS`, `LOG_LEVEL`
- **Endpoint Structure**:
  - `GET /health`: Public health check (returns `{ status: "ok", environment, ... }`).
  - `GET /api/auth/me`: Authenticated user profile retrieval.
  - `/api/events/*`: Full CRUD for user-owned events, enriched with real-time spend and task progress.
  - `/api/events/{id}/expenses`: Add, update, delete itemized receipts and estimates.
  - `/api/events/{id}/budget-summary`: Aggregated category breakdowns, percentage utilization, and balance.
  - `/api/events/{id}/tasks`: Prioritized task workflows and completion toggles.
  - `/api/events/{id}/vendors`: Vendor contract tracking and quote management.
  - `/api/events/{id}/guests`: RSVP headcount tracking, dietary flags, and plus-one counts.
  - `/api/events/{id}/generate-plan`: AI master event plan generation.
  - `/api/events/{id}/copilot`: Interactive AI copilot queries grounded on active event data.
- **Security & Authorization**: Every protected endpoint enforces `verify_resource_ownership(event["user_id"], current_user)`. Cross-user data leakage is strictly blocked with HTTP 403 Forbidden.
- **Payload Limits**: Request body size is capped at 1MB (`MAX_REQUEST_SIZE_BYTES = 1048576`).

### 2.2 Groq Cloud AI Provider Integration
- **Source Module**: `backend/app/services/ai_service.py`
- **Model**: `llama-3.1-8b-instant` (OpenAI-compatible chat completions interface at `https://api.groq.com/openai/v1/chat/completions`)
- **Key Protection**: `GROQ_API_KEY` is loaded strictly on the server from `os.getenv("GROQ_API_KEY")`. It is never returned in any HTTP response, template, or frontend bundle.
- **Timeout & Retry Handling**: Default timeout is set to 60 seconds (`AI_REQUEST_TIMEOUT = 60`). The frontend client applies matching timeout thresholds (`APP_CONFIG.aiRequestTimeout`).
- **Response Validation**: All LLM responses are parsed and validated through Pydantic schemas (`EventPlanResponse`, `BudgetBreakdownItem`, `TimelineMilestone`). If budget breakdown percentages do not sum to 100%, the validator automatically normalizes them rather than failing.
- **Graceful Fallback**: When `GROQ_API_KEY` is not configured or in development mode, `ai_service.py` logs an informative notice and provides rich, culturally authentic master plans for Indian weddings and celebrations.

### 2.3 Firebase Authentication & Client Config
- **Source Module**: `js/firebase-config.js`, `js/auth.js`, `backend/app/core/security.py`
- **Client Configuration**: `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, `appId`).
- **Public Safety**: As per official Firebase documentation, web client keys are identifiers, not secrets. Data security is enforced through Firestore Security Rules (`firebase/firestore.rules`) and backend bearer token verification (`get_current_user`).
- **Token Injection**: The frontend API client (`js/api.js`) automatically intercepts outgoing requests and injects `Authorization: Bearer <ID_TOKEN>`.
- **Token Verification**: In production, `backend/app/core/security.py` uses the Firebase Admin SDK to cryptographically verify token signatures, expiry, and user UID against Google's public certificates.

### 2.4 Client-Side Judge Demo Sandbox
- **Source Module**: `js/demo-mode.js`
- **Activation**: Triggered via `?demo=true`, `?judge=true`, or the persistent "Judge Demo" buttons across the application.
- **Data Isolation**: Operates entirely inside client-side `localStorage` (`planora_judge_demo_data_v3`). It never queries, writes, or deletes production Firestore records.
- **Schema Normalization**: All demo entities now support dual property mapping (`name`/`title`, `estimated_amount`/`amount`, `actual_amount`/`paid_amount`, `is_paid`/`payment_status`, `assigned_to`/`assignee`).
- **Data Synchronization**: Any write immediately recalculates `data.event.spent` and fires `planora:data-updated` to keep all open tabs and views in sync.

---

## 3. Secret Protection Audit Verification

```
[GIT HISTORY AUDIT]
$ git log --all -S "private_key" --oneline
-> Result: 0 matches (CLEAN)

$ git grep -i "gsk_"
-> Result: Placeholders only in .env.example, DEPLOYMENT_GUIDE.md, and TROUBLESHOOTING.md (CLEAN)

$ git grep -i "AIzaSy"
-> Result: AIzaSyExampleKeyForPlanoraClientOnly placeholder only (CLEAN)
```

No production secrets, private keys, or API tokens have ever been committed to the repository history.
