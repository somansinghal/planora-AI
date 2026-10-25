# Deployment Guide – Planora AI

This guide provides reproducible, production-ready deployment instructions for the Planora AI SaaS platform.

---

## 1. Architecture Deployment Topology

Planora AI is designed for optimal separation of concerns:
- **Static Frontend**: Deployed to Vercel, Firebase Hosting, Cloudflare Pages, or Netlify.
- **Backend API**: Deployed to Google Cloud Run, Render, Railway, or Fly.io as a containerized Python service.
- **Managed Services**: Firebase Authentication & Google Cloud Firestore.

---

## 2. Step 1: Firebase Project Setup

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project named `planora-ai-prod`.
2. **Enable Authentication**:
   - Navigate to **Authentication > Sign-in method**.
   - Enable **Email/Password**.
   - Enable **Google** provider and configure your authorized support email.
3. **Enable Cloud Firestore**:
   - Navigate to **Firestore Database > Create database**.
   - Select production mode and choose your preferred regional multi-region (e.g. `asia-south1` for India or `us-central1`).
4. **Deploy Security Rules**:
   - Deploy `firebase/firestore.rules` using the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```
   - Deploy composite indexes:
     ```bash
     firebase deploy --only firestore:indexes
     ```
5. **Generate Service Account Key (Backend)**:
   - Navigate to **Project Settings > Service Accounts**.
   - Click **Generate new private key** and download the JSON file.
   - Store this securely on your server or as a base64 encoded environment variable in your production host.

---

## 3. Step 2: Backend Deployment (Render / Cloud Run)

### Option A: Deploying on Render / Railway
1. Connect your repository to Render/Railway.
2. Set Root Directory to `backend`.
3. Set Build Command: `pip install -r requirements.txt`.
4. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Configure Environment Variables in the hosting dashboard:
   - `ENVIRONMENT=production`
   - `FIREBASE_PROJECT_ID=planora-ai-prod`
   - `FIREBASE_ADMIN_CREDENTIALS_PATH=/etc/secrets/serviceAccountKey.json` (or paste JSON content)
   - `AI_PROVIDER=groq`
   - `AI_MODEL=llama-3.1-8b-instant`
   - `GROQ_API_KEY=gsk_yourRealGroqApiKey`
   - `CORS_ORIGINS=https://planora.ai,https://your-vercel-domain.vercel.app`

### Option B: Deploying on Google Cloud Run (Recommended for least privilege)
Because Cloud Run runs on Google Cloud, it can authenticate natively with Firestore via Application Default Credentials (ADC) without needing a downloadable service account key!
```bash
cd backend
gcloud run deploy planora-api \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="ENVIRONMENT=production,AI_PROVIDER=groq,AI_MODEL=llama-3.1-8b-instant,GROQ_API_KEY=gsk_..."
```

---

## 4. Step 3: Frontend Deployment (Vercel)

1. Connect the root directory of your repository to Vercel.
2. In the Vercel project settings:
   - Framework Preset: **Other** (Static HTML/JS).
   - Root Directory: `./`.
3. In `js/firebase-config.js`, configure your production backend URL and Firebase client keys:
   ```javascript
   export const API_BASE_URL = 'https://your-api-domain.com';
   ```
4. Deploy the project. Vercel will immediately serve all static HTML, CSS, and JS modules across its global edge CDN.

---

## 5. Post-Deployment Verification Checklist

1. **Verify Health**:
   ```bash
   curl -i https://your-api-domain.com/api/health
   # Expected: HTTP 200 OK, {"status": "ok", ...}
   ```
2. **Verify Security Headers**:
   ```bash
   curl -I https://your-api-domain.com/api/health
   # Verify X-Content-Type-Options: nosniff, X-Frame-Options: DENY
   ```
3. **Verify Auth Barrier**:
   ```bash
   curl -i https://your-api-domain.com/api/events
   # Expected: HTTP 401 Unauthorized
   ```
4. **Verify Frontend**:
   - Open your deployed URL (e.g. `https://your-domain.vercel.app`).
   - Sign up with a test email.
   - Create an event and generate an AI plan.
   - Confirm expenses, tasks, and reports populate without console errors.
