// spec: test-plans/C171750_complete_e2e.md
// seed: tests/seed.spec.ts
// @Feature: Service Request
// @Story: Multi-Item Service Request (2 Items, 1 Category)
// @Severity: critical
// @TestRail: C171750

import { test, expect } from '@playwright/test';
import { getTestCredentials } from './testCredentials';
import { LoginPage } from './pages/LoginPage';
import { MultiItemServiceRequestPage } from './pages/MultiItemServiceRequestPage';
import { PaymentPage } from './pages/PaymentPage';

test.describe('C171750 Multi-Item Service Request', () => {

  test('C171750 - Complete multi-item Warranty Repair service request flow @e2e @critical', async ({ page }) => {
    test.setTimeout(300000);

    const creds = getTestCredentials();
    if (!creds) throw new Error('Test credentials not found. Add test-credentials.json or set TEST_USER/TEST_PASS env vars.');

    const _loginPage = new LoginPage(page);
    const _srPage = new MultiItemServiceRequestPage(page);
    const _paymentPage = new PaymentPage(page);

    // 1. Navigate to https://myaccount-ui.qa.cinchhs.com — expect redirect to /login
    await page.goto('https://myaccount-ui.qa.cinchhs.com');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle('Cinch My Account');
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

    // 2. Close the cookie banner by clicking the 'X' button
    try {
      await page.getByRole('button', { name: 'X' }).click({ timeout: 5000 });
    } catch { /* banner may not be present on every run */ }

    // 3. Enter email into the Email field
    await page.getByRole('textbox', { name: 'Email' }).fill(creds.user);

    // 4. Enter password into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill(creds.pass);

    // 5. Click the 'Log in' button and wait for the dashboard
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByText('Request service').first().waitFor({ state: 'visible', timeout: 30000 });

    // 6. Click the plan dropdown trigger to open the plan list
    await page.getByRole('button', { name: 'dropdown trigger' }).click();
    await page.getByText('APPLIANCE PREMIUM').first().waitFor({ state: 'visible', timeout: 10000 });

    // 7. Select 'APPLIANCE PREMIUM' from the dropdown
    await page.getByRole('option', { name: 'APPLIANCE PREMIUM' }).click();
    await page.getByRole('heading', { name: 'Appliance Premium', level: 1 }).waitFor({ state: 'visible', timeout: 15000 });

    // 8. Click the 'Request service' button on the Appliance Premium plan card
    await page.getByRole('button', { name: 'Request service' }).click();
    await page.getByText('Warranty Repair').first().waitFor({ state: 'visible', timeout: 15000 });

    // 9. Click on the 'Warranty Repair' service type card
    await page.locator('div').filter({ hasText: 'Warranty RepairWe fix' }).nth(5).click();
    await page.waitForURL(/create-request/, { timeout: 15000 });
    await page.getByText('Refrigerator').first().waitFor({ state: 'visible', timeout: 15000 });

    // 10. Click on 'Refrigerator' in the Top picked items grid
    await page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4).click();
    await page.waitForURL(/what-is-issue/, { timeout: 15000 });
    await page.getByText("What's the issue?").first().waitFor({ state: 'visible', timeout: 10000 });

    // 11. Open the Symptom dropdown for Refrigerator and select 'THE UNIT CAUSES THE FUSE TO BLOW'
    // eslint-disable-next-line playwright/no-force-option
    await page.locator('p-select[data-auto-id="symptoms-list"]').click({ force: true });
    await page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO' }).first().waitFor({ state: 'visible', timeout: 8000 });
    await page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO' }).first().click();

    // 12. Open the Brand dropdown for Refrigerator and select 'Bosch'
    // eslint-disable-next-line playwright/no-force-option
    await page.locator('p-select[data-auto-id="brand-list"]').click({ force: true });
    await page.getByRole('option', { name: 'Bosch' }).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByRole('option', { name: 'Bosch' }).click();

    // 13. Enter serial number 'SN12345' into the Serial Number field for Refrigerator
    await page.getByRole('textbox', { name: 'Serial Number' }).fill('SN12345');

    // 14. Enter model 'MODEL123' into the Model field for Refrigerator
    await page.getByRole('textbox', { name: 'Model' }).fill('MODEL123');

    // 15. Click the 'Add Item' button to save Refrigerator and navigate to add a second item
    await page.getByRole('button', { name: /Add Item/i }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: /Add Item/i }).click();
    try {
      await page.getByText('Saving information').first().waitFor({ state: 'visible', timeout: 3000 });
      await page.getByText('Saving information').first().waitFor({ state: 'hidden', timeout: 30000 });
    } catch { /* spinner may not appear */ }
    await page.waitForURL(/select-category/, { timeout: 15000 });
    await page.getByText('Clothes Washer').first().waitFor({ state: 'visible', timeout: 15000 });

    // 16. Click on 'Clothes Washer' in the Top picked items grid
    await page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4).click();
    await page.waitForURL(/what-is-issue/, { timeout: 15000 });
    await page.getByText('Clothes Washer').first().waitFor({ state: 'visible', timeout: 10000 });

    // 17. Open the Symptom dropdown for Clothes Washer and select 'THE UNIT CAUSES THE FUSE TO BLOW'
    // eslint-disable-next-line playwright/no-force-option
    await page.locator('p-select[data-auto-id="symptoms-list"]').click({ force: true });
    await page.getByText('THE UNIT CAUSES THE FUSE TO BLOW').first().waitFor({ state: 'visible', timeout: 8000 });
    await page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO' }).first().click();

    // 18. Open the Brand dropdown for Clothes Washer and select 'Admiral'
    // eslint-disable-next-line playwright/no-force-option
    await page.locator('p-select[data-auto-id="brand-list"]').click({ force: true });
    await page.getByRole('option', { name: 'Admiral' }).waitFor({ state: 'visible', timeout: 8000 });
    await page.getByRole('option', { name: 'Admiral' }).click();

    // 19. Enter serial number 'SN67890' into the Serial Number field for Clothes Washer
    await page.getByRole('region', { name: 'Toggle details for Clothes Washer' })
      .getByRole('textbox', { name: 'Serial Number' }).fill('SN67890');

    // 20. Enter model 'MODEL456' into the Model field for Clothes Washer
    await page.getByRole('region', { name: 'Toggle details for Clothes Washer' })
      .getByRole('textbox', { name: 'Model' }).fill('MODEL456');

    // 21. Click 'Continue' button to navigate to the Review page
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
    await expect(continueBtn).toBeEnabled({ timeout: 10000 });
    await continueBtn.click();
    try {
      await page.getByText('Finding the best technician').first().waitFor({ state: 'visible', timeout: 5000 });
      await page.getByText('Finding the best technician').first().waitFor({ state: 'hidden', timeout: 30000 });
    } catch { /* spinner may not appear */ }
    await page.waitForURL(/review-request/, { timeout: 15000 });
    await page.getByRole('button', { name: 'Continue to payment' }).waitFor({ state: 'visible', timeout: 15000 });

    // 22. Click 'Continue to payment' button on the Review page
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await page.waitForURL(/make-payment/, { timeout: 15000 });
    await page.getByText('Select a payment option').first().waitFor({ state: 'visible', timeout: 10000 });

    // 23. Click 'Add new credit card' button
    await page.getByRole('button', { name: / Add new credit card visa/i }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: / Add new credit card visa/i }).click();
    await page.getByText('Add Credit Card').first().waitFor({ state: 'visible', timeout: 10000 });

    // 24. Fill First Name
    await page.getByRole('textbox', { name: 'First Name' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('textbox', { name: 'First Name' }).fill(creds.cardFirstName);

    // 25. Fill Last Name
    await page.getByRole('textbox', { name: 'Last Name' }).fill(creds.cardLastName);

    // 26. Fill Card Number
    await page.getByRole('textbox', { name: 'Card Number' }).fill(creds.cardNumber);

    // 27. Fill Expiration Date
    await page.getByRole('textbox', { name: 'Expiration Date (MM/YY)' }).fill(creds.cardExpiry);

    // 28. Fill CVV
    await page.getByRole('textbox', { name: 'CVV' }).fill(creds.cardCvv);

    // 29. Click 'Next' button to submit card details
    await page.getByRole('button', { name: 'Next' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('checkbox', { name: 'Terms and Conditions Checkbox' }).waitFor({ state: 'visible', timeout: 10000 });

    // 30. Check the Terms and Conditions checkbox
    await page.getByRole('checkbox', { name: 'Terms and Conditions Checkbox' }).click();
    await expect(page.getByRole('button', { name: 'Pay now' })).toBeEnabled({ timeout: 10000 });

    // 31. Click 'Pay now' button and verify confirmation page
    await page.getByRole('button', { name: 'Pay now' }).click();
    await page.waitForURL(/request-confirmation/, { timeout: 60000 });
    await expect(page.getByRole('heading', { name: 'Confirmed!' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Thank you! Your service request has been submitted and $120 has been billed to you.')).toBeVisible();
    await expect(page.getByText('Service order No.').first()).toBeVisible();
    await expect(page.getByText('Service order No.').last()).toBeVisible();
    await expect(page.getByText('$120').first()).toBeVisible();

    await page.context().close();
  });
});
