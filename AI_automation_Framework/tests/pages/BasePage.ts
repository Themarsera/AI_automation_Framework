import type { Page } from '@playwright/test';
import { test } from '../../fixtures/base.fixture';
import { logger } from '../../utils/logger';

/**
 * Thin base for MyAccount page objects. Subclasses use native Playwright APIs
 * (`page.locator()`, `page.goto()`, `expect`) directly — no Selenium-style wrappers.
 * `step()` is the only helper, used for Allure/HTML report grouping.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async step<T>(actionName: string, action: () => Promise<T>): Promise<T> {
    return test.step(actionName, async () => {
      try {
        logger.debug({ step: actionName }, actionName);
        return await action();
      } catch (error) {
        logger.error({ step: actionName, err: (error as Error).message }, `step failed: ${actionName}`);
        throw error;
      }
    });
  }
}
