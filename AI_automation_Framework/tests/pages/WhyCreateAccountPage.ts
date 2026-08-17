// Page Object: WhyCreateAccountPage
// Covers the /login/whyCreateAccount page — benefits overview with Get started and Login CTAs

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

const WAIT = { state: 'visible' as const, timeout: 60000 };

export class WhyCreateAccountPage extends BasePage {
  readonly pageHeading    = this.page.getByRole('heading', { name: 'Why create an online account?' });
  readonly description    = this.page.locator('p').filter({ hasText: 'It’s a convenient, secure way to access your home protection plan online.' });
  readonly benefitsHeading = this.page.getByRole('heading', { name: 'With an online account, you can:' });
  readonly getStartedButton = this.page.getByRole('button', { name: 'Get started' });
  readonly loginButton    = this.page.getByRole('button', { name: 'Login' });

  constructor(page: Page) {
    super(page);
  }

  async assertOnPage() {
    await this.pageHeading.waitFor(WAIT);
    await expect(this.page).toHaveURL(/\/login\/whyCreateAccount/, { timeout: 60000 });
    await expect(this.pageHeading).toBeVisible({ timeout: 60000 });
    await expect(this.description).toBeVisible({ timeout: 60000 });
    await expect(this.benefitsHeading).toBeVisible({ timeout: 60000 });
    await expect(this.getStartedButton).toBeVisible({ timeout: 60000 });
    await expect(this.loginButton).toBeVisible({ timeout: 60000 });
  }
}
