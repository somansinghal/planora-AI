/**
 * Planora AI – Shared App Shell HTML
 * 
 * Sidebar navigation and topbar used across all app pages.
 * Included via JS injection to avoid duplication.
 */

export function getAppShellHTML(activePage = '') {
  return `
    <!-- Sidebar -->
    <aside class="sidebar" id="app-sidebar" role="navigation" aria-label="Application navigation">
      <div class="sidebar-header">
        <a href="dashboard.html" class="sidebar-logo" aria-label="Planora AI Dashboard">
          <img src="assets/logo/planora-logo.png" alt="Planora AI" width="28" height="28">
          <span class="sidebar-logo-text">Planora AI</span>
        </a>
        <button class="sidebar-toggle" id="sidebar-toggle-btn" aria-label="Toggle sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Main navigation">
        <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}" ${activePage === 'dashboard' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span class="sidebar-link-label">Dashboard</span>
        </a>

        <span class="sidebar-section-label">Events</span>

        <a href="create-event.html" class="sidebar-link ${activePage === 'create-event' ? 'active' : ''}" ${activePage === 'create-event' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span class="sidebar-link-label">Create Event</span>
        </a>

        <a href="planner.html" class="sidebar-link ${activePage === 'planner' ? 'active' : ''}" ${activePage === 'planner' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>
          <span class="sidebar-link-label">AI Event Studio</span>
        </a>

        <span class="sidebar-section-label">Management</span>

        <a href="budget.html" class="sidebar-link ${activePage === 'budget' ? 'active' : ''}" ${activePage === 'budget' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span class="sidebar-link-label">Budget</span>
        </a>

        <a href="timeline.html" class="sidebar-link ${activePage === 'timeline' ? 'active' : ''}" ${activePage === 'timeline' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span class="sidebar-link-label">Timeline</span>
        </a>

        <a href="tasks.html" class="sidebar-link ${activePage === 'tasks' ? 'active' : ''}" ${activePage === 'tasks' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span class="sidebar-link-label">Tasks</span>
        </a>

        <a href="vendors.html" class="sidebar-link ${activePage === 'vendors' ? 'active' : ''}" ${activePage === 'vendors' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span class="sidebar-link-label">Vendors</span>
        </a>

        <a href="guests.html" class="sidebar-link ${activePage === 'guests' ? 'active' : ''}" ${activePage === 'guests' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span class="sidebar-link-label">Guests</span>
        </a>

        <span class="sidebar-section-label">AI & Reports</span>

        <a href="copilot.html" class="sidebar-link ${activePage === 'copilot' ? 'active' : ''}" ${activePage === 'copilot' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="sidebar-link-label">AI Copilot</span>
        </a>

        <a href="reports.html" class="sidebar-link ${activePage === 'reports' ? 'active' : ''}" ${activePage === 'reports' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span class="sidebar-link-label">Reports</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a href="settings.html" class="sidebar-link ${activePage === 'settings' ? 'active' : ''}" ${activePage === 'settings' ? 'aria-current="page"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span class="sidebar-link-label">Settings</span>
        </a>
        <div class="sidebar-user" id="sidebar-user-btn" role="button" tabindex="0" aria-label="User menu" aria-haspopup="true">
          <div class="user-avatar" id="sidebar-avatar" aria-hidden="true">?</div>
          <div class="sidebar-user-info">
            <div class="user-name" id="sidebar-user-name">Loading...</div>
            <div class="user-email" id="sidebar-user-email"></div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </aside>

    <!-- Sidebar Overlay (mobile) -->
    <div class="sidebar-overlay" id="sidebar-overlay" aria-hidden="true"></div>

    <!-- User Dropdown -->
    <div class="dropdown-menu hidden" id="user-dropdown" role="menu" aria-label="User options">
      <div class="dropdown-item" role="menuitem" onclick="window.location.href='settings.html'">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>
        Settings
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-item danger" id="signout-btn" role="menuitem" tabindex="0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </div>
    </div>
  `;
}

export function getTopbarHTML(title, subtitle = '') {
  return `
    <header class="app-topbar" role="banner">
      <div class="app-topbar-left">
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open navigation menu" aria-controls="app-sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div>
          <h1 class="topbar-title">${title}</h1>
          ${subtitle ? `<p class="topbar-subtitle">${subtitle}</p>` : ''}
        </div>
      </div>
      <div class="app-topbar-right">
        <a href="create-event.html" class="btn btn-primary btn-sm" id="topbar-create-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Event
        </a>
      </div>
    </header>
  `;
}
