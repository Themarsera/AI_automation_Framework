import { epic, feature } from 'allure-js-commons';
import type { TestInfo } from '@playwright/test';

/**
 * @deprecated Use setAllureMetadata() from hooks/allure-helpers.ts instead.
 * Kept for backward compatibility — writes Allure labels via allure-js-commons.
 */
export async function annotateEpic(_testInfo: TestInfo, epicName: string): Promise<void> {
  await epic(epicName);
}

/**
 * @deprecated Use setAllureMetadata() from hooks/allure-helpers.ts instead.
 */
export async function annotateFeature(_testInfo: TestInfo, featureName: string): Promise<void> {
  await feature(featureName);
}
