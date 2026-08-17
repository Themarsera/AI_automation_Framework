/* eslint-disable playwright/no-wait-for-timeout */
import { test } from '@playwright/test';
import { getTestCredentials } from '../testCredentials';

test('Fix login - grab and use exact locators', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://myaccount-ui.qa.cinchhs.com');
  await page.waitForLoadState('domcontentloaded');

  // Get page snapshot to see exact structure
  const snapshot = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const result: Array<{idx: number; type: string; name: string; id: string; placeholder: string; 'data-testid': string | null; selector: string}> = [];
    inputs.forEach((input, idx) => {
      result.push({
        idx,
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        'data-testid': input.getAttribute('data-testid'),
        selector: `input:nth-of-type(${idx + 1})`
      });
    });
    return result;
  });

  console.log('\n📋 Found Input Fields:');
  console.log(JSON.stringify(snapshot, null, 2));

  // Get all inputs
  const emailInputs = await page.locator('textbox').all();
  console.log(`\nFound ${emailInputs.length} textbox elements`);

  // Try direct approach - get all input elements and list them
  const allInputs = await page.locator('input').all();
  console.log(`Found ${allInputs.length} total inputs`);

  const creds = getTestCredentials();
  if (!creds) throw new Error('Test credentials not found.');

  // The first input should be email, second is password based on login form structure
  if (allInputs.length >= 2) {
    console.log('\n🔐 Entering credentials...');

    // First input = email
    const emailField = allInputs[0];
    console.log('Filling first input (email)...');
    await emailField.fill(creds.user);
    const emailValue = await emailField.inputValue();
    console.log(`Email input now contains: ${emailValue}`);

    // Second input = password
    const passwordField = allInputs[1];
    console.log('Filling second input (password)...');
    await passwordField.fill(creds.pass);
    const passwordValue = await passwordField.inputValue();
    console.log(`Password input now contains: ${passwordValue.replace(/./g, '*')}`);

    // Find and click login button
    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons`);

    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  Button ${i}: "${text}"`);
    }

    // Click the "Log in" button
    const loginButton = page.locator('button:has-text("Log in")').first();
    console.log('\nClicking Log in button...');
    await loginButton.click();

    // Wait for navigation
    await page.waitForTimeout(3000);
    const newUrl = page.url();
    console.log(`New URL after login: ${newUrl}`);

    if (newUrl.includes('error')) {
      throw new Error(`Login failed: ${newUrl}`);
    }

    console.log('✅ Successfully past login page!');
  }
});
