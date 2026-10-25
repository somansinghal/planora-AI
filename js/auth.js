/**
 * Planora AI – Authentication Module
 * 
 * Handles Firebase Authentication for:
 * - Email/password registration and login
 * - Google Sign-In
 * - Logout
 * - Password reset
 * - Auth state observation
 * - ID token retrieval for backend calls
 */

import { firebaseConfig, API_BASE_URL } from './firebase-config.js';
import { showToast } from './utils.js';

// ── Firebase SDK Imports ────────────────────────────────────
let app, auth, googleProvider;
let firebaseInitialized = false;
let authStateCallbacks = [];
let currentUser = null;

const FIREBASE_VERSION = "10.7.1";

async function initFirebase() {
  if (firebaseInitialized) return;

  try {
    const { initializeApp } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`
    );
    const {
      getAuth,
      GoogleAuthProvider,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signInWithPopup,
      signOut,
      onAuthStateChanged,
      sendPasswordResetEmail,
      updateProfile,
    } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`
    );

    app  = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // Store references for use in exported functions
    window.__planora_firebase__ = {
      auth,
      googleProvider,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signInWithPopup,
      signOut,
      onAuthStateChanged,
      sendPasswordResetEmail,
      updateProfile,
    };

    // Set up auth state observer
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      authStateCallbacks.forEach(cb => cb(user));
    });

    firebaseInitialized = true;
  } catch (error) {
    console.error('[Planora] Firebase initialization failed:', error);
    throw new Error('Authentication service unavailable. Please check configuration.');
  }
}

// ── Get current user ────────────────────────────────────────
export function getCurrentUser() {
  return currentUser;
}

// ── Subscribe to auth state ─────────────────────────────────
export async function onAuthStateChange(callback) {
  await initFirebase();
  authStateCallbacks.push(callback);
  // Immediately call with current state
  callback(currentUser);
  return () => {
    authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
  };
}

// ── Get ID Token for backend API calls ──────────────────────
export async function getIdToken() {
  await initFirebase();
  const fb = window.__planora_firebase__;
  if (!fb || !currentUser) {
    throw new Error('Not authenticated');
  }
  try {
    return await currentUser.getIdToken(/* forceRefresh */ false);
  } catch (error) {
    // If token refresh fails, token may be expired
    console.warn('[Planora] ID token retrieval failed:', error.code);
    throw new Error('Session expired. Please sign in again.');
  }
}

// ── Sign In with Email/Password ──────────────────────────────
export async function signInWithEmail(email, password) {
  await initFirebase();
  const fb = window.__planora_firebase__;

  try {
    const result = await fb.signInWithEmailAndPassword(fb.auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: mapAuthError(error.code) };
  }
}

// ── Register with Email/Password ─────────────────────────────
export async function registerWithEmail(email, password, displayName) {
  await initFirebase();
  const fb = window.__planora_firebase__;

  try {
    const result = await fb.createUserWithEmailAndPassword(fb.auth, email, password);
    // Update display name
    await fb.updateProfile(result.user, { displayName: displayName.trim() });
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: mapAuthError(error.code) };
  }
}

// ── Sign In with Google ──────────────────────────────────────
export async function signInWithGoogle() {
  await initFirebase();
  const fb = window.__planora_firebase__;

  try {
    const result = await fb.signInWithPopup(fb.auth, fb.googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: null }; // User dismissed, not an error
    }
    return { success: false, error: mapAuthError(error.code) };
  }
}

// ── Sign Out ─────────────────────────────────────────────────
export async function signOutUser() {
  await initFirebase();
  const fb = window.__planora_firebase__;

  try {
    await fb.signOut(fb.auth);
    return { success: true };
  } catch (error) {
    console.error('[Planora] Sign out error:', error);
    return { success: false, error: 'Sign out failed. Please try again.' };
  }
}

// ── Send Password Reset Email ────────────────────────────────
export async function sendPasswordReset(email) {
  await initFirebase();
  const fb = window.__planora_firebase__;

  try {
    await fb.sendPasswordResetEmail(fb.auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: mapAuthError(error.code) };
  }
}

// ── Map Firebase auth error codes to user-friendly messages ──
function mapAuthError(code) {
  const messages = {
    'auth/user-not-found':        'No account found with this email address.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/user-disabled':         'This account has been disabled. Please contact support.',
    'auth/email-already-in-use':  'An account with this email already exists.',
    'auth/weak-password':         'Password must be at least 6 characters long.',
    'auth/invalid-credential':    'Invalid email or password. Please try again.',
    'auth/too-many-requests':     'Too many failed attempts. Please try again later.',
    'auth/network-request-failed':'Network error. Please check your connection.',
    'auth/popup-blocked':         'Popup was blocked. Please allow popups and try again.',
    'auth/account-exists-with-different-credential': 
      'An account already exists with this email using a different sign-in method.',
  };
  return messages[code] || `Authentication error: ${code}`;
}

// ── Check if user has completed onboarding ───────────────────
export async function hasCompletedOnboarding() {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    const profile = localStorage.getItem(`planora_onboarded_${user.uid}`);
    return profile === 'true';
  } catch {
    return false;
  }
}

// ── Mark onboarding as complete ──────────────────────────────
export function markOnboardingComplete(uid) {
  try {
    localStorage.setItem(`planora_onboarded_${uid}`, 'true');
  } catch {
    // localStorage may be unavailable
  }
}

// ── Initialize on import ─────────────────────────────────────
initFirebase().catch(err => {
  console.error('[Planora] Auth init error:', err.message);
});

export { initFirebase };
export { redirectIfAuthenticated } from './auth-guard.js';
