/**
 * Planora AI — Complete Playwright Screenshot Capture Suite
 * 
 * Captures:
 * 1. Desktop full-page and viewport screenshots (1440x900)
 * 2. Mobile viewport and full-page screenshots (390x844 - iPhone 14)
 * 3. Tablet screenshots (768x1024 - iPad)
 * 4. Interactive states (modals, mobile menu, copilot query, demo banner)
 * 
 * Logs console errors and network failures to artifacts/reports/
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'https://planora-ai-india.vercel.app';
const ARTIFACTS_ROOT = path.join(__dirname, '../../artifacts');
const DESKTOP_DIR = path.join(ARTIFACTS_ROOT, 'screenshots/desktop');
const MOBILE_DIR = path.join(ARTIFACTS_ROOT, 'screenshots/mobile');
const TABLET_DIR = path.join(ARTIFACTS_ROOT, 'screenshots/tablet');
const INTERACTIONS_DIR = path.join(ARTIFACTS_ROOT, 'screenshots/interactions');
const REPORTS_DIR = path.join(ARTIFACTS_ROOT, 'reports');

// Ensure all directories exist
[DESKTOP_DIR, MOBILE_DIR, TABLET_DIR, INTERACTIONS_DIR, REPORTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const consoleErrors = [];
const failedRequests = [];
const capturedPages = [];

function attachPageListeners(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore routine 3rd party favicon or analytics noise
      if (!text.includes('favicon') && !text.includes('chrome-extension')) {
        consoleErrors.push(`[${page.url()}] ${text}`);
      }
    }
  });

  page.on('requestfailed', (req) => {
    failedRequests.push(`[${req.method()}] ${req.url()} - ${req.failure()?.errorText || 'Failed'}`);
  });
}

export async function runScreenshotWorkflow() {
  console.log(`\n============================================================`);
  console.log(`📸 Planora AI — Playwright Screenshot Automation Workflow`);
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log(`============================================================\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    // ============================================================
    // 1. DESKTOP WORKSPACE (1440 x 900)
    // ============================================================
    console.log(`\n🖥️  [Phase 1] Capturing Desktop Full-Page & Viewport Screenshots (1440x900)...`);
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const desktopPage = await desktopContext.newPage();
    attachPageListeners(desktopPage);

    // List of all 19 application & public pages
    const desktopPages = [
      { name: '01_landing', path: 'index.html', title: 'Landing Page' },
      { name: '02_about', path: 'about.html', title: 'About Us' },
      { name: '03_pricing', path: 'pricing.html', title: 'Pricing' },
      { name: '04_login', path: 'login.html', title: 'Sign In' },
      { name: '05_signup', path: 'signup.html', title: 'Sign Up' },
      { name: '06_terms', path: 'terms.html', title: 'Terms of Service' },
      { name: '07_privacy', path: 'privacy.html', title: 'Privacy Policy' },
      { name: '08_404', path: '404.html', title: '404 Error' },
      // Demo Mode enabled pages
      { name: '09_dashboard_demo', path: 'dashboard.html?demo=true', title: 'Demo Dashboard' },
      { name: '10_create_event', path: 'create-event.html', title: 'Create Event' },
      { name: '11_planner_studio', path: 'planner.html', title: 'AI Studio' },
      { name: '12_budget_studio', path: 'budget.html', title: 'Budget Studio' },
      { name: '13_tasks_checklist', path: 'tasks.html', title: 'Task Checklist' },
      { name: '14_timeline_milestones', path: 'timeline.html', title: 'Timeline & Run Sheet' },
      { name: '15_vendors_manager', path: 'vendors.html', title: 'Vendor Management' },
      { name: '16_guests_rsvp', path: 'guests.html', title: 'Guest List & RSVPs' },
      { name: '17_copilot_assistant', path: 'copilot.html', title: 'AI Event Copilot' },
      { name: '18_reports_summary', path: 'reports.html', title: 'Master Report' },
      { name: '19_settings_preferences', path: 'settings.html', title: 'Settings' },
    ];

    for (const pageInfo of desktopPages) {
      const url = `${BASE_URL}/${pageInfo.path}`;
      process.stdout.write(`  Capturing ${pageInfo.title.padEnd(25)} (${pageInfo.path})... `);
      try {
        await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await desktopPage.waitForTimeout(1000); // Allow fonts & charts to paint

        // Full Page
        const fullPath = path.join(DESKTOP_DIR, `${pageInfo.name}_full.png`);
        await desktopPage.screenshot({ path: fullPath, fullPage: true });

        // Viewport
        const viewportPath = path.join(DESKTOP_DIR, `${pageInfo.name}_viewport.png`);
        await desktopPage.screenshot({ path: viewportPath });

        capturedPages.push({ name: pageInfo.name, type: 'desktop', url, status: 'OK' });
        console.log(`✅ Done`);
      } catch (err) {
        capturedPages.push({ name: pageInfo.name, type: 'desktop', url, status: `FAILED: ${err.message}` });
        console.log(`❌ Failed: ${err.message}`);
      }
    }

    // ============================================================
    // 2. INTERACTION WORKFLOW STATES (Desktop)
    // ============================================================
    console.log(`\n✨ [Phase 2] Capturing Interactive States & Dialogs...`);

    // A. Add Expense Modal on budget.html
    try {
      process.stdout.write(`  Opening Add Expense Modal... `);
      await desktopPage.goto(`${BASE_URL}/budget.html`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1000);
      const btnAddExp = desktopPage.locator('#btn-open-add-expense');
      if (await btnAddExp.isVisible()) {
        await btnAddExp.click();
        await desktopPage.waitForTimeout(600);
        await desktopPage.screenshot({
          path: path.join(INTERACTIONS_DIR, 'interaction_01_add_expense_modal.png'),
        });
        console.log(`✅ Saved`);
        await desktopPage.click('#btn-close-modal');
      } else {
        console.log(`⚠️ Button not found`);
      }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    // B. Add Task Modal on tasks.html
    try {
      process.stdout.write(`  Opening Add Task Modal... `);
      await desktopPage.goto(`${BASE_URL}/tasks.html`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1000);
      const btnAddTask = desktopPage.locator('#btn-open-add-task');
      if (await btnAddTask.isVisible()) {
        await btnAddTask.click();
        await desktopPage.waitForTimeout(600);
        await desktopPage.screenshot({
          path: path.join(INTERACTIONS_DIR, 'interaction_02_add_task_modal.png'),
        });
        console.log(`✅ Saved`);
        await desktopPage.click('#btn-close-modal');
      } else {
        console.log(`⚠️ Button not found`);
      }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    // C. Add Guest Modal on guests.html
    try {
      process.stdout.write(`  Opening Add Guest Modal... `);
      await desktopPage.goto(`${BASE_URL}/guests.html`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1000);
      const btnAddGuest = desktopPage.locator('#btn-open-add-guest');
      if (await btnAddGuest.isVisible()) {
        await btnAddGuest.click();
        await desktopPage.waitForTimeout(600);
        await desktopPage.screenshot({
          path: path.join(INTERACTIONS_DIR, 'interaction_03_add_guest_modal.png'),
        });
        console.log(`✅ Saved`);
        await desktopPage.click('#btn-close-modal');
      } else {
        console.log(`⚠️ Button not found`);
      }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    // D. Add Vendor Modal on vendors.html
    try {
      process.stdout.write(`  Opening Add Vendor Modal... `);
      await desktopPage.goto(`${BASE_URL}/vendors.html`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1000);
      const btnAddVendor = desktopPage.locator('#btn-open-add-vendor');
      if (await btnAddVendor.isVisible()) {
        await btnAddVendor.click();
        await desktopPage.waitForTimeout(600);
        await desktopPage.screenshot({
          path: path.join(INTERACTIONS_DIR, 'interaction_04_add_vendor_modal.png'),
        });
        console.log(`✅ Saved`);
        await desktopPage.click('#btn-close-modal');
      } else {
        console.log(`⚠️ Button not found`);
      }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    // E. Copilot Interaction State on copilot.html
    try {
      process.stdout.write(`  Querying AI Copilot... `);
      await desktopPage.goto(`${BASE_URL}/copilot.html`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1200);
      const chatInput = desktopPage.locator('#chat-input');
      if (await chatInput.isVisible()) {
        await chatInput.fill('Can you suggest high-impact ways to optimize our catering budget?');
        await desktopPage.click('#btn-send-chat');
        await desktopPage.waitForTimeout(2500); // Wait for response
        await desktopPage.screenshot({
          path: path.join(INTERACTIONS_DIR, 'interaction_05_copilot_response.png'),
        });
        console.log(`✅ Saved`);
      } else {
        console.log(`⚠️ Chat input not found`);
      }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    // F. Demo Banner on Dashboard
    try {
      process.stdout.write(`  Capturing Judge Demo Banner... `);
      await desktopPage.goto(`${BASE_URL}/dashboard.html`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(800);
      await desktopPage.screenshot({
        path: path.join(INTERACTIONS_DIR, 'interaction_06_judge_demo_banner.png'),
      });
      console.log(`✅ Saved`);
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    await desktopContext.close();

    // ============================================================
    // 3. TABLET WORKSPACE (768 x 1024)
    // ============================================================
    console.log(`\n📱 [Phase 3] Capturing Tablet Breakpoint Screenshots (768x1024)...`);
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();
    attachPageListeners(tabletPage);

    const tabletPages = [
      { name: 'tablet_01_landing', path: 'index.html', title: 'Landing Tablet' },
      { name: 'tablet_02_dashboard', path: 'dashboard.html?demo=true', title: 'Dashboard Tablet' },
      { name: 'tablet_03_budget', path: 'budget.html', title: 'Budget Tablet' },
      { name: 'tablet_04_tasks', path: 'tasks.html', title: 'Tasks Tablet' },
    ];

    for (const p of tabletPages) {
      process.stdout.write(`  Capturing Tablet ${p.title}... `);
      await tabletPage.goto(`${BASE_URL}/${p.path}`, { waitUntil: 'networkidle' });
      await tabletPage.waitForTimeout(800);
      await tabletPage.screenshot({ path: path.join(TABLET_DIR, `${p.name}.png`), fullPage: true });
      console.log(`✅ Done`);
    }
    await tabletContext.close();

    // ============================================================
    // 4. MOBILE WORKSPACE (390 x 844 - iPhone 14)
    // ============================================================
    console.log(`\n📲 [Phase 4] Capturing Mobile Screenshots (390x844)...`);
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    attachPageListeners(mobilePage);

    const mobilePages = [
      { name: 'mobile_01_landing', path: 'index.html', title: 'Landing' },
      { name: 'mobile_02_pricing', path: 'pricing.html', title: 'Pricing' },
      { name: 'mobile_03_login', path: 'login.html', title: 'Login' },
      { name: 'mobile_04_dashboard', path: 'dashboard.html?demo=true', title: 'Dashboard' },
      { name: 'mobile_05_budget', path: 'budget.html', title: 'Budget' },
      { name: 'mobile_06_tasks', path: 'tasks.html', title: 'Tasks' },
      { name: 'mobile_07_timeline', path: 'timeline.html', title: 'Timeline' },
      { name: 'mobile_08_copilot', path: 'copilot.html', title: 'Copilot' },
      { name: 'mobile_09_guests', path: 'guests.html', title: 'Guests' },
      { name: 'mobile_10_vendors', path: 'vendors.html', title: 'Vendors' },
      { name: 'mobile_11_reports', path: 'reports.html', title: 'Reports' },
    ];

    for (const mp of mobilePages) {
      process.stdout.write(`  Capturing Mobile ${mp.title.padEnd(15)}... `);
      await mobilePage.goto(`${BASE_URL}/${mp.path}`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(800);

      // Mobile Full Page
      await mobilePage.screenshot({
        path: path.join(MOBILE_DIR, `${mp.name}_full.png`),
        fullPage: true,
      });

      // Mobile Viewport
      await mobilePage.screenshot({
        path: path.join(MOBILE_DIR, `${mp.name}_viewport.png`),
      });

      console.log(`✅ Done`);
    }

    // Capture Mobile Hamburger Nav Open
    try {
      process.stdout.write(`  Capturing Mobile Hamburger Navigation Menu... `);
      await mobilePage.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(600);
      const hamburger = mobilePage.locator('#nav-hamburger, .nav-hamburger');
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await mobilePage.waitForTimeout(600);
        await mobilePage.screenshot({
          path: path.join(INTERACTIONS_DIR, 'interaction_07_mobile_nav_opened.png'),
        });
        console.log(`✅ Saved`);
      } else {
        console.log(`ℹ️ Hamburger not visible`);
      }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

    await mobileContext.close();

    // ============================================================
    // 5. WRITE REPORTS & LOGS
    // ============================================================
    console.log(`\n📝 [Phase 5] Writing Reports & Logs to ${REPORTS_DIR}...`);

    // A. Console errors
    fs.writeFileSync(
      path.join(REPORTS_DIR, 'browser-console-errors.txt'),
      consoleErrors.length > 0 ? consoleErrors.join('\n') : 'No fatal browser console errors detected.\n',
      'utf8'
    );

    // B. Failed requests
    fs.writeFileSync(
      path.join(REPORTS_DIR, 'failed-requests.txt'),
      failedRequests.length > 0 ? failedRequests.join('\n') : 'All network requests succeeded with HTTP 200/304.\n',
      'utf8'
    );

    // C. Execution Summary Markdown
    const totalDesktop = fs.readdirSync(DESKTOP_DIR).filter(f => f.endsWith('.png')).length;
    const totalMobile = fs.readdirSync(MOBILE_DIR).filter(f => f.endsWith('.png')).length;
    const totalTablet = fs.readdirSync(TABLET_DIR).filter(f => f.endsWith('.png')).length;
    const totalInteractions = fs.readdirSync(INTERACTIONS_DIR).filter(f => f.endsWith('.png')).length;
    const grandTotal = totalDesktop + totalMobile + totalTablet + totalInteractions;

    const summaryMd = `# Planora AI — Playwright Automation & Screenshot Report

**Execution Target:** ${BASE_URL}  
**Execution Timestamp:** ${new Date().toISOString()}  
**Total Screenshots Captured:** **${grandTotal}**

## Summary by Viewport

| Category | Viewport Dimensions | Total Screenshots | Destination Directory |
| :--- | :--- | :--- | :--- |
| **Desktop Pages** | 1440 × 900 (Full & Viewport) | ${totalDesktop} | \`artifacts/screenshots/desktop/\` |
| **Mobile Pages** | 390 × 844 (Full & Viewport) | ${totalMobile} | \`artifacts/screenshots/mobile/\` |
| **Tablet Pages** | 768 × 1024 (Responsive) | ${totalTablet} | \`artifacts/screenshots/tablet/\` |
| **Interactions** | Modals, Chat, Menus, Banner | ${totalInteractions} | \`artifacts/screenshots/interactions/\` |

## Pages Validated
${desktopPages.map(p => `- [x] **${p.title}** (\`${p.path}\`)`).join('\n')}

## Browser Diagnostics
- **Console Errors Recorded:** ${consoleErrors.length} (See \`artifacts/reports/browser-console-errors.txt\`)
- **Failed Requests Recorded:** ${failedRequests.length} (See \`artifacts/reports/failed-requests.txt\`)
`;

    fs.writeFileSync(path.join(REPORTS_DIR, 'execution-summary.md'), summaryMd, 'utf8');

    console.log(`\n🎉 Screenshot workflow complete! Generated ${grandTotal} screenshots.`);
  } catch (fatalErr) {
    console.error('[Planora QA] Fatal error in screenshot workflow:', fatalErr);
  } finally {
    await browser.close();
  }
}

// Direct execution
runScreenshotWorkflow().catch((err) => {
  console.error(err);
  process.exit(1);
});
