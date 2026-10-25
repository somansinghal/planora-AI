/**
 * Planora AI — Firebase & Backend Configuration
 *
 * File: frontend/js/firebase-config.js
 *
 * Add your Firebase Web App configuration below.
 * Set the deployed Render backend URL below.
 *
 * IMPORTANT:
 * - Firebase Web API keys are client-side identifiers, not
 *   authorization secrets. Protect your app using Firebase
 *   Authentication and appropriate security rules.
 * - Never put Groq API keys, service-account private keys,
 *   or other server-side secrets in this frontend file.
 */

// ============================================================
// 1. FIREBASE CONFIGURATION
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyA84s23Cx314Mps_SyCNDWV8fnnzHlSUvQ",
  authDomain: "planora-ai-india.firebaseapp.com",
  projectId: "planora-ai-india",
  storageBucket: "planora-ai-india.firebasestorage.app",
  messagingSenderId: "620959002862",
  appId: "1:620959002862:web:74ccf3869ea2d58ff083ff",
  measurementId: "G-L3NJC3QGE1"
};

/**
 * Checks whether Firebase configuration has been provided.
 */
export function isFirebaseClientConfigured() {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  return requiredFields.every((field) => {
    const value = firebaseConfig[field];

    return (
      typeof value === "string" &&
      value.trim() !== "" &&
      !value.startsWith("YOUR_") &&
      !value.startsWith("REPLACE_")
    );
  });
}

// ============================================================
// 2. BACKEND API CONFIGURATION — RENDER
// ============================================================

export const API_BASE_URL = "https://planora-ai-zu63.onrender.com";

// ============================================================
// 3. APPLICATION CONFIGURATION
// ============================================================

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

  aiRequestTimeout: 60000,
};

// ============================================================
// 4. FIREBASE SDK IMPORTS
// ============================================================

const FIREBASE_VERSION = "10.7.1";

export const FIREBASE_IMPORTS = {
  app: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`,

  auth: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`,

  firestore: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`,
};
