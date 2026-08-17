import { test } from '@playwright/test';
import { getTestCredentials } from '../testCredentials';

test.describe('Simple Locator Discovery', () => {
  test('Navigate and capture locators', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    const creds = getTestCredentials();
    if (!creds) throw new Error('Test credentials not found.');

    console.log('\n=== STEP 1: Login ===');
    await page.goto('https://myaccount-ui.qa.cinchhs.com');

    // Fill and submit login form
    await page.fill('input[type="email"]', creds.user);
    console.log('✓ Email filled');

    await page.fill('input[type="password"]', creds.pass);
    console.log('✓ Password filled');

    await page.click('button:has-text("Log in")');
    console.log('✓ Login clicked');

    // Wait for navigation
    await page.waitForNavigation({ timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    console.log('✓ Logged in and dashboard loaded');

    console.log('\n=== STEP 2: Take Dashboard Screenshot ===');
    await page.screenshot({ path: 'dashboard.png' });
    console.log('✓ Screenshot: dashboard.png');

    console.log('\n=== STEP 3: Find Service Request Navigation ===');
    const links = await page.locator('a, button').all();
    console.log(`Total clickable elements: ${links.length}`);

    for (let i = 0; i < Math.min(20, links.length); i++) {
      const text = await links[i].textContent();
      const testId = await links[i].getAttribute('data-testid');
      const href = await links[i].getAttribute('href');
      if (text?.trim()) {
        console.log(`  [${i}] "${text.trim()}" | data-testid: ${testId || 'N/A'} | href: ${href || 'N/A'}`);
      }
    }

    console.log('\n=== STEP 4: Look for Service/Request Navigation ===');
    try {
      // Try different selectors for service request navigation
      const serviceLink = page.locator('a:has-text("Request Service"), button:has-text("Request Service"), [data-testid*="request"]').first();
      if (await serviceLink.isVisible({ timeout: 5000 })) {
        console.log('✓ Found service link, clicking...');
        await serviceLink.click();
        await page.waitForNavigation({ timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
        console.log('✓ Service page loaded');
      } else {
        console.log('⚠ Service link not found, looking for menu...');
      }
    } catch (e) {
      console.log(`⚠ Error finding service link: ${(e as Error).message}`);
    }

    console.log('\n=== STEP 5: Service Request Page Screenshot ===');
    await page.screenshot({ path: 'service-page.png' });
    console.log('✓ Screenshot: service-page.png');

    console.log('\n=== STEP 6: Analyze Service Page Elements ===');
    const _pageContent = await page.content();

    // Look for category-related elements
    const categoryElements = await page.locator('[data-testid*="category"], .category, .browse, [role="button"]').all();
    console.log(`\nFound ${categoryElements.length} potential category elements:`);

    for (let i = 0; i < Math.min(15, categoryElements.length); i++) {
      const text = await categoryElements[i].textContent();
      const testId = await categoryElements[i].getAttribute('data-testid');
      const className = await categoryElements[i].getAttribute('class');
      const ariaExpanded = await categoryElements[i].getAttribute('aria-expanded');

      if (text?.trim()) {
        console.log(`  [${i}] "${text.trim().slice(0, 40)}"
        - data-testid: ${testId || 'N/A'}
        - class: ${className?.slice(0, 50) || 'N/A'}
        - aria-expanded: ${ariaExpanded || 'N/A'}`);
      }
    }

    console.log('\n=== STEP 7: Look for Browse Category Button ===');
    const browseElements = await page.locator('text=Browse').all();
    console.log(`Found ${browseElements.length} elements with "Browse" text`);

    if (browseElements.length > 0) {
      for (let i = 0; i < browseElements.length; i++) {
        const text = await browseElements[i].textContent();
        const tag = await browseElements[i].evaluate(el => el.tagName);
        const testId = await browseElements[i].getAttribute('data-testid');
        console.log(`  [${i}] <${tag}> "${text?.trim()}" | data-testid: ${testId || 'N/A'}`);
      }
    }

    console.log('\n=== STEP 8: Look for Appliance Category ===');
    const applianceElements = await page.locator('text=Appliance').all();
    console.log(`Found ${applianceElements.length} elements with "Appliance" text`);

    if (applianceElements.length > 0) {
      for (let i = 0; i < applianceElements.length; i++) {
        const text = await applianceElements[i].textContent();
        const tag = await applianceElements[i].evaluate(el => el.tagName);
        const testId = await applianceElements[i].getAttribute('data-testid');
        const id = await applianceElements[i].getAttribute('id');
        console.log(`  [${i}] <${tag}> "${text?.trim()}" | data-testid: ${testId || 'N/A'} | id: ${id || 'N/A'}`);
      }
    }

    console.log('\n=== DISCOVERY COMPLETE ===');
    console.log('Check screenshots: dashboard.png, service-page.png');
  });
});
