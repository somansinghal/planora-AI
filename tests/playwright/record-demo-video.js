/**
 * Planora AI — Complete Hackathon Judge Walkthrough Video Recording
 * 
 * Records a continuous, professional 1440x900 browser walkthrough of:
 * 1. Landing Page & Brand Story
 * 2. Pricing & Value Proposition
 * 3. Judge Demo Mode Access (Zero-friction sandbox)
 * 4. Interactive Dashboard (Showcase Wedding event & live charts)
 * 5. Budget Studio & Expense Tracking
 * 6. Task Management & Milestones
 * 7. Timeline & Day-of Schedule
 * 8. Vendor Management
 * 9. Guest List & RSVP Breakdown
 * 10. AI Copilot Interaction
 * 11. Master Reports & Summary
 * 
 * Outputs:
 * - artifacts/video/planora-ai-demo.webm
 * - artifacts/video/planora-ai-demo.mp4 (via ffmpeg)
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'https://planora-ai-india.vercel.app';
const ARTIFACTS_ROOT = path.join(__dirname, '../../artifacts');
const VIDEO_DIR = path.join(ARTIFACTS_ROOT, 'video');
const VIDEOS_LEGACY_DIR = path.join(ARTIFACTS_ROOT, 'videos');

[VIDEO_DIR, VIDEOS_LEGACY_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function smoothScroll(page, distance, step = 80, delay = 50) {
  const steps = Math.abs(Math.floor(distance / step));
  const sign = distance > 0 ? 1 : -1;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, sign * step);
    await page.waitForTimeout(delay);
  }
}

export async function recordFullDemoVideo() {
  console.log(`\n============================================================`);
  console.log(`🎥 Planora AI — Judge Walkthrough Video Recording Suite`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Recording Viewport: 1440 x 900 Desktop`);
  console.log(`============================================================\n`);

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  try {
    // ── SCENE 1: Homepage & Value Proposition ──────────────────
    console.log(`[Scene 1/11] Landing Page & Brand Experience...`);
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Smooth scroll down the landing page
    await smoothScroll(page, 700);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 700);
    await page.waitForTimeout(1500);
    await smoothScroll(page, 800);
    await page.waitForTimeout(1500);
    // Scroll back to top
    await smoothScroll(page, -2200);
    await page.waitForTimeout(1500);

    // ── SCENE 2: Pricing Page ─────────────────────────────────
    console.log(`[Scene 2/11] Inspecting Transparent Pricing...`);
    const pricingLink = page.locator('a[href="pricing.html"]').first();
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await page.waitForURL(/pricing\.html/);
      await page.waitForTimeout(2000);
      await smoothScroll(page, 600);
      await page.waitForTimeout(1500);
      await smoothScroll(page, -600);
      await page.waitForTimeout(1000);
    }

    // ── SCENE 3: Accessing Judge Demo Mode ─────────────────────
    console.log(`[Scene 3/11] Entering Judge Demo Mode Sandbox...`);
    // Navigate into the live Judge Demo sandbox
    await page.goto(`${BASE_URL}/dashboard.html?demo=true`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // ── SCENE 4: Interactive Dashboard ─────────────────────────
    console.log(`[Scene 4/11] Exploring Showcase Wedding Dashboard...`);
    await smoothScroll(page, 450);
    await page.waitForTimeout(2000);
    await smoothScroll(page, 450);
    await page.waitForTimeout(2000);
    await smoothScroll(page, -900);
    await page.waitForTimeout(1500);

    // ── SCENE 5: Budget Studio & Expense Management ────────────
    console.log(`[Scene 5/11] Exploring Budget Studio & Expenses...`);
    await page.click('a[href="budget.html"]');
    await page.waitForURL(/budget\.html/);
    await page.waitForTimeout(2000);

    // Smooth scroll through expense items
    await smoothScroll(page, 500);
    await page.waitForTimeout(1800);

    // Open Add Expense Modal
    const btnAddExp = page.locator('#btn-open-add-expense');
    if (await btnAddExp.isVisible()) {
      console.log(`  -> Opening Add Expense Modal dialogue...`);
      await btnAddExp.click();
      await page.waitForTimeout(1800);
      await page.click('#btn-close-modal');
      await page.waitForTimeout(1000);
    }
    await smoothScroll(page, -500);
    await page.waitForTimeout(1000);

    // ── SCENE 6: Task Checklist & Milestones ───────────────────
    console.log(`[Scene 6/11] Exploring Task Management & Checklists...`);
    await page.click('a[href="tasks.html"]');
    await page.waitForURL(/tasks\.html/);
    await page.waitForTimeout(2000);
    await smoothScroll(page, 450);
    await page.waitForTimeout(1800);

    // Filter high priority tasks
    const priorityFilter = page.locator('#filter-priority');
    if (await priorityFilter.isVisible()) {
      console.log(`  -> Filtering by critical/high priority tasks...`);
      await priorityFilter.selectOption('high');
      await page.waitForTimeout(1500);
      await priorityFilter.selectOption('all');
      await page.waitForTimeout(1000);
    }
    await smoothScroll(page, -450);
    await page.waitForTimeout(1000);

    // ── SCENE 7: Timeline & Day-of Itinerary ───────────────────
    console.log(`[Scene 7/11] Inspecting Preparation Roadmap & Run Sheet...`);
    await page.click('a[href="timeline.html"]');
    await page.waitForURL(/timeline\.html/);
    await page.waitForTimeout(2000);
    await smoothScroll(page, 600);
    await page.waitForTimeout(2000);
    await smoothScroll(page, -600);
    await page.waitForTimeout(1000);

    // ── SCENE 8: Vendor Management ─────────────────────────────
    console.log(`[Scene 8/11] Inspecting Vendor Directory & Contracts...`);
    await page.click('a[href="vendors.html"]');
    await page.waitForURL(/vendors\.html/);
    await page.waitForTimeout(2000);
    await smoothScroll(page, 500);
    await page.waitForTimeout(1800);
    await smoothScroll(page, -500);
    await page.waitForTimeout(1000);

    // ── SCENE 9: Guest List & RSVPs ────────────────────────────
    console.log(`[Scene 9/11] Reviewing Guest RSVPs & Dietary Requirements...`);
    await page.click('a[href="guests.html"]');
    await page.waitForURL(/guests\.html/);
    await page.waitForTimeout(2000);
    await smoothScroll(page, 500);
    await page.waitForTimeout(1800);
    await smoothScroll(page, -500);
    await page.waitForTimeout(1000);

    // ── SCENE 10: AI Event Copilot ─────────────────────────────
    console.log(`[Scene 10/11] Testing AI Event Copilot Assistant...`);
    await page.click('a[href="copilot.html"]');
    await page.waitForURL(/copilot\.html/);
    await page.waitForTimeout(2000);

    const chatInput = page.locator('#chat-input');
    if (await chatInput.isVisible()) {
      console.log(`  -> Asking Copilot for catering budget optimization...`);
      await chatInput.fill('How can we optimize our catering budget for 200 wedding guests?');
      await page.waitForTimeout(1000);
      await page.click('#btn-send-chat');
      // Wait for AI response to stream and display
      await page.waitForTimeout(3500);
      await smoothScroll(page, 300);
      await page.waitForTimeout(2000);
    }

    // ── SCENE 11: Master Reports & Summary ────────────────────
    console.log(`[Scene 11/11] Viewing Master Event Audit Report...`);
    await page.click('a[href="reports.html"]');
    await page.waitForURL(/reports\.html/);
    await page.waitForTimeout(2500);
    await smoothScroll(page, 600);
    await page.waitForTimeout(2000);
    await smoothScroll(page, -600);
    await page.waitForTimeout(1500);

    // Return to Dashboard for a clean finish
    console.log(`Returning to Dashboard for final view...`);
    await page.click('a[href="dashboard.html"]');
    await page.waitForURL(/dashboard\.html/);
    await page.waitForTimeout(2500);

    console.log(`✅ Demo walkthrough finished successfully!`);
  } catch (err) {
    console.error(`❌ Error during walkthrough:`, err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    // Process recorded video files
    const rawFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm') && f !== 'planora-ai-demo.webm');
    if (rawFiles.length > 0) {
      const latestRaw = path.join(VIDEO_DIR, rawFiles[rawFiles.length - 1]);
      const canonicalWebm = path.join(VIDEO_DIR, 'planora-ai-demo.webm');
      fs.copyFileSync(latestRaw, canonicalWebm);
      // Also copy to legacy /videos directory
      fs.copyFileSync(latestRaw, path.join(VIDEOS_LEGACY_DIR, 'planora-ai-demo.webm'));
      console.log(`\n🎞️  WebM Video saved at: ${canonicalWebm}`);

      // Convert to MP4 using ffmpeg if available
      const canonicalMp4 = path.join(VIDEO_DIR, 'planora-ai-demo.mp4');
      try {
        console.log(`⚙️  Transcoding WebM to MP4 using ffmpeg...`);
        execSync(`/opt/homebrew/bin/ffmpeg -y -i "${canonicalWebm}" -c:v libx264 -pix_fmt yuv420p -r 30 -movflags +faststart "${canonicalMp4}"`, {
          stdio: 'inherit',
        });
        fs.copyFileSync(canonicalMp4, path.join(VIDEOS_LEGACY_DIR, 'planora-ai-demo.mp4'));
        console.log(`🎬 High-Compatibility MP4 saved at: ${canonicalMp4}`);
      } catch (ffErr) {
        console.warn(`⚠️ ffmpeg transcode note: ${ffErr.message}`);
      }
    }
  }
}

// Direct execution
recordFullDemoVideo().catch((err) => {
  console.error(err);
  process.exit(1);
});
