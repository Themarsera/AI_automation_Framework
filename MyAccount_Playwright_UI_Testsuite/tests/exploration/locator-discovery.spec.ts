/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '@playwright/test';
import { getTestCredentials } from '../testCredentials';

test.describe('Locator Discovery - Service Request Flow', () => {
  test('Discover locators for Browse Category and Appliance selection', async ({ page }) => {
    console.log('\n🔍 STEP 1: Navigate to Login Page');
    await page.goto('https://myaccount-ui.qa.cinchhs.com');
    await page.waitForLoadState('domcontentloaded');
    console.log('✓ Login page loaded');

    // Capture login page structure
    console.log('\n📸 Login Page Snapshot:');
    const _loginSnapshot = await page.locator('body').evaluate(el => el.innerHTML).catch(() => 'N/A');
    console.log('Login page loaded successfully');

    const creds = getTestCredentials();
    if (!creds) throw new Error('Test credentials not found.');

    console.log('\n🔍 STEP 2: Login with correct credentials');
    // Find and fill email field
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(creds.user);
    console.log('✓ Email entered');

    // Find and fill password field
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(creds.pass);
    console.log('✓ Password entered');

    // Find and click login button
    const loginButton = page.locator('button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login")').first();
    await loginButton.click();
    await page.waitForLoadState('domcontentloaded');
    console.log('✓ Logged in successfully');

    console.log('\n🔍 STEP 3: Navigate to Request Service');
    // Wait for dashboard to load
    await page.waitForTimeout(2000);

    // Look for service request navigation
    const serviceNav = page.locator('a:has-text("Service"), a:has-text("Request"), button:has-text("Service"), button:has-text("Request")').first();
    if (await serviceNav.isVisible()) {
      await serviceNav.click();
      await page.waitForLoadState('domcontentloaded');
      console.log('✓ Service request page navigated');
    } else {
      console.log('⚠ Service navigation not found, checking page structure...');
    }

    console.log('\n📋 Current Page Structure:');
    const pageTitle = await page.title();
    const url = page.url();
    console.log(`Page Title: ${pageTitle}`);
    console.log(`URL: ${url}`);

    console.log('\n🔍 STEP 4: Discover Browse Category Element');
    // Look for category browse/expand options
    const browseButtons = await page.locator('button:has-text("Browse"), button:has-text("Category"), button:has-text("Expand"), div:has-text("Browse Category")').all();
    const categorySelectors = await page.locator('[data-testid*="category"], .category, .browse').all();

    console.log(`Found ${browseButtons.length} potential browse buttons`);
    console.log(`Found ${categorySelectors.length} potential category elements`);

    // Get all visible buttons and links on the page
    const allButtons = await page.locator('button').all();
    console.log(`\nTotal buttons on page: ${allButtons.length}`);
    for (let i = 0; i < Math.min(15, allButtons.length); i++) {
      const text = await allButtons[i].textContent();
      const testId = await allButtons[i].getAttribute('data-testid');
      const className = await allButtons[i].getAttribute('class');
      console.log(`Button ${i}: "${text?.trim()}" | data-testid: ${testId} | class: ${className}`);
    }

    // Look for collapsible/expandable elements
    console.log('\n🔍 Checking for expandable category sections:');
    const expandableElements = await page.locator('[role="button"], [role="tab"], [aria-expanded]').all();
    console.log(`Found ${expandableElements.length} expandable elements`);

    for (let i = 0; i < Math.min(10, expandableElements.length); i++) {
      const text = await expandableElements[i].textContent();
      const ariaExpanded = await expandableElements[i].getAttribute('aria-expanded');
      const dataTestId = await expandableElements[i].getAttribute('data-testid');
      console.log(`Expandable ${i}: "${text?.trim()}" | aria-expanded: ${ariaExpanded} | data-testid: ${dataTestId}`);
    }

    console.log('\n🔍 STEP 5: Look for Appliance Category');
    const applianceElements = await page.locator('text=Appliance, button:has-text("Appliance"), a:has-text("Appliance"), [data-testid*="appliance"]').all();
    console.log(`Found ${applianceElements.length} Appliance elements`);

    console.log('\n📸 Full Page Snapshot (for analysis):');
    // Get full accessibility tree
    const snapshot = await page.locator('body').evaluate(el => {
      const walk = (node: Element, depth = 0): string => {
        if (depth > 4) return '';
        const indent = '  '.repeat(depth);
        const tag = node.tagName?.toLowerCase() || 'text';
        const testId = node.getAttribute?.('data-testid') || '';
        const id = node.getAttribute?.('id') || '';
        const className = node.getAttribute?.('class') || '';
        const text = node.textContent?.slice(0, 50) || '';
        const attrs = [testId ? `data-testid="${testId}"` : '', id ? `id="${id}"` : '', className ? `class="${className.slice(0, 30)}"` : ''].filter(Boolean).join(' ');

        let result = `${indent}<${tag} ${attrs}>\n`;
        if (node.children?.length > 0) {
          for (const child of node.children) {
            result += walk(child, depth + 1);
          }
        } else if (text && !node.children?.length) {
          result += `${indent}  ${text}\n`;
        }
        return result;
      };
      return walk(el);
    });
    console.log(snapshot);

    console.log('\n✅ Locator Discovery Complete - Check console output above for locator details');

    // Take final screenshot
    await page.screenshot({ path: 'discovery-screenshot.png' });
    console.log('Screenshot saved: discovery-screenshot.png');
  });
});
