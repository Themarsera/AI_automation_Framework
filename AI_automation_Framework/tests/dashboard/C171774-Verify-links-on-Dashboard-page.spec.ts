// spec: test-plans/home-page-login.md
// seed: tests/seed.spec.ts

import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PaymentsPage } from '../pages/PaymentsPage';

const credentials = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../test-credentials.json'), 'utf-8')
);

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test("[C171774] Verify 'Add a plan' and 'Payments' links on Dashboard page @e2e", async ({ page }) => {
    test.setTimeout(120000);
    allure.feature('Dashboard');
    allure.story("Dashboard 'Add a plan' and 'Payments' navigation links");
    allure.severity('normal');

    const loginPage     = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const paymentsPage  = new PaymentsPage(page);

    // 1. Login and wait for dashboard landmark element (OAuth redirect may skip /dashboard URL)
    await loginPage.login(credentials.user, credentials.pass);
    await dashboardPage.myPlansHeading.waitFor({ state: 'visible', timeout: 90000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
    await dashboardPage.addAPlanButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(dashboardPage.addAPlanButton).toBeVisible({ timeout: 60000 });
    await dashboardPage.menuButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(dashboardPage.menuButton).toBeVisible({ timeout: 60000 });

    // 2. Click 'Add a plan' and verify /dashboard/linkPlan loads
    await dashboardPage.addAPlanButton.click();
    await page.waitForURL(/\/dashboard\/linkPlan/, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.getByText("Let's locate your plan").first().waitFor({ state: 'visible', timeout: 60000 });
    await expect(page.getByText("Let's locate your plan").first()).toBeVisible({ timeout: 60000 });

    // 3. Click 'Back' and wait for dashboard to reload
    const backButton = page.getByRole('button', { name: 'Back' });
    await backButton.waitFor({ state: 'visible', timeout: 60000 });
    await backButton.click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await dashboardPage.myPlansHeading.waitFor({ state: 'visible', timeout: 60000 });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
    await dashboardPage.addAPlanButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(dashboardPage.addAPlanButton).toBeVisible({ timeout: 60000 });

    // 4. Open hamburger menu and wait for drawer to fully open
    await dashboardPage.menuButton.waitFor({ state: 'visible', timeout: 60000 });
    await dashboardPage.menuButton.click();
    await dashboardPage.paymentsLinkInDrawer.waitFor({ state: 'visible', timeout: 60000 });
    await expect(dashboardPage.paymentsLinkInDrawer).toBeVisible({ timeout: 60000 });

    // 5. Click Payments and wait for /payments to fully load
    await dashboardPage.paymentsLinkInDrawer.click();
    await page.waitForURL(/\/payments/, { timeout: 90000 });
    await page.waitForLoadState('domcontentloaded');
    await paymentsPage.assertOnPaymentsPage();

    // 6. Go back to dashboard and wait for it to reload
    await page.goBack();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await dashboardPage.myPlansHeading.waitFor({ state: 'visible', timeout: 60000 });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

    // 7. Logout and verify back on login page
    await dashboardPage.logout();
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });

    await page.context().close();
  });
});
