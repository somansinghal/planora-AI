# Planora AI — Environment Configuration & Setup Guide

This document defines the complete environment configuration system for **Planora AI**, establishing a strict boundary between public browser configuration and private server credentials.

---

## 1. Complete Configuration Inventory

| Variable | Purpose | Required? | Secret? | Used by | Configuration Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime mode (`development`, `staging`, `production`) | Required | No | Backend (`config.py`) | `backend/.env`, Cloud Run / Host env |
| `HOST` | HTTP listen address (default: `0.0.0.0`) | Optional | No | Backend (`main.py`) | `backend/.env`, Host env |
| `PORT` | HTTP listen port (default: `8000`) | Optional | No | Backend (`main.py`) | `backend/.env`, Host env |
| `LOG_LEVEL` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | Optional | No | Backend (`config.py`) | `backend/.env`, Host env |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Required in Prod | No | FastAPI CORS Middleware | `backend/.env`, Cloud Run / Host env |
| `FIREBASE_PROJECT_ID` | GCP / Firebase project identifier (e.g. `planora-ai`) | Required | No | Backend & Frontend | Root `.env`, `backend/.env`, Cloud Run |
| `FIREBASE_ADMIN_CREDENTIALS_PATH` | Path to service account JSON key file | Required in Prod (unless using GCP ADC) | **YES (CRITICAL)** | Backend Firebase Admin SDK (`security.py`) | `backend/.env` (server-side ONLY) |
| `AI_PROVIDER` | AI provider identifier (default: `groq`) | Optional | No | Backend AI Service (`ai_service.py`) | `backend/.env`, Cloud Run |
| `AI_MODEL` | LLM model identifier (default: `llama-3.1-8b-instant`) | Optional | No | Backend AI Service | `backend/.env`, Cloud Run |
| `GROQ_API_KEY` | Groq Cloud LLM API Secret Key (`gsk_...`) | Required for Live AI | **YES (CRITICAL)** | Backend AI Service (`ai_service.py`) | `backend/.env` (server-side ONLY) |
| `AI_REQUEST_TIMEOUT` | Seconds before timing out LLM inference (default: `60`) | Optional | No | Backend AI Service | `backend/.env`, Cloud Run |
| `AI_MAX_TOKENS` | Max generation tokens for plans (default: `4000`) | Optional | No | Backend AI Service | `backend/.env`, Cloud Run |
| `AI_TEMPERATURE` | Model sampling temperature (default: `0.7`) | Optional | No | Backend AI Service | `backend/.env`, Cloud Run |
| `AI_REQUESTS_PER_USER_PER_HOUR` | Per-user rate-limiting quota (default: `20`) | Optional | No | Backend Security Middleware | `backend/.env`, Cloud Run |
| `MAX_REQUEST_SIZE_BYTES` | Payload limit in bytes (default: `1048576` = 1MB) | Optional | No | Backend Security Middleware | `backend/.env`, Cloud Run |
| `DEFAULT_PAGE_SIZE` | Default list pagination size (default: `50`) | Optional | No | Backend Routes | `backend/.env`, Cloud Run |
| `MAX_PAGE_SIZE` | Upper limit for pagination requests (default: `200`) | Optional | No | Backend Routes | `backend/.env`, Cloud Run |
| `FRONTEND_API_BASE_URL` | Base URL of the backend service | Optional | No | Frontend Client (`firebase-config.js`) | `window.__PLANORA_API_URL__` / Static |
| `FIREBASE_API_KEY` | Firebase Web Client API Key (`AIza...`) | Required for Live Auth | No (Public) | Frontend Browser (`firebase-config.js`) | `window.__PLANORA_FIREBASE_API_KEY__` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain | Required for Live Auth | No (Public) | Frontend Browser (`firebase-config.js`) | `window.__PLANORA_FIREBASE_AUTH_DOMAIN__` |
| `FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket domain | Optional | No (Public) | Frontend Browser (`firebase-config.js`) | `window.__PLANORA_FIREBASE_STORAGE_BUCKET__` |
| `FIREBASE_MESSAGING_SENDER_ID`| FCM Sender ID | Optional | No (Public) | Frontend Browser (`firebase-config.js`) | `window.__PLANORA_FIREBASE_MESSAGING_SENDER_ID__` |
| `FIREBASE_APP_ID` | Firebase Web App Identifier | Required for Live Auth | No (Public) | Frontend Browser (`firebase-config.js`) | `window.__PLANORA_FIREBASE_APP_ID__` |

---

## 2. Architecture & Environment Segregation

Planora AI utilizes a decoupled architecture:
1. **Frontend**: Static HTML5/Vanilla JS single-page workspace deployed to **Vercel** (`https://planora-ai-india.vercel.app/`).
2. **Backend**: Python FastAPI microservice designed for containerized deployment (e.g., Google Cloud Run, Railway, or VPS).

```
┌──────────────────────────────────────────────┐
│  Vercel Frontend (Public Browser Context)     │
│  - Static assets, HTML, Vanilla CSS, JS      │
│  - Public Firebase Client Config (authDomain)│
│  - ZERO private API keys or server secrets   │
└──────────────────────┬───────────────────────┘
                       │ HTTPS / JSON (CORS-restricted)
                       ▼
┌──────────────────────────────────────────────┐
│  Backend Service (Secure Server Context)     │
│  - Private Groq Cloud Key (GROQ_API_KEY)     │
│  - Firebase Admin SDK (Service Account / ADC)│
│  - Firestore ownership verification          │
│  - Rate limiting & input sanitization        │
└──────────────────────────────────────────────┘
```

---

## 3. Local Development Setup

### Step 1: Clone and Configure Environment Files
```bash
# Clone the repository
git clone https://github.com/somansinghal/planora-AI.git
cd planora-AI

# Create root environment file (for reference / unified tooling)
cp .env.example .env

# Create backend environment file
cp backend/.env.example backend/.env
```

### Step 2: Configure Backend Secrets
Edit `backend/.env` with your preferred text editor:
```ini
ENVIRONMENT=development
PORT=8000
LOG_LEVEL=INFO
CORS_ORIGINS=https://planora-ai-india.vercel.app,http://localhost:3000,http://127.0.0.1:3000

# Optional: Add your Groq API Key for live AI generation
# (If left empty, Planora automatically falls back to rich sample outputs)
GROQ_API_KEY=gsk_yourRealGroqApiKeyHere

# Optional: Add service account key path for Firestore live persistence
# (If left empty in dev mode, in-memory repository is active)
FIREBASE_ADMIN_CREDENTIALS_PATH=
FIREBASE_PROJECT_ID=planora-ai
```

### Step 3: Install Dependencies and Start Servers

#### Terminal 1 — Backend API (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```

#### Terminal 2 — Frontend Web Server
```bash
# In the root repository directory
python3 -m http.server 3000
# Open http://localhost:3000 in your browser
```

---

## 4. Vercel Production Configuration

The frontend deployment is hosted at:  
👉 **`https://planora-ai-india.vercel.app/`**

### Vercel Security Best Practices
1. **Never enter server secrets** (`GROQ_API_KEY`, Firebase private keys) into Vercel Project Environment Variables. The frontend runs in client browser sandboxes and cannot protect private secrets.
2. In `vercel.json`, strict Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` headers are automatically enforced.
3. If connecting to a live backend, inject the backend URL into frontend runtime using `window.__PLANORA_API_URL__ = "https://your-backend-api.com"`.

---

## 5. Startup Validation & Graceful Degradation

During application startup, `backend/app/core/config.py` runs structured validation:
- **Missing Firebase Project ID**: Logs a critical warning instructing where to set the variable.
- **Unset `GROQ_API_KEY`**: 
  - In `development`: Logs an informational message. The application degrades gracefully to deterministic, rich sample plans and copilot responses without crashing.
  - In `production`: Issues a warning advising that external inference will fail gracefully.
- **Unset `FIREBASE_ADMIN_CREDENTIALS_PATH`**:
  - In `development`: Seamlessly uses the high-performance in-memory repository with zero friction for offline development.
  - In `production`: Checks for Google Application Default Credentials (ADC).
- **Secret Logging Prohibition**: The configuration module never logs or serializes secret values. Only presence/absence and length/format validity are checked.
