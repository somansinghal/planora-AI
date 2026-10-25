# Troubleshooting Guide – Planora AI

This guide helps developers and operators diagnose and resolve common setup, operational, and network issues.

---

## 1. Backend Startup Issues

### 1.1 `Address already in use` (Port 8000)
- **Cause**: Another process or previous uvicorn instance is occupying port 8000.
- **Resolution**:
  ```bash
  # Check which process is holding port 8000
  lsof -i :8000
  # Terminate the process
  kill -9 <PID>
  # Or start Planora on an alternative port
  PORT=8080 uvicorn app.main:app --reload --port 8080
  ```

### 1.2 `ModuleNotFoundError: No module named 'fastapi'`
- **Cause**: Running with a Python environment that does not have the dependencies installed.
- **Resolution**:
  ```bash
  cd backend
  python3 -m pip install -r requirements.txt
  ```

---

## 2. Authentication & Authorization Issues

### 2.1 API returns `401 Unauthorized` with `Authentication required`
- **Cause**: Missing or expired Firebase ID token in the `Authorization: Bearer <token>` header.
- **Resolution**:
  - In frontend: Verify that the user is signed in via `js/auth.js`.
  - In development testing: Ensure you use `make_mock_token("user-id")` or provide a valid Firebase JWT.

### 2.2 API returns `403 Forbidden` with `You do not have permission to access this resource`
- **Cause**: Attempting to access an event, expense, task, vendor, or guest owned by a different user.
- **Resolution**: This is the intended BOLA/IDOR security control. Verify that the current user's UID matches the event creator's UID.

### 2.3 Firebase ID token verification fails in production
- **Cause**: Clock skew between server and Google Auth servers, or invalid service account JSON key.
- **Resolution**:
  - Verify that the server's NTP clock is synchronized (`ntpdate -u pool.ntp.org`).
  - Verify that `FIREBASE_ADMIN_CREDENTIALS_PATH` points to a valid service account key corresponding to the exact `FIREBASE_PROJECT_ID`.

---

## 3. AI Planning & Copilot Issues

### 3.1 AI returns `AI service is not configured (GROQ_API_KEY missing)`
- **Cause**: `GROQ_API_KEY` is empty in `backend/.env`.
- **Resolution**:
  - Get a free API key at [console.groq.com](https://console.groq.com).
  - Add `GROQ_API_KEY=gsk_...` to your `backend/.env`.
  - Note: In development mode, you can also append `?demo_mode=true` to test the full pipeline using offline structured plans.

### 3.2 AI returns `429 Too Many Requests` (Quota Exceeded)
- **Cause**: The user exceeded the 20 requests/hour abuse prevention rate limit.
- **Resolution**:
  - Wait for the rate-limiting window to reset (1 hour).
  - For enterprise testing, adjust `AI_REQUESTS_PER_USER_PER_HOUR` in `backend/.env`.

---

## 4. Frontend & CORS Issues

### 4.1 Browser console displays `Cross-Origin Request Blocked (CORS)`
- **Cause**: The frontend origin (e.g. `http://localhost:5500`) is not present in `CORS_ORIGINS`.
- **Resolution**:
  - Update `CORS_ORIGINS` in `backend/.env`:
    ```bash
    CORS_ORIGINS=http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500
    ```
  - Restart the FastAPI backend.

### 4.2 Browser cannot connect to backend (`TypeError: Failed to fetch`)
- **Cause**: The backend server is not running or `API_BASE_URL` in `js/firebase-config.js` is pointing to the wrong port.
- **Resolution**:
  - Check health directly: `curl http://localhost:8000/api/health`.
  - Verify `API_BASE_URL` in `js/firebase-config.js` matches the port where Uvicorn is listening.
