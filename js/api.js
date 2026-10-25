/**
 * Planora AI – API Client
 * 
 * Handles all backend API calls with:
 * - Automatic Firebase ID token injection
 * - Request/response error handling
 * - Timeout handling
 * - Response validation
 */

import { getIdToken } from './auth.js';
import { API_BASE_URL, APP_CONFIG } from './firebase-config.js';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const AI_TIMEOUT = APP_CONFIG.aiRequestTimeout; // 60 seconds

/**
 * Make an authenticated API request.
 */
async function apiRequest(method, path, body = null, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const requireAuth = options.requireAuth !== false;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (requireAuth) {
    try {
      const token = await getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      return {
        ok: false,
        status: 401,
        error: 'Not authenticated. Please sign in.',
        data: null,
      };
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_BASE_URL}${path}`;
    const fetchOptions = {
      method: method.toUpperCase(),
      headers,
      signal: controller.signal,
    };

    if (body && ['POST', 'PATCH', 'PUT'].includes(fetchOptions.method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && (data.detail || data.message || data.error)) || 
                       `Request failed (${response.status})`;
      return {
        ok: false,
        status: response.status,
        error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        data: null,
      };
    }

    return { ok: true, status: response.status, data, error: null };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        ok: false, status: 408, data: null,
        error: 'Request timed out. Please try again.',
      };
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        ok: false, status: 0, data: null,
        error: 'Cannot connect to server. Please check your connection.',
      };
    }
    return {
      ok: false, status: 0, data: null,
      error: error.message || 'An unexpected error occurred.',
    };
  }
}

// ── Convenience methods ──────────────────────────────────────
const api = {
  get:    (path, opts)       => apiRequest('GET',    path, null, opts),
  post:   (path, body, opts) => apiRequest('POST',   path, body, opts),
  patch:  (path, body, opts) => apiRequest('PATCH',  path, body, opts),
  put:    (path, body, opts) => apiRequest('PUT',    path, body, opts),
  delete: (path, opts)       => apiRequest('DELETE', path, null, opts),
};

// ── Health check ─────────────────────────────────────────────
export async function checkHealth() {
  return api.get('/api/health', { requireAuth: false });
}

// ── Auth endpoints ────────────────────────────────────────────
export async function getMe() {
  return api.get('/api/me');
}

// ── Events endpoints ──────────────────────────────────────────
export async function getEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/events${query ? '?' + query : ''}`);
}

export async function createEvent(eventData) {
  return api.post('/api/events', eventData);
}

export async function getEvent(eventId) {
  return api.get(`/api/events/${eventId}`);
}

export async function updateEvent(eventId, data) {
  return api.patch(`/api/events/${eventId}`, data);
}

export async function deleteEvent(eventId) {
  return api.delete(`/api/events/${eventId}`);
}

// ── AI Plan endpoints ─────────────────────────────────────────
export async function generateEventPlan(eventId, preferences = {}) {
  return api.post(
    `/api/events/${eventId}/generate-plan`,
    preferences,
    { timeout: AI_TIMEOUT }
  );
}

export async function getEventPlans(eventId) {
  return api.get(`/api/events/${eventId}/plans`);
}

// ── Expense endpoints ─────────────────────────────────────────
export async function getExpenses(eventId) {
  return api.get(`/api/events/${eventId}/expenses`);
}

export async function createExpense(eventId, data) {
  return api.post(`/api/events/${eventId}/expenses`, data);
}

export async function updateExpense(expenseId, data) {
  return api.patch(`/api/expenses/${expenseId}`, data);
}

export async function deleteExpense(expenseId) {
  return api.delete(`/api/expenses/${expenseId}`);
}

// ── Task endpoints ────────────────────────────────────────────
export async function getTasks(eventId, params = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/events/${eventId}/tasks${query ? '?' + query : ''}`);
}

export async function createTask(eventId, data) {
  return api.post(`/api/events/${eventId}/tasks`, data);
}

export async function updateTask(taskId, data) {
  return api.patch(`/api/tasks/${taskId}`, data);
}

export async function deleteTask(taskId) {
  return api.delete(`/api/tasks/${taskId}`);
}

// ── Vendor endpoints ──────────────────────────────────────────
export async function getVendors(eventId) {
  return api.get(`/api/events/${eventId}/vendors`);
}

export async function createVendor(eventId, data) {
  return api.post(`/api/events/${eventId}/vendors`, data);
}

export async function updateVendor(vendorId, data) {
  return api.patch(`/api/vendors/${vendorId}`, data);
}

export async function deleteVendor(vendorId) {
  return api.delete(`/api/vendors/${vendorId}`);
}

// ── Guest endpoints ───────────────────────────────────────────
export async function getGuests(eventId) {
  return api.get(`/api/events/${eventId}/guests`);
}

export async function createGuest(eventId, data) {
  return api.post(`/api/events/${eventId}/guests`, data);
}

export async function updateGuest(guestId, data) {
  return api.patch(`/api/guests/${guestId}`, data);
}

export async function deleteGuest(guestId) {
  return api.delete(`/api/guests/${guestId}`);
}

// ── AI Copilot endpoint ───────────────────────────────────────
export async function chatWithCopilot(eventId, message, history = []) {
  return api.post(
    `/api/events/${eventId}/copilot`,
    { message, history },
    { timeout: AI_TIMEOUT }
  );
}

// ── Reports endpoint ──────────────────────────────────────────
export async function getEventReport(eventId, format = 'json') {
  return api.get(`/api/events/${eventId}/report?format=${format}`);
}

export default api;
