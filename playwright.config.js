// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 45000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [
    ['html', { outputFolder: 'artifacts/reports/playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://planora-ai-india.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Tablet iPad',
      use: { ...devices['iPad Pro 11'], viewport: { width: 834, height: 1194 } },
    },
    {
      name: 'Mobile iPhone',
      use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: process.env.USE_LOCAL_SERVER ? [
    {
      command: 'python3 -m http.server 3000',
      port: 3000,
      reuseExistingServer: true,
      timeout: 10000,
    },
    {
      command: 'cd backend && python3 -m uvicorn app.main:app --port 8000',
      port: 8000,
      reuseExistingServer: true,
      timeout: 10000,
    }
  ] : undefined,
});
