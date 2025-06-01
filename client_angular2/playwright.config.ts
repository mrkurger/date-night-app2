// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for client_angular2 frontend testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [['html'], ['line']],

  // Global timeout for all tests
  timeout: 30000,

  // Capture screenshot and trace on test failure
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',

    // Browser viewport - responsive breakpoints
    viewport: { width: 1280, height: 720 },

    // Video recording configuration
    video: 'on-first-retry',

    // Automatically wait for actions to complete
    actionTimeout: 10000,

    // Accept permissions automatically
    permissions: ['geolocation', 'notifications'],
  },

  // Configure projects for different browsers and modes
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },

    // Vision mode for visual testing
    {
      name: 'vision-mode',
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        video: 'on',
      },
    },
  ],

  // Run local dev server before tests if needed with port fallback
  webServer: {
    command: 'node scripts/start-dev-server.js',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120 * 1000, // 2 minutes timeout for server startup
    env: Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => value !== undefined),
    ) as Record<string, string>,
  },
});
