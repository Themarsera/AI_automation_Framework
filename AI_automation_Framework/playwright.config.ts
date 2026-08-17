import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { loadConfig } from './config';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const appConfig = loadConfig();
const isCi = !!process.env.CI;
const tagGrep = (() => {
  const raw = process.env.PLAYWRIGHT_TAG?.trim();
  if (!raw || raw.toLowerCase() === 'all') { return undefined; }
  const tag = raw.startsWith('@') ? raw : `@${raw}`;
  return new RegExp(tag);
})();
const tagGrepInvert = (() => {
  const raw = process.env.PLAYWRIGHT_TAG?.trim();
  const tag = raw?.startsWith('@') ? raw : raw ? `@${raw}` : '';
  // @regression runs exclude @integration-only specs.
  if (tag === '@regression') {
    return /@integration/;
  }
  return undefined;
})();

export default defineConfig({
  testDir: './tests',
  /** Global test timeout — 10 minutes for full E2E flows. */
  timeout: 600_000,
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 1,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : isCi ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report', open: 'on-failure' }],
    ['list'],
    [
      'allure-playwright',
      {
        detail: false,
        outputFolder: 'allure-results',
        suiteTitle: false,
      },
    ],
  ],
  use: {
    baseURL: process.env.WEB_BASE_URL ?? appConfig.webBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    /** Set PW_IGNORE_HTTPS_ERRORS=1 when corporate SSL inspection breaks API TLS. */
    ignoreHTTPSErrors: process.env.PW_IGNORE_HTTPS_ERRORS === '1',
    testIdAttribute: 'data-autoid',
  },
  grep: tagGrep,
  grepInvert: tagGrepInvert,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  outputDir: 'reports/test-results',
});
