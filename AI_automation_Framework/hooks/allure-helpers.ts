import type { Page } from '@playwright/test';
import { attachment, epic, feature, label, step } from 'allure-js-commons';

import {
  inferFailureCategory,
  type FailureCategory,
} from '../utils/allure/failure-category';

/** Apply Allure epic/feature labels at the start of a test (replaces testInfo annotations). */
export async function setAllureMetadata(epicName: string, featureName: string): Promise<void> {
  await epic(epicName);
  await feature(featureName);
}

/** Log an informational message as an Allure step (replaces logger.info in specs). */
export async function allureLog(message: string, details?: Record<string, unknown>): Promise<void> {
  const stepMessage =
    details && Object.keys(details).length > 0
      ? `${message} — ${JSON.stringify(details)}`
      : message;
  await step(stepMessage, async () => {});
}

/** Wrap an action in a named Allure step. */
export async function allureStep(name: string, body: () => Promise<void>): Promise<void> {
  await step(name, body);
}

/** Attach a viewport screenshot to the Allure report. */
export async function attachScreenshot(page: Page, name = 'Screenshot'): Promise<void> {
  const screenshot = await page.screenshot();
  await attachment(name, screenshot, 'image/png');
}

/** Attach a full-page screenshot to the Allure report. */
export async function attachFullPageScreenshot(
  page: Page,
  name = 'Full Page Screenshot'
): Promise<void> {
  const screenshot = await page.screenshot({ fullPage: true });
  await attachment(name, screenshot, 'image/png');
}

/** Label a failed test with an inferred or explicit failure category for Allure filtering. */
export async function labelFailureCategory(
  error: unknown,
  category?: FailureCategory
): Promise<void> {
  await label('failureCategory', category ?? inferFailureCategory(error));
}
