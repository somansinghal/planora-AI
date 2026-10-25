/**
 * Planora AI – Authentication Guard
 * 
 * Protects application pages from unauthenticated access.
 * Include this script in all authenticated app pages.
 * 
 * Usage:
 *   <script type="module" src="js/auth-guard.js"></script>
 * 
 * The script redirects to login if no authenticated user is found.
 * Shows a loading state while auth is being determined.
 */

import { onAuthStateChange, hasCompletedOnboarding } from './auth.js';
import { isJudgeDemoMode, DEMO_USER, renderDemoBanner } from './demo-mode.js';

const PUBLIC_PATHS = [
  'index.html', 'login.html', 'signup.html',
  'pricing.html', 'about.html', 'privacy.html', 'terms.html',
  '404.html', ''
];

const ONBOARDING_PATH = 'onboarding.html';
const LOGIN_PATH      = 'login.html';
const DASHBOARD_PATH  = 'dashboard.html';

// Current page filename
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

/**
 * Guard: ensure user is authenticated before rendering page.
 * Supports Judge Demo Mode seamlessly for zero-friction evaluation.
 */
export async function requireAuth() {
  // ── Judge Demo Mode Bypass: Isolated Sandbox ───────────────
  if (isJudgeDemoMode()) {
    renderDemoBanner();
    return DEMO_USER;
  }

  return new Promise((resolve) => {
    let resolved = false;
    let timeoutId;

    const unsubscribe = onAuthStateChange((user) => {
      if (resolved) return;

      if (user) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve(user);
      } else if (user === null) {
        // user is explicitly null (not undefined = loading)
        resolved = true;
        clearTimeout(timeoutId);
        // Store intended destination for redirect after login
        sessionStorage.setItem('planora_redirect_after_login', window.location.href);
        window.location.replace(LOGIN_PATH);
      }
    });

    // Timeout fallback: if Firebase auth check takes too long
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[Planora] Auth check timeout – redirecting to login');
        window.location.replace(LOGIN_PATH);
      }
    }, 8000);
  });
}

/**
 * Guard: redirect authenticated users away from public pages.
 * Call from login/signup pages.
 */
export async function redirectIfAuthenticated(destination = DASHBOARD_PATH) {
  return new Promise((resolve) => {
    let resolved = false;

    onAuthStateChange((user) => {
      if (resolved) return;
      resolved = true;

      if (user) {
        // Check for post-login redirect
        const redirect = sessionStorage.getItem('planora_redirect_after_login');
        sessionStorage.removeItem('planora_redirect_after_login');
        window.location.replace(redirect && isInternalUrl(redirect) ? redirect : destination);
      } else {
        resolve(null);
      }
    });

    // If no auth response in 5s, assume not authenticated
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 5000);
  });
}

/**
 * Guard: ensure onboarding is complete.
 * Redirects to onboarding if not complete.
 */
export async function requireOnboarding(user) {
  const done = await hasCompletedOnboarding();
  if (!done) {
    window.location.replace(ONBOARDING_PATH);
    return false;
  }
  return true;
}

/**
 * Show page loading overlay while auth is being checked.
 */
export function showAuthLoading() {
  const existing = document.getElementById('auth-loading-overlay');
  if (existing) return;

  const overlay = document.createElement('div');
  overlay.id = 'auth-loading-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: var(--color-bg-base);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
  `;
  overlay.innerHTML = `
    <img src="assets/logo/planora-logo.png" alt="Planora AI" style="height:56px;width:auto;animation:pulse 2s ease-in-out infinite;" />
    <div style="width:40px;height:40px;border:3px solid rgba(124,58,237,0.3);border-top-color:#7C3AED;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    </style>
  `;
  document.body.appendChild(overlay);
}

/**
 * Remove the auth loading overlay.
 */
export function hideAuthLoading() {
  const overlay = document.getElementById('auth-loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }
}

// ── Validate URL is internal (safe redirect) ──────────────────
function isInternalUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin === window.location.origin;
  } catch {
    return url.startsWith('/') && !url.startsWith('//');
  }
}
