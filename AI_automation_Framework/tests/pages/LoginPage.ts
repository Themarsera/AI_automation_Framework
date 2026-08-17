// Page Object: LoginPage
// Covers the /login page — email/password form, error state, and pre-login banner

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

const WAIT = { state: 'visible' as const, timeout: 60000 };

export class LoginPage extends BasePage {
  readonly emailInput    = this.page.getByRole('textbox', { name: 'Email' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly loginButton   = this.page.getByRole('button', { name: 'Log in' });
  readonly errorAlert    = this.page.getByRole('alert').filter({ hasText: 'Wrong email or password' });
  readonly banner        = this.page.getByRole('alert').filter({ hasText: 'Why create an account' });
  readonly bannerCta     = this.page.getByRole('alert').filter({ hasText: 'Why create an account' }).locator('a');

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.loginButton.waitFor(WAIT);
  }

  async login(email: string, password: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.emailInput.waitFor(WAIT);
    await this.emailInput.fill(email);
    await this.passwordInput.waitFor(WAIT);
    await this.passwordInput.fill(password);
    await this.loginButton.waitFor(WAIT);
    await this.loginButton.click();
    // Caller is responsible for waiting on post-login navigation (OAuth redirect chain)
  }

  async assertOnLoginPage() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.loginButton.waitFor(WAIT);
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.loginButton).toBeVisible({ timeout: 60000 });
  }

  async assertErrorMessage(text: string) {
    await this.errorAlert.waitFor(WAIT);
    await expect(this.errorAlert).toBeVisible({ timeout: 60000 });
    await expect(this.errorAlert).toContainText(text, { timeout: 60000 });
  }
}
