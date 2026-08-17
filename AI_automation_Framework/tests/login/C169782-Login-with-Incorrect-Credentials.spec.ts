// spec: test-plans/home-page-login.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('[C169782] Login with Incorrect Credentials @critical', async ({ page }) => {
    test.setTimeout(120000);
    allure.feature('Login');
    allure.story('Login with incorrect credentials shows error');
    allure.severity('critical');

    const loginPage = new LoginPage(page);

    // 1. Verify login page fully loaded
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
    await loginPage.emailInput.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.passwordInput.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(loginPage.emailInput).toBeVisible({ timeout: 60000 });
    await expect(loginPage.passwordInput).toBeVisible({ timeout: 60000 });
    await expect(loginPage.loginButton).toBeVisible({ timeout: 60000 });

    // 2. Fill wrong email
    await loginPage.emailInput.fill('wrong@test.com');

    // 3. Fill wrong password
    await loginPage.passwordInput.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.passwordInput.fill('WrongPass123');

    // 4. Click Log in
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.loginButton.click();

    // 5. Wait for error alert to appear (API response may take time)
    await loginPage.errorAlert.waitFor({ state: 'visible', timeout: 60000 });
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 60000 });
    await expect(loginPage.errorAlert).toContainText('Wrong email or password.', { timeout: 60000 });

    // 6. Confirm still on login page
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });

    await page.context().close();
  });
});
