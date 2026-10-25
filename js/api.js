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
import {
  isJudgeDemoMode,
  getDemoEvent,
  updateDemoEvent,
  getDemoExpenses,
  addDemoExpense,
  updateDemoExpense,
  deleteDemoExpense,
  getDemoTasks,
  addDemoTask,
  updateDemoTask,
  deleteDemoTask,
  getDemoVendors,
  addDemoVendor,
  updateDemoVendor,
  deleteDemoVendor,
  getDemoGuests,
  addDemoGuest,
  updateDemoGuest,
  deleteDemoGuest,
  getDemoPlans,
  getDemoBudgetSummary,
  getDemoGuestSummary,
  queryDemoCopilot,
  DEMO_USER
} from './demo-mode.js';

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
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: DEMO_USER, error: null };
  }
  return api.get('/api/me');
}

// ── Events endpoints ──────────────────────────────────────────
export async function getEvents(params = {}) {
  if (isJudgeDemoMode()) {
    const list = [getDemoEvent()];
    list.events = list;
    return { ok: true, status: 200, data: list, error: null };
  }
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/events${query ? '?' + query : ''}`);
}

export async function createEvent(eventData) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 201, data: getDemoEvent(), error: null };
  }
  return api.post('/api/events', eventData);
}

export async function getEvent(eventId) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: getDemoEvent(), error: null };
  }
  return api.get(`/api/events/${eventId}`);
}

export async function updateEvent(eventId, data) {
  if (isJudgeDemoMode()) {
    const updated = updateDemoEvent(data);
    return { ok: true, status: 200, data: updated, error: null };
  }
  return api.patch(`/api/events/${eventId}`, data);
}

export async function deleteEvent(eventId) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: { success: true }, error: null };
  }
  return api.delete(`/api/events/${eventId}`);
}

// ── AI Plan endpoints ─────────────────────────────────────────
export async function generateEventPlan(eventId, preferences = {}) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: getDemoPlans()[0], error: null };
  }
  return api.post(
    `/api/events/${eventId}/generate-plan`,
    preferences,
    { timeout: AI_TIMEOUT }
  );
}

export async function getEventPlans(eventId) {
  if (isJudgeDemoMode()) {
    const list = getDemoPlans();
    list.plans = list;
    return { ok: true, status: 200, data: list, error: null };
  }
  return api.get(`/api/events/${eventId}/plans`);
}

// ── Expense endpoints ─────────────────────────────────────────
export async function getExpenses(eventId) {
  if (isJudgeDemoMode()) {
    const list = getDemoExpenses();
    list.expenses = list;
    return { ok: true, status: 200, data: list, error: null };
  }
  return api.get(`/api/events/${eventId}/expenses`);
}

export async function createExpense(eventId, data) {
  if (isJudgeDemoMode()) {
    const created = addDemoExpense(data);
    return { ok: true, status: 201, data: created, error: null };
  }
  return api.post(`/api/events/${eventId}/expenses`, data);
}

export async function updateExpense(expenseId, data) {
  if (isJudgeDemoMode()) {
    const updated = updateDemoExpense(expenseId, data);
    return { ok: true, status: 200, data: updated, error: null };
  }
  return api.patch(`/api/expenses/${expenseId}`, data);
}

export async function deleteExpense(expenseId) {
  if (isJudgeDemoMode()) {
    deleteDemoExpense(expenseId);
    return { ok: true, status: 200, data: { success: true }, error: null };
  }
  return api.delete(`/api/expenses/${expenseId}`);
}

// ── Task endpoints ────────────────────────────────────────────
export async function getTasks(eventId, params = {}) {
  if (isJudgeDemoMode()) {
    let list = getDemoTasks();
    if (params.status) list = list.filter(t => t.status === params.status);
    if (params.priority) list = list.filter(t => t.priority === params.priority);
    list.tasks = list;
    return { ok: true, status: 200, data: list, error: null };
  }
  const query = new URLSearchParams(params).toString();
  return api.get(`/api/events/${eventId}/tasks${query ? '?' + query : ''}`);
}

export async function createTask(eventId, data) {
  if (isJudgeDemoMode()) {
    const created = addDemoTask(data);
    return { ok: true, status: 201, data: created, error: null };
  }
  return api.post(`/api/events/${eventId}/tasks`, data);
}

export async function updateTask(taskId, data) {
  if (isJudgeDemoMode()) {
    const updated = updateDemoTask(taskId, data);
    return { ok: true, status: 200, data: updated, error: null };
  }
  return api.patch(`/api/tasks/${taskId}`, data);
}

export async function deleteTask(taskId) {
  if (isJudgeDemoMode()) {
    deleteDemoTask(taskId);
    return { ok: true, status: 200, data: { success: true }, error: null };
  }
  return api.delete(`/api/tasks/${taskId}`);
}

// ── Vendor endpoints ──────────────────────────────────────────
export async function getVendors(eventId) {
  if (isJudgeDemoMode()) {
    const list = getDemoVendors();
    list.vendors = list;
    return { ok: true, status: 200, data: list, error: null };
  }
  return api.get(`/api/events/${eventId}/vendors`);
}

export async function createVendor(eventId, data) {
  if (isJudgeDemoMode()) {
    const created = addDemoVendor(data);
    return { ok: true, status: 201, data: created, error: null };
  }
  return api.post(`/api/events/${eventId}/vendors`, data);
}

export async function updateVendor(vendorId, data) {
  if (isJudgeDemoMode()) {
    const updated = updateDemoVendor(vendorId, data);
    return { ok: true, status: 200, data: updated, error: null };
  }
  return api.patch(`/api/vendors/${vendorId}`, data);
}

export async function deleteVendor(vendorId) {
  if (isJudgeDemoMode()) {
    deleteDemoVendor(vendorId);
    return { ok: true, status: 200, data: { success: true }, error: null };
  }
  return api.delete(`/api/vendors/${vendorId}`);
}

// ── Guest endpoints ───────────────────────────────────────────
export async function getGuests(eventId) {
  if (isJudgeDemoMode()) {
    const list = getDemoGuests();
    list.guests = list;
    return { ok: true, status: 200, data: list, error: null };
  }
  return api.get(`/api/events/${eventId}/guests`);
}

export async function createGuest(eventId, data) {
  if (isJudgeDemoMode()) {
    const created = addDemoGuest(data);
    return { ok: true, status: 201, data: created, error: null };
  }
  return api.post(`/api/events/${eventId}/guests`, data);
}

export async function updateGuest(guestId, data) {
  if (isJudgeDemoMode()) {
    const updated = updateDemoGuest(guestId, data);
    return { ok: true, status: 200, data: updated, error: null };
  }
  return api.patch(`/api/guests/${guestId}`, data);
}

export async function deleteGuest(guestId) {
  if (isJudgeDemoMode()) {
    deleteDemoGuest(guestId);
    return { ok: true, status: 200, data: { success: true }, error: null };
  }
  return api.delete(`/api/guests/${guestId}`);
}

// ── AI Copilot endpoint ───────────────────────────────────────
export async function chatWithCopilot(eventId, message, history = []) {
  if (isJudgeDemoMode()) {
    const res = queryDemoCopilot(message);
    return { ok: true, status: 200, data: res, error: null };
  }
  return api.post(
    `/api/events/${eventId}/copilot`,
    { message, history },
    { timeout: AI_TIMEOUT }
  );
}

export async function acceptAndSavePlan(eventId, planData, applyToWorkspace = true) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: { message: 'Demo plan accepted' }, error: null };
  }
  return api.post(`/api/events/${eventId}/plans?apply_to_workspace=${applyToWorkspace}`, planData);
}

export async function getBudgetSummary(eventId) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: getDemoBudgetSummary(), error: null };
  }
  return api.get(`/api/events/${eventId}/budget-summary`);
}

export async function getGuestSummary(eventId) {
  if (isJudgeDemoMode()) {
    return { ok: true, status: 200, data: getDemoGuestSummary(), error: null };
  }
  return api.get(`/api/events/${eventId}/guests/summary`);
}

export function getExportUrl(eventId, exportType = 'expenses') {
  if (isJudgeDemoMode()) {
    if (exportType === 'tasks') {
      const tasks = getDemoTasks();
      const csv = "data:text/csv;charset=utf-8," +
        "Title,Category,Priority,Status,Assignee,Due Date\n" +
        tasks.map(t => `"${t.title}","${t.category}","${t.priority}","${t.status}","${t.assignee}","${t.due_date}"`).join("\n");
      return encodeURI(csv);
    }
    const expenses = getDemoExpenses();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Category,Amount,Paid Amount,Status,Vendor\n" +
      expenses.map(e => `"${e.title}","${e.category}",${e.amount},${e.paid_amount},"${e.payment_status}","${e.vendor_name}"`).join("\n");
    return encodeURI(csvContent);
  }
  return `${API_BASE_URL}/api/events/${eventId}/export/csv?export_type=${exportType}`;
}

export default api;

