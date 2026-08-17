import type { Locator, Page } from '@playwright/test';

/**
 * Base for reusable UI pieces (panels, dialogs, headers).
 * Compose locators relative to `root` using native Playwright APIs.
 */
export abstract class BaseComponent {
  protected constructor(
    readonly page: Page,
    readonly root: Locator
  ) {}

  scoped(cssOrTextSelector: string): Locator {
    return this.root.locator(cssOrTextSelector);
  }
}
