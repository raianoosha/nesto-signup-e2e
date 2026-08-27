import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /*
   * Always single-worker: recon showed the QA account-creation endpoint
   * (POST /api/accounts) throttles rapid repeat requests from the same IP -
   * back-to-back signups across parallel workers reliably time out, while
   * the same requests spaced out over a single worker succeed. See README
   * "Known environment behavior".
   */
  workers: 1,
  /*
   * A few fields (e.g. the password input) were observed to register their
   * aria-invalid state slightly slower than others after submit - bump the
   * default expect() polling window a bit past Playwright's 5s default.
   */
  expect: { timeout: 10_000 },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tools/playwright-report', open: 'never' }],
    ...(process.env.CI ? [['junit', { outputFile: 'tools/test-results/junit.xml' }] as const] : []),
  ],
  outputDir: 'tools/test-results',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL ?? 'https://app.qa.nesto.ca',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
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
  ],
});
