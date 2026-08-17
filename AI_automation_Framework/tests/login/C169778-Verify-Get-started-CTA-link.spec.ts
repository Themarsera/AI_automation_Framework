// spec: test-plans/pre-login-banner.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { WhyCreateAccountPage } from '../pages/WhyCreateAccountPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Pre-Login Banner - Why Create Account Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login/whyCreateAccount');
    await page.waitForLoadState('domcontentloaded');
  });

  test('[C169778] Verify "Get started" CTA redirects to registration page @critical', async ({ page }) => {
    test.setTimeout(120000);
    allure.feature('Login Banner');
    allure.story('Get started CTA navigates to registration page');
    allure.severity('critical');

    const whyCreateAccountPage = new WhyCreateAccountPage(page);

    // 1. Wait for page heading visible
    await whyCreateAccountPage.pageHeading.waitFor({ state: 'visible', timeout: 60000 });
    await expect(whyCreateAccountPage.pageHeading).toBeVisible({ timeout: 60000 });

    // 2. Assert "Get started" button is visible
    await whyCreateAccountPage.getStartedButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(whyCreateAccountPage.getStartedButton).toBeVisible({ timeout: 60000 });

    // 3. Click "Get started" and verify redirect to registration page
    await whyCreateAccountPage.getStartedButton.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/registration/, { timeout: 60000 });

    await page.context().close();
  });

  test('[C169778b] Verify "Login" CTA redirects to login page @critical', async ({ page }) => {
    test.setTimeout(120000);
    allure.feature('Login Banner');
    allure.story('Login CTA on Why Create Account page navigates back to login');
    allure.severity('critical');

    const whyCreateAccountPage = new WhyCreateAccountPage(page);
    const loginPage = new LoginPage(page);

    // 1. Wait for page heading visible
    await whyCreateAccountPage.pageHeading.waitFor({ state: 'visible', timeout: 60000 });
    await expect(whyCreateAccountPage.pageHeading).toBeVisible({ timeout: 60000 });

    // 2. Assert "Login" button is visible
    await whyCreateAccountPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(whyCreateAccountPage.loginButton).toBeVisible({ timeout: 60000 });

    // 3. Click "Login" and verify redirect to login page
    await whyCreateAccountPage.loginButton.click();
    await page.waitForLoadState('domcontentloaded');
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
    await expect(loginPage.loginButton).toBeVisible({ timeout: 60000 });

    await page.context().close();
  });
});
