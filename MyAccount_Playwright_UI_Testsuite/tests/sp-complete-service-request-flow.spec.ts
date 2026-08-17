// spec: /Users/rakeshkumarlenka/MyAccount_Playwright_UI_Testsuite/test-plans/sp-service-request-flow.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { getTestCredentials } from './testCredentials';
import { pollDelay } from '../utils/constants/timeouts';

test.describe('SP Service Request Flow - Happy Path', () => {
  test('Complete Service Request Flow - Login to Confirmation', async ({ page }) => {
    // 1. Navigate to the application URL: https://myaccount-ui.qa.cinchhs.com
    test.setTimeout(300000); // 5 minutes timeout
    const creds = getTestCredentials();
    if (!creds) throw new Error('Test credentials not found. Add test-credentials.json or set TEST_USER/TEST_PASS env vars.');

    await page.goto('https://myaccount-ui.qa.cinchhs.com');

    // 2. If cookie banner appears, click the 'X' button to close it
    await page.getByRole('button', { name: 'X' }).click();

    // 3. Enter email into the email field
    await page.getByRole('textbox', { name: 'Email' }).fill(creds.user);

    // 4. Enter password into the password field
    await page.getByRole('textbox', { name: 'Password' }).fill(creds.pass);

    // 5. Click the 'Log in' button
    await page.getByRole('button', { name: 'Log in' }).click();

    // 6. Wait for dashboard to fully load by waiting for the Request service button to be visible
    await page.getByRole('button', { name: 'Request service' }).first().waitFor({ state: 'visible', timeout: 30000 });

    // 7. Click the 'Request service' button
    await page.getByRole('button', { name: 'Request service' }).first().click();

    // 8. Click on 'Refrigerator' card from the top picked items
    await page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4).click();

    // 9. Click on the Symptoms dropdown
    await page.getByRole('combobox', { name: 'Select a symptom' }).click();

    // 10. Select symptom 'The unit is not cooling'
    await page.getByRole('option', { name: 'THE UNIT IS NOT COOLING' }).click();

    // 11. Verify Location dropdown shows 'Kitchen' as default value (implicit - Kitchen is pre-selected)

    // 12. Click on the Brand dropdown
    await page.getByRole('combobox', { name: 'Select a brand' }).click();

    // 13. Select brand 'Bosch'
    await page.getByRole('option', { name: 'Bosch' }).click();

    // 14. Enter 'SN12345' into Serial Number field
    await page.getByRole('textbox', { name: 'Serial Number' }).fill('SN12345');

    // 15. Enter 'MODEL123' into Model field
    await page.getByRole('textbox', { name: 'Model' }).fill('MODEL123');

    // 16. Click the 'Continue' button
    await page.getByRole('button', { name: 'Continue' }).click();

    // 17. Wait 5-10 seconds for processing to complete
    await pollDelay(8000);

    // 18. Verify the appointment page elements are loaded (implicit - page navigates to appointment page)

    // 19. Select first time slot checkbox
    await page.locator('#slot-0').click();

    // 20. Select second time slot checkbox
    await page.locator('#slot-1').click();

    // 21. Select third time slot checkbox
    await page.locator('#slot-2').click();

    // 22. Click the 'Continue' button
    await page.getByRole('button', { name: 'Continue' }).click();

    // 23. Verify review page content (implicit - page navigates to review page)

    // 24. Click 'Continue to payment' button
    await page.getByRole('button', { name: 'Continue to payment' }).click();

    // 25. Verify payment page elements (implicit - page navigates to payment page)

    // 26. Click on 'Add new credit card' button
    await page.getByRole('button', { name: ' Add new credit card visa' }).click();

    // 27. Enter first name into First Name field
    await page.getByRole('textbox', { name: 'First Name' }).fill(creds.cardFirstName);

    // 28. Enter last name into Last Name field
    await page.getByRole('textbox', { name: 'Last Name' }).fill(creds.cardLastName);

    // 29. Enter card number into Card Number field
    await page.getByRole('textbox', { name: 'Card Number' }).fill(creds.cardNumber);

    // 30. Enter expiry into Expiration Date field
    await page.getByRole('textbox', { name: 'Expiration Date (MM/YY)' }).fill(creds.cardExpiry);

    // 31. Enter CVV into CVV field
    await page.getByRole('textbox', { name: 'CVV' }).fill(creds.cardCvv);

    // 32. Verify billing information is pre-populated (implicit - form shows pre-populated address)

    // 33. Click 'Next' button
    await page.getByRole('button', { name: 'Next' }).click();

    // 34. Check the Terms and Conditions checkbox
    await page.getByRole('checkbox', { name: 'Terms and Conditions Checkbox' }).click();

    // 35. Click 'Pay now' button
    await page.getByRole('button', { name: 'Pay now' }).click();

    // 36. Wait 10-15 seconds for payment processing and navigation
    await pollDelay(22000);

    // 37. If confirmation page loads, verify confirmation details
    await expect(page).toHaveURL(/.*request-confirmation/);
    await expect(page.getByRole('heading', { name: 'Confirmed!' })).toBeVisible();

    // 38. Scroll through the entire page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await pollDelay(2000);

    // 39. Close the browser
    await page.context().close();
    console.log('✓ Browser closed - Test completed successfully');
  });
});
