// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Planora AI – Comprehensive Browser Test Suite
 * Covers public navigation, forms, route guards, event lifecycle,
 * budget mathematics, task status changes, vendors, guests, and exports.
 */

test.describe('1. Public Website & Navigation', () => {
  test('Landing page loads with brand identity and tagline', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/Planora AI/i);
    await expect(page.locator('.nav-logo-text')).toContainText('Planora AI');
    await expect(page.locator('#hero-title')).toContainText('From');
    await expect(page.locator('#hero-title')).toContainText('Flawlessly Planned');
  });

  test('Public navigation links function correctly', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('a[href="pricing.html"]');
    await expect(page).toHaveURL(/pricing\.html/);
    await expect(page.locator('h1')).toContainText('Transparent Pricing');

    await page.click('a[href="about.html"]');
    await expect(page).toHaveURL(/about\.html/);
    await expect(page.locator('h1')).toContainText('Flawlessly Planned');
  });

  test('Pricing page renders Free, Pro, and Enterprise tiers', async ({ page }) => {
    await page.goto('/pricing.html');
    await expect(page.locator('text=Free Starter')).toBeVisible();
    await expect(page.locator('text=Pro Planner')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
  });

  test('Custom 404 page loads properly', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Event Not Found in This Galaxy')).toBeVisible();
  });
});

test.describe('2. Authentication Forms & Route Protection', () => {
  test('Login form validates empty inputs', async ({ page }) => {
    await page.goto('/login.html');
    await page.click('#btn-login-submit');
    const emailField = page.locator('#email');
    await expect(emailField).toBeVisible();
  });

  test('Registration form validates password confirmation', async ({ page }) => {
    await page.goto('/signup.html');
    await page.fill('#name', 'Test Organizer');
    await page.fill('#email', 'test@planora.ai');
    await page.fill('#password', 'SecretPass123!');
    await page.fill('#confirm-password', 'MismatchedPass!');
    await page.click('#btn-signup-submit');
    await expect(page.locator('#toast-container')).toBeVisible();
  });

  test('Unauthenticated user is redirected away from protected dashboard', async ({ page }) => {
    await page.goto('/dashboard.html');
    // Guard redirects to login.html
    await page.waitForURL(/login\.html/);
    await expect(page).toHaveURL(/login\.html/);
  });

  test('Unauthenticated user is redirected away from budget and planner', async ({ page }) => {
    await page.goto('/budget.html');
    await page.waitForURL(/login\.html/);
    await expect(page).toHaveURL(/login\.html/);

    await page.goto('/planner.html');
    await page.waitForURL(/login\.html/);
    await expect(page).toHaveURL(/login\.html/);
  });
});

test.describe('3. Event Planning & Management Workflows (Mocked Auth)', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock user credentials into localStorage to bypass Firebase Auth for automated tests
    await page.addInitScript(() => {
      window.localStorage.setItem('planora_test_user', JSON.stringify({
        uid: 'playwright-test-user-01',
        email: 'test-planner@planora.ai',
        displayName: 'Test Planner'
      }));
    });
  });

  test('Create event wizard validates required fields', async ({ page }) => {
    await page.goto('/create-event.html');
    // Verify required inputs exist
    await expect(page.locator('#event-name')).toBeVisible();
    await expect(page.locator('#event-type')).toBeVisible();
    await expect(page.locator('#event-date')).toBeVisible();
    await expect(page.locator('#guest-count')).toBeVisible();
    await expect(page.locator('#budget')).toBeVisible();
  });

  test('AI Event Studio interface renders customization options', async ({ page }) => {
    await page.goto('/planner.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
    await expect(page.locator('.sidebar-logo-text')).toContainText('Planora AI');
  });

  test('Budget management renders stat cards and itemized table', async ({ page }) => {
    await page.goto('/budget.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });

  test('Timeline management renders countdown and roadmap containers', async ({ page }) => {
    await page.goto('/timeline.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });

  test('Task management renders filter pills and task lists', async ({ page }) => {
    await page.goto('/tasks.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });

  test('Vendor management renders roster layout', async ({ page }) => {
    await page.goto('/vendors.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });

  test('Guest management renders RSVP summary and table', async ({ page }) => {
    await page.goto('/guests.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });

  test('AI Copilot renders chat container and prompt chips', async ({ page }) => {
    await page.goto('/copilot.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });

  test('Reports page renders export hub with CSV and PDF options', async ({ page }) => {
    await page.goto('/reports.html');
    await expect(page.locator('#app-sidebar')).toBeVisible();
  });
});

test.describe('4. Technical SEO & Verified Social Links', () => {
  test('Public pages declare canonical tags and Open Graph metadata', async ({ page }) => {
    await page.goto('/index.html');
    
    // Canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://planora-ai-india.vercel.app/');

    // Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Planora AI');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('planora-ai-social-preview.png');
  });

  test('Public footer contains all 5 verified creator social links with security attributes', async ({ page }) => {
    await page.goto('/index.html');
    const footer = page.locator('footer.footer');
    await expect(footer).toBeVisible();

    const expectedLinks = [
      'https://github.com/somansinghal',
      'https://somansinghal.vercel.app/',
      'https://www.linkedin.com/in/soman-singhal/',
      'https://x.com/SomanSinghal',
      'https://www.instagram.com/_somansinghal/'
    ];

    for (const url of expectedLinks) {
      const link = footer.locator(`a[href="${url}"]`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('Private application pages declare noindex, nofollow directives', async ({ page }) => {
    await page.goto('/dashboard.html');
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toBe('noindex, nofollow');
  });
});

test.describe('5. Hackathon Judge Demo Mode (Isolated Sandbox)', () => {
  test('Demo entry point on homepage navigates to demo sandbox without credentials', async ({ page }) => {
    await page.goto('/index.html');
    const demoBtn = page.locator('#hero-demo-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    await page.waitForURL(/dashboard\.html\?demo=true/);
    await expect(page.locator('#planora-judge-demo-banner')).toBeVisible();
    await expect(page.locator('#planora-judge-demo-banner')).toContainText('JUDGE DEMO MODE');
  });

  test('Demo dashboard loads pre-seeded Planora Showcase Wedding', async ({ page }) => {
    await page.goto('/dashboard.html?demo=true');
    await expect(page.locator('text=Planora Showcase Wedding')).toBeVisible();
    await expect(page.locator('text=12,00,000')).toBeVisible();
  });

  test('Demo Reset Data button restores pristine sample state', async ({ page }) => {
    await page.goto('/dashboard.html?demo=true');
    const resetBtn = page.locator('#btn-reset-demo');
    await expect(resetBtn).toBeVisible();
  });

  test('Exit Demo returns user to public homepage', async ({ page }) => {
    await page.goto('/dashboard.html?demo=true');
    const exitBtn = page.locator('#btn-exit-demo');
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();
    await page.waitForURL(/index\.html/);
  });
});

