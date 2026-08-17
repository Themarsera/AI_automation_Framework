// spec: test-plans/home-page-login.md
// seed: tests/seed.spec.ts

import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

const credentials = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../test-credentials.json'), 'utf-8')
);

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('[C169781] Login with Correct Credentials @critical @e2e', async ({ page }) => {
    test.setTimeout(120000);
    allure.feature('Login');
    allure.story('Login with correct credentials');
    allure.severity('critical');

    const loginPage   = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Verify login page elements are fully loaded
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
    await loginPage.emailInput.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.passwordInput.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(loginPage.emailInput).toBeVisible({ timeout: 60000 });
    await expect(loginPage.passwordInput).toBeVisible({ timeout: 60000 });
    await expect(loginPage.loginButton).toBeVisible({ timeout: 60000 });

    // 2. Fill email
    await loginPage.emailInput.fill(credentials.user);

    // 3. Fill password
    await loginPage.passwordInput.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.passwordInput.fill(credentials.pass);

    // 4. Click Log in and wait for dashboard landmark element (OAuth redirect may skip /dashboard URL)
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await loginPage.loginButton.click();
    await dashboardPage.myPlansHeading.waitFor({ state: 'visible', timeout: 90000 });
    await page.waitForLoadState('domcontentloaded');

    // 5. Verify dashboard fully loaded
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
    await expect(dashboardPage.myPlansHeading).toBeVisible({ timeout: 60000 });
    await dashboardPage.addAPlanButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(dashboardPage.addAPlanButton).toBeVisible({ timeout: 60000 });

    // 6. Logout and verify back on login page
    await dashboardPage.logout();
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });

    await page.context().close();
  });
});
