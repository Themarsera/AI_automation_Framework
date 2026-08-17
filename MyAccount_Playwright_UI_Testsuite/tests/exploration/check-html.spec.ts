/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '@playwright/test';
import { getTestCredentials } from '../testCredentials';

test('Check actual HTML structure', async ({ page }) => {
  await page.goto('https://myaccount-ui.qa.cinchhs.com');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Get the full HTML
  const html = await page.content();
  
  // Look for email input patterns
  const hasEmailType = html.includes('type="email"');
  const hasPasswordType = html.includes('type="password"');
  const hasTextbox = html.includes('role="textbox"');
  const hasSearchbox = html.includes('role="searchbox"');
  
  console.log('\n📄 HTML Analysis:');
  console.log(`  type="email": ${hasEmailType}`);
  console.log(`  type="password": ${hasPasswordType}`);
  console.log(`  role="textbox": ${hasTextbox}`);
  console.log(`  role="searchbox": ${hasSearchbox}`);

  // Try to find all interactive elements
  const allInteractive = await page.locator('[role="textbox"], [role="searchbox"], input, textarea').all();
  console.log(`\nTotal interactive elements: ${allInteractive.length}`);

  // List them
  for (let i = 0; i < allInteractive.length && i < 10; i++) {
    const elem = allInteractive[i];
    const role = await elem.getAttribute('role');
    const type = await elem.getAttribute('type');
    const placeholder = await elem.getAttribute('placeholder');
    const ariaLabel = await elem.getAttribute('aria-label');
    console.log(`  ${i}: role="${role}" type="${type}" placeholder="${placeholder}" aria-label="${ariaLabel}"`);
  }

  // Try clicking on first visible element that looks like an input
  const firstInteractive = allInteractive[0];
  const creds = getTestCredentials();
  if (!creds) throw new Error('Test credentials not found.');

  if (firstInteractive) {
    console.log('\n🎯 Trying to interact with first element...');
    await firstInteractive.click();
    await page.waitForTimeout(500);

    // Type the email
    await page.keyboard.type(creds.user, { delay: 50 });
    console.log('✓ Typed email');

    // Tab to next field
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Type password
    await page.keyboard.type(creds.pass, { delay: 50 });
    console.log('✓ Typed password');

    // Tab to button and press Enter
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    console.log('✓ Pressed Enter (login)');

    await page.waitForTimeout(3000);
    console.log(`Final URL: ${page.url()}`);
  }
});
