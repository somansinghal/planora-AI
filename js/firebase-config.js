/**
 * Planora AI – Firebase Configuration
 * 
 * IMPORTANT: Firebase client configuration is NOT a secret.
 * It is safe to include in the frontend. Security is enforced
 * via Firestore Security Rules and Firebase Authentication.
 *
 * Replace these values with your own Firebase project config.
 * See docs/ENVIRONMENT_VARIABLES.md for setup instructions.
 */

// ── Firebase App Configuration ──────────────────────────────
// These values come from your Firebase project settings.
// All are required for the application to function.
// DO NOT hardcode real credentials here – use environment
// variables for deployment (see docs/DEPLOYMENT_GUIDE.md).

export const firebaseConfig = {
  apiKey: window.__PLANORA_FIREBASE_API_KEY__ || "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: window.__PLANORA_FIREBASE_AUTH_DOMAIN__ || "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: window.__PLANORA_FIREBASE_PROJECT_ID__ || "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: window.__PLANORA_FIREBASE_STORAGE_BUCKET__ || "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: window.__PLANORA_FIREBASE_MESSAGING_SENDER_ID__ || "REPLACE_WITH_YOUR_SENDER_ID",
  appId: window.__PLANORA_FIREBASE_APP_ID__ || "REPLACE_WITH_YOUR_APP_ID",
};

/**
 * Returns true if real Firebase Web credentials are configured.
 */
export function isFirebaseClientConfigured() {
  return (
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("REPLACE_") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.startsWith("REPLACE_")
  );
}

// ── Backend API Configuration ───────────────────────────────
export const API_BASE_URL = window.__PLANORA_API_URL__ || "http://localhost:8000";

// ── Application Configuration ───────────────────────────────
export const APP_CONFIG = {
  name: "Planora AI",
  tagline: "From idea to flawlessly planned.",
  version: "1.0.0",
  defaultCurrency: "INR",
  defaultCurrencySymbol: "₹",
  maxEventsPerUser: 50,
  maxGuestsPerEvent: 1000,
  maxVendorsPerEvent: 100,
  maxTasksPerEvent: 500,
  aiRequestTimeout: 60000, // 60 seconds
};

// ── Firebase SDK imports (CDN) ──────────────────────────────
// Using Firebase v10 modular SDK via CDN
const FIREBASE_VERSION = "10.7.1";

export const FIREBASE_IMPORTS = {
  app:       `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`,
  auth:      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`,
  firestore: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`,
};
