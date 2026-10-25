// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/playwright',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
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
  webServer: [
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
  ],
});
