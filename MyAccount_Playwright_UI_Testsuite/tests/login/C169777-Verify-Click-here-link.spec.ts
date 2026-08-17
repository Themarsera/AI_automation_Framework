// spec: test-plans/pre-login-banner.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../pages/LoginPage';
import { WhyCreateAccountPage } from '../pages/WhyCreateAccountPage';

test.describe('Pre-Login Banner', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('[C169777] Verify \'Click here\' link @critical', async ({ page }) => {
    test.setTimeout(120000);
    allure.feature('Login Banner');
    allure.story('Banner CTA navigates to Why Create Account page');
    allure.severity('critical');

    const loginPage = new LoginPage(page);
    const whyCreateAccountPage = new WhyCreateAccountPage(page);

    // 1. Navigate to login page and verify it has loaded
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
    await loginPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });

    // 2. Wait for banner visible and verify banner text contains "Why create an account?"
    await loginPage.banner.waitFor({ state: 'visible', timeout: 60000 });
    await expect(loginPage.banner).toBeVisible({ timeout: 60000 });
    await expect(loginPage.banner).toContainText('Why create an account?', { timeout: 60000 });

    // 3. Wait for bannerCta visible
    await loginPage.bannerCta.waitFor({ state: 'visible', timeout: 60000 });
    await expect(loginPage.bannerCta).toBeVisible({ timeout: 60000 });

    // 4. Click bannerCta via JavaScript (anchor has no href, uses Angular router)
    await loginPage.bannerCta.click();

    // 5. Wait for URL /login/whyCreateAccount and page to load
    await expect(page).toHaveURL(/\/login\/whyCreateAccount/, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    // 6. Wait for WhyCreateAccountPage heading visible
    await whyCreateAccountPage.pageHeading.waitFor({ state: 'visible', timeout: 60000 });

    // 7. Assert URL is /login/whyCreateAccount
    await expect(page).toHaveURL(/\/login\/whyCreateAccount/, { timeout: 60000 });

    // 8. Assert H2 heading "Why create an online account?" is visible
    await expect(whyCreateAccountPage.pageHeading).toBeVisible({ timeout: 60000 });

    // 9. Assert description text is visible
    await expect(whyCreateAccountPage.description).toBeVisible({ timeout: 60000 });

    // 10. Assert H3 "With an online account, you can:" is visible
    await expect(whyCreateAccountPage.benefitsHeading).toBeVisible({ timeout: 60000 });

    // 11. Assert all 6 list items are visible
    await expect(page.getByText('Download your plan documents')).toBeVisible({ timeout: 60000 });
    await expect(page.getByText('Make service requests')).toBeVisible({ timeout: 60000 });
    await expect(page.getByText('Track service requests')).toBeVisible({ timeout: 60000 });
    await expect(page.getByText('Manage your payments')).toBeVisible({ timeout: 60000 });
    await expect(page.getByText('Access member benefits')).toBeVisible({ timeout: 60000 });
    await expect(page.getByText('Update your information')).toBeVisible({ timeout: 60000 });

    // 12. Assert "Get started" and "Login" CTAs are visible
    await expect(whyCreateAccountPage.getStartedButton).toBeVisible({ timeout: 60000 });
    await whyCreateAccountPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await expect(whyCreateAccountPage.loginButton).toBeVisible({ timeout: 60000 });

    // 13. Click "Get started" and verify redirect to registration page
    await whyCreateAccountPage.getStartedButton.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/registration/, { timeout: 60000 });

    // 14. Go back and verify "Login" CTA redirects to the login page
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await whyCreateAccountPage.pageHeading.waitFor({ state: 'visible', timeout: 60000 });
    await whyCreateAccountPage.loginButton.waitFor({ state: 'visible', timeout: 60000 });
    await whyCreateAccountPage.loginButton.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });

    await page.context().close();
  });
});
