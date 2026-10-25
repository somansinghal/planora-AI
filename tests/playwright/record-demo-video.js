/**
 * Planora AI – Playwright Video Recording Utility
 * Records a full interactive Judge Demo walkthrough for hackathon submission and documentation.
 * Outputs WebM video to artifacts/playwright/videos/
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const VIDEO_DIR = path.join(__dirname, '../../artifacts/playwright/videos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function recordJudgeDemoWalkthrough() {
  if (!fs.existsSync(VIDEO_DIR)) {
    fs.mkdirSync(VIDEO_DIR, { recursive: true });
  }

  console.log(`[Planora QA] Launching browser to record video walkthrough from ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  try {
    // 1. Visit Homepage
    console.log('[Step 1] Visiting homepage...');
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 2. Click "Try Live Demo"
    console.log('[Step 2] Finding and clicking Try Live Demo...');
    const demoBtn = page.locator('#hero-demo-btn');
    await demoBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await demoBtn.click();

    // 3. Arrive in Judge Demo Sandbox
    console.log('[Step 3] Entering Judge Demo Sandbox (no login required)...');
    await page.waitForURL(/dashboard\.html/);
    await page.waitForTimeout(2000);

    // 4. Inspect Showcase Event Dashboard
    console.log('[Step 4] Exploring dashboard metrics...');
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(1000);

    // 5. Open Budget Management
    console.log('[Step 5] Navigating to Budget Studio...');
    await page.click('a[href="budget.html"]');
    await page.waitForURL(/budget\.html/);
    await page.waitForTimeout(2000);

    // 6. Open Task Management
    console.log('[Step 6] Navigating to Task Checklist...');
    await page.click('a[href="tasks.html"]');
    await page.waitForURL(/tasks\.html/);
    await page.waitForTimeout(2000);

    // 7. Open AI Copilot
    console.log('[Step 7] Testing AI Copilot query in demo mode...');
    await page.click('a[href="copilot.html"]');
    await page.waitForURL(/copilot\.html/);
    await page.waitForTimeout(1500);

    // 8. Return to Dashboard & Exit Demo
    console.log('[Step 8] Returning to dashboard...');
    await page.click('a[href="dashboard.html"]');
    await page.waitForURL(/dashboard\.html/);
    await page.waitForTimeout(1500);

    console.log('[Step 9] Clicking Exit Demo...');
    const exitBtn = page.locator('#btn-exit-demo');
    if (await exitBtn.isVisible()) {
      await exitBtn.click();
      await page.waitForTimeout(1500);
    }

    console.log('[Planora QA] Walkthrough completed successfully.');
  } catch (err) {
    console.error('[Planora QA] Error during video recording:', err);
  } finally {
    // Closing context finalizes the video file
    await page.close();
    await context.close();
    await browser.close();

    // Rename recorded file to canonical name
    const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      const latestVideo = path.join(VIDEO_DIR, files[files.length - 1]);
      const targetName = path.join(VIDEO_DIR, 'planora-judge-demo.webm');
      if (latestVideo !== targetName) {
        fs.renameSync(latestVideo, targetName);
      }
      console.log(`[Planora QA] Video recording finalized at: ${targetName}`);
    }
  }
}

if (require.main === module) {
  recordJudgeDemoWalkthrough();
}

module.exports = { recordJudgeDemoWalkthrough };
