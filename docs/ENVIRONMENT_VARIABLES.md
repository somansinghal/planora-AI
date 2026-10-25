# Environment Variables Documentation – Planora AI

This document catalogs every environment variable used in the Planora AI application, defining its purpose, location, default value, and confidentiality classification.

---

## 1. Confidentiality Classifications

- **CRITICAL SECRET**: Must strictly remain on the backend server. **Never** commit to version control or expose in browser code.
- **RESTRICTED**: Internal operational configuration. Keep server-side.
- **PUBLIC**: Safe to bundle into client-side JavaScript configuration.

---

## 2. Server-Side Environment Variables (`backend/.env`)

| Variable Name | Classification | Default Value | Purpose |
|---|---|---|---|
| `ENVIRONMENT` | RESTRICTED | `development` | Operating mode (`development`, `staging`, `production`). In production, stricter error hiding and HSTS are enabled. |
| `HOST` | RESTRICTED | `0.0.0.0` | Network binding interface for Uvicorn. |
| `PORT` | RESTRICTED | `8000` | Port for the FastAPI HTTP listener. |
| `LOG_LEVEL` | RESTRICTED | `INFO` | Logging threshold (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `CORS_ORIGINS` | RESTRICTED | `http://localhost:3000,...` | Comma-separated list of browser origins permitted to query API endpoints. |
| `FIREBASE_PROJECT_ID` | RESTRICTED | `planora-ai` | GCP/Firebase project identifier. |
| `FIREBASE_ADMIN_CREDENTIALS_PATH` | **CRITICAL SECRET** | `""` | Filepath to service account JSON credentials. If empty, falls back to GCP Application Default Credentials (ADC). |
| `AI_PROVIDER` | RESTRICTED | `groq` | Selected AI inference provider. |
| `AI_MODEL` | RESTRICTED | `llama-3.1-8b-instant` | Model identifier used for event planning and Copilot chat. |
| `GROQ_API_KEY` | **CRITICAL SECRET** | `""` | Authentication API secret for Groq Cloud. When unset, system defaults to demonstration mode. |
| `AI_REQUEST_TIMEOUT` | RESTRICTED | `60` | Maximum seconds to wait for AI inference before returning timeout. |
| `AI_MAX_TOKENS` | RESTRICTED | `4000` | Maximum completion token budget per generation request. |
| `AI_TEMPERATURE` | RESTRICTED | `0.7` | Sampling temperature for AI creativity. |
| `AI_REQUESTS_PER_USER_PER_HOUR` | RESTRICTED | `20` | Token bucket hourly rate limit per authenticated user. |
| `MAX_REQUEST_SIZE_BYTES` | RESTRICTED | `1048576` (1MB) | Maximum allowed incoming request body size to block payload DOS attacks. |

---

## 3. Frontend Client Configuration (`js/firebase-config.js`)

| Variable / Key | Classification | Description |
|---|---|---|
| `apiKey` | PUBLIC | Firebase client API key for Identity Platform. (Not a server secret). |
| `authDomain` | PUBLIC | Firebase Auth domain for OAuth callbacks (e.g. `planora-ai.firebaseapp.com`). |
| `projectId` | PUBLIC | Firebase Project ID. |
| `storageBucket` | PUBLIC | Cloud Storage bucket identifier. |
| `appId` | PUBLIC | Firebase Web App Client ID. |
| `API_BASE_URL` | PUBLIC | Base URL pointing to the FastAPI backend service (e.g. `http://localhost:8000`). |
