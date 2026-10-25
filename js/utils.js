/**
 * Planora AI – Utility Functions
 */

// ── Toast Notifications ─────────────────────────────────────
const toastQueue = [];

export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  const icon = getToastIcon(type);
  toast.innerHTML = `
    ${icon}
    <span>${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" style="margin-left:auto;opacity:0.6;transition:opacity 0.2s;" 
            onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.6'"
            aria-label="Dismiss notification">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('exit');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  return toast;
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('role', 'alert');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  document.body.appendChild(container);
  return container;
}

function getToastIcon(type) {
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };
  return icons[type] || icons.info;
}

// ── HTML escaping (XSS prevention) ──────────────────────────
export function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Currency formatting ──────────────────────────────────────
export function formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
  const num = Number(amount);
  if (isNaN(num)) return '—';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// ── Number formatting ────────────────────────────────────────
export function formatNumber(num) {
  if (isNaN(Number(num))) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(num));
}

// ── Date formatting ──────────────────────────────────────────
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    
    const defaults = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-IN', { ...defaults, ...options });
  } catch {
    return '—';
  }
}

export function formatDateShort(dateStr) {
  return formatDate(dateStr, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateInput(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  try {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  } catch {
    return null;
  }
}

export function formatCountdown(days) {
  if (days === null) return '';
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days away`;
  if (days < 30) return `${Math.ceil(days / 7)} weeks away`;
  return `${Math.ceil(days / 30)} months away`;
}

// ── Time ago formatting ──────────────────────────────────────
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    
    if (diffSec < 60)     return 'Just now';
    if (diffSec < 3600)   return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400)  return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDateShort(dateStr);
  } catch {
    return '';
  }
}

// ── Validation utilities ─────────────────────────────────────
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validateRequired(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function validateMinLength(value, min) {
  return String(value).trim().length >= min;
}

export function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function validateFutureDate(dateStr) {
  if (!validateDate(dateStr)) return false;
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

export function validatePositiveNumber(val) {
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

export function validateRange(val, min, max) {
  const num = Number(val);
  return !isNaN(num) && num >= min && num <= max;
}

// ── Password strength ────────────────────────────────────────
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ['', 'weak', 'fair', 'good', 'strong', 'strong'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  
  return { score, level: levels[Math.min(score, 4)], label: labels[Math.min(score, 5)] };
}

// ── Form helpers ─────────────────────────────────────────────
export function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  
  if (field) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.setAttribute('aria-describedby', `${fieldId}-error`);
    }
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'flex';
  }
}

export function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  
  if (field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  }
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

export function clearAllErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  form.querySelectorAll('.form-input.error').forEach(el => {
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

export function setButtonLoading(btnId, loading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn._originalText = btn.textContent;
    btn.setAttribute('aria-busy', 'true');
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (originalText) btn.textContent = originalText;
    else if (btn._originalText) btn.textContent = btn._originalText;
    btn.removeAttribute('aria-busy');
  }
}

// ── Modal helpers ────────────────────────────────────────────
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    // Focus first focusable element
    const focusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 100);
    // Trap focus
    document.body.style.overflow = 'hidden';
  }
}

export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// ── Confirmation dialog ──────────────────────────────────────
export function showConfirm(title, message, onConfirm, options = {}) {
  const existing = document.getElementById('confirm-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'confirm-modal';
  modal.className = 'modal-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'confirm-title');
  modal.innerHTML = `
    <div class="modal" style="max-width:440px;">
      <div class="modal-header">
        <h2 class="text-xl font-semibold" id="confirm-title">${escapeHtml(title)}</h2>
        <button class="btn btn-ghost btn-icon" onclick="document.getElementById('confirm-modal').remove(); document.body.style.overflow='';" aria-label="Close dialog">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <p class="text-secondary">${escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-cancel-btn">Cancel</button>
        <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok-btn">
          ${escapeHtml(options.confirmText || 'Confirm')}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  document.getElementById('confirm-ok-btn').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
    onConfirm();
  });
  document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
    if (options.onCancel) options.onCancel();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });

  document.getElementById('confirm-ok-btn').focus();
}

// ── Generate unique ID ────────────────────────────────────────
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Debounce ──────────────────────────────────────────────────
export function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Deep clone ────────────────────────────────────────────────
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Get initials from name ────────────────────────────────────
export function getInitials(name, max = 2) {
  if (!name) return '?';
  return name.trim().split(/\s+/)
    .slice(0, max)
    .map(w => w[0].toUpperCase())
    .join('');
}

// ── Event type emoji ──────────────────────────────────────────
export function getEventEmoji(type) {
  const emojis = {
    'wedding':     '💍',
    'birthday':    '🎂',
    'anniversary': '💑',
    'corporate':   '🏢',
    'graduation':  '🎓',
    'baby_shower': '👶',
    'engagement':  '💒',
    'retirement':  '🌴',
    'festival':    '🎉',
    'conference':  '📊',
    'fundraiser':  '🤝',
    'other':       '✨',
  };
  return emojis[type?.toLowerCase()] || '✨';
}

// ── Priority color ────────────────────────────────────────────
export function getPriorityClass(priority) {
  const map = {
    'high':   'priority-high',
    'medium': 'priority-medium',
    'low':    'priority-low',
  };
  return map[priority?.toLowerCase()] || 'priority-low';
}

// ── Smooth scroll to element ──────────────────────────────────
export function scrollTo(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Local storage helpers ─────────────────────────────────────
export function localGet(key, defaultValue = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function localSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function localRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// ── Copy to clipboard ─────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  }
}

// ── Render skeleton loaders ───────────────────────────────────
export function renderSkeletons(container, count = 3, height = '80px') {
  container.innerHTML = Array.from({ length: count }, () =>
    `<div class="skeleton" style="height:${height};border-radius:var(--radius-xl);"></div>`
  ).join('');
}
