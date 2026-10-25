/**
 * Planora AI – Navigation Module
 * 
 * Handles:
 * - Mobile hamburger menu toggle
 * - Scroll-triggered navbar styling
 * - Active link detection
 * - Anchor link smooth scroll
 * - Sidebar collapse/expand (app pages)
 */

// ── Public nav ────────────────────────────────────────────────
function initPublicNav() {
  const nav = document.getElementById('main-nav');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!nav) return;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Close on backdrop click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobileMenu();
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Set active nav link
  setActiveNavLink();
}

function toggleMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;
  
  const isOpen = mobileMenu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;
  
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;
  
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── App sidebar ───────────────────────────────────────────────
function initSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const overlay = document.getElementById('sidebar-overlay');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const appMain = document.getElementById('app-main');
  
  if (!sidebar) return;

  // Restore collapsed state
  const isCollapsed = localStorage.getItem('planora_sidebar_collapsed') === 'true';
  if (isCollapsed && window.innerWidth > 768) {
    sidebar.classList.add('collapsed');
    if (appMain) appMain.classList.add('sidebar-collapsed');
  }

  // Desktop toggle
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const collapsed = sidebar.classList.toggle('collapsed');
      if (appMain) appMain.classList.toggle('sidebar-collapsed', collapsed);
      localStorage.setItem('planora_sidebar_collapsed', collapsed);
    });
  }

  // Mobile toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (overlay) overlay.classList.toggle('visible');
      document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    });
  }

  // Set active sidebar link
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Responsive: close sidebar if window resizes to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
  });
}

// ── Initialize on DOM ready ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPublicNav();
  initSidebar();
});

// Expose for inline onclick handlers
window.closeMobileMenu = closeMobileMenu;
window.openMobileMenu = openMobileMenu;

export { initPublicNav, initSidebar, closeMobileMenu, openMobileMenu };
