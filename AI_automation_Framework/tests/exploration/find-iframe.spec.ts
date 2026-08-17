/* eslint-disable playwright/no-wait-for-timeout, playwright/no-useless-await */
import { test } from '@playwright/test';
import { getTestCredentials } from '../testCredentials';

test('Find iframe with login form', async ({ page }) => {
  await page.goto('https://myaccount-ui.qa.cinchhs.com');
  await page.waitForLoadState('domcontentloaded');

  console.log('\n🔍 Checking for iframes...');
  
  // Get all iframes
  const iframes = await page.locator('iframe').all();
  console.log(`Found ${iframes.length} iframes`);

  for (let i = 0; i < iframes.length; i++) {
    const title = await iframes[i].getAttribute('title');
    const src = await iframes[i].getAttribute('src');
    const id = await iframes[i].getAttribute('id');
    const name = await iframes[i].getAttribute('name');
    console.log(`  Iframe ${i}: title="${title}" src="${src}" id="${id}" name="${name}"`);
  }

  // Check for form elements
  const forms = await page.locator('form').all();
  console.log(`\nFound ${forms.length} forms`);

  // Try to find inputs in main page
  const mainInputs = await page.locator('input').all();
  console.log(`Main page inputs: ${mainInputs.length}`);

  // Check body content
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\n📄 Checking body for login elements...');
  
  if (bodyHTML.includes('textbox')) {
    console.log('✓ Found textbox in body');
  }
  if (bodyHTML.includes('input type')) {
    console.log('✓ Found input elements in body');
  }
  if (bodyHTML.includes('iframe')) {
    console.log('✓ Found iframes in body');
  }

  // Try frameLocator approach
  const allFrameLocators = page.frames();
  console.log(`\nTotal frames in page: ${allFrameLocators.length}`);
  
  for (const frame of allFrameLocators) {
    const frameInputs = await frame.locator('input').all();
    if (frameInputs.length > 0) {
      console.log(`Frame has ${frameInputs.length} inputs!`);
      
      // Try to fill in this frame
      if (frameInputs.length >= 2) {
        const creds = getTestCredentials();
        if (!creds) throw new Error('Test credentials not found.');
        console.log('✓ Found email and password inputs in frame!');
        console.log('Filling credentials...');

        await frameInputs[0].fill(creds.user);
        await frameInputs[1].fill(creds.pass);
        
        console.log('✓ Credentials filled');
        
        // Find and click button in frame
        const btn = await frame.locator('button:has-text("Log in")').first();
        if (await btn.isVisible().catch(() => false)) {
          console.log('Clicking login button...');
          await btn.click();
          await page.waitForTimeout(3000);
          console.log(`URL after click: ${page.url()}`);
        }
      }
    }
  }
});
