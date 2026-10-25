/**
 * Planora AI – Playwright Screenshot Capture Utility
 * Captures high-fidelity desktop and mobile screenshots for hackathon submissions and QA audits.
 * Saves outputs to artifacts/playwright/screenshots/
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../../artifacts/playwright/screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function captureAllScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`[Planora QA] Launching browser to capture screenshots from ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Context (1280 x 800)
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2
    });
    const desktopPage = await desktopContext.newPage();

    console.log('[1/10] Capturing Homepage Desktop...');
    await desktopPage.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '01_homepage_desktop.png'), fullPage: true });

    console.log('[2/10] Capturing Public Footer & Social Links...');
    const footer = desktopPage.locator('footer.footer');
    await footer.scrollIntoViewIfNeeded();
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '02_footer_social_links.png') });

    console.log('[3/10] Capturing Demo Entry Point (Hero CTA)...');
    const hero = desktopPage.locator('.hero');
    await hero.scrollIntoViewIfNeeded();
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '03_demo_entry_point.png') });

    console.log('[4/10] Capturing Login Page with Demo CTA...');
    await desktopPage.goto(`${BASE_URL}/login.html`, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '04_login_page.png') });

    console.log('[5/10] Capturing Signup Page with Demo CTA...');
    await desktopPage.goto(`${BASE_URL}/signup.html`, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '05_signup_page.png') });

    console.log('[6/10] Capturing Judge Demo Dashboard (Showcase Wedding)...');
    await desktopPage.goto(`${BASE_URL}/dashboard.html?demo=true`, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '06_judge_demo_dashboard.png'), fullPage: true });

    console.log('[7/10] Capturing Demo Budget Studio...');
    await desktopPage.goto(`${BASE_URL}/budget.html`, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '07_demo_budget_studio.png'), fullPage: true });

    console.log('[8/10] Capturing Demo Task Checklist...');
    await desktopPage.goto(`${BASE_URL}/tasks.html`, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '08_demo_tasks_checklist.png'), fullPage: true });

    await desktopContext.close();

    // 2. Mobile Context (iPhone 14 / 390 x 844)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();

    console.log('[9/10] Capturing Homepage Mobile...');
    await mobilePage.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '09_homepage_mobile.png'), fullPage: true });

    console.log('[10/10] Capturing Judge Demo Dashboard on Mobile...');
    await mobilePage.goto(`${BASE_URL}/dashboard.html?demo=true`, { waitUntil: 'networkidle' });
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '10_judge_demo_mobile.png'), fullPage: true });

    await mobileContext.close();

    console.log(`[Planora QA] Successfully captured all 10 screenshots in ${OUTPUT_DIR}`);
  } catch (err) {
    console.error('[Planora QA] Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  captureAllScreenshots();
}

module.exports = { captureAllScreenshots };
