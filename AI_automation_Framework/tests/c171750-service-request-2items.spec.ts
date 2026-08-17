// spec: test-plans/C171750_MyAccountRequestService_2Items.md
// seed: tests/seed.spec.ts
// @Feature: Service Request
// @Story: C171750 - Multi-Item Service Request (2 Items, 1 Category)
// @Severity: critical
// @TestRail: C171750

import { test, expect } from '@playwright/test';
import { getTestCredentials } from './testCredentials';

test.setTimeout(300000);

test.describe('C171750 - My Account Request Service - 2 Items 1 Category', () => {
  test('@critical @e2e Complete Service Request Flow - 2 Items Same Category', async ({ page }) => {
    const creds = getTestCredentials();
    if (!creds) throw new Error('Test credentials not found. Add test-credentials.json or set TEST_USER/TEST_PASS env vars.');

    // 1. Step 1 — Navigate to the MyAccount login page and close cookie banner
    await page.goto('https://myaccount-ui.qa.cinchhs.com');
    await page.getByRole('button', { name: 'X' }).click();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();

    // 2. Step 2 — Log in with valid credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(creds.user);
    await page.getByRole('textbox', { name: 'Password' }).fill(creds.pass);
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByText('Request service').first().waitFor({ state: 'visible' });
    await expect(page).not.toHaveURL(/\/login/);

    // 3. Step 2a — On the Dashboard, select APPLIANCE PREMIUM plan from the My Plan dropdown
    await page.getByRole('button', { name: 'dropdown trigger' }).first().click();
    await page.getByRole('option', { name: 'APPLIANCE PREMIUM' }).click();
    await page.getByText('Appliance Premium').first().waitFor({ state: 'visible' });
    await expect(page.getByRole('button', { name: 'Request service' }).first()).toBeVisible();

    // 4. Step 3 — Click the Request Service button and select Warranty Repair type
    await page.getByRole('button', { name: 'Request service' }).first().click();
    await page.locator('div').filter({ hasText: 'Warranty RepairWe fix' }).nth(5).waitFor({ state: 'visible' });
    await page.locator('div').filter({ hasText: 'Warranty RepairWe fix' }).nth(5).click();

    // 5. Step 5 — Select Refrigerator and fill in first item details (symptom, brand, serial, model)
    await page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4).waitFor({ state: 'visible' });
    await page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4).click();
    const refrigeratorPanel = page.locator('[aria-label="Details for Refrigerator"]');
    await refrigeratorPanel.waitFor({ state: 'visible' });
    await refrigeratorPanel.getByRole('button', { name: 'dropdown trigger' }).first().click();
    await page.getByRole('option', { name: 'THE UNIT IS NOT COOLING' }).click();
    await refrigeratorPanel.getByRole('button', { name: 'dropdown trigger' }).last().click();
    await page.getByRole('option', { name: 'Bosch' }).click();
    await page.getByRole('textbox', { name: 'Serial Number' }).first().fill('SN12345');
    await page.getByRole('textbox', { name: 'Model' }).first().fill('MODEL123');

    // 6. Step 6 — Click the Add Item button to add a second item
    await page.getByRole('button', { name: /Add Item/i }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /Add Item/i }).click();
    await page.getByText('Saving information').first().waitFor({ state: 'hidden' });

    // 7. Step 7 — Select Clothes Washer as second item and fill in its details, then click Continue
    await page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4).waitFor({ state: 'visible' });
    await page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4).click();
    const clothesWasherPanel = page.locator('[aria-label="Details for Clothes Washer"]');
    await clothesWasherPanel.waitFor({ state: 'visible' });
    await clothesWasherPanel.getByRole('button', { name: 'dropdown trigger' }).first().click();
    await page.getByRole('option').first().click();
    await clothesWasherPanel.getByRole('button', { name: 'dropdown trigger' }).last().click();
    await page.getByRole('option').first().click();
    await page.getByRole('textbox', { name: 'Serial Number' }).last().fill('SN67890');
    await page.getByRole('textbox', { name: 'Model' }).last().fill('MODEL456');
    await page.getByRole('button', { name: 'Continue' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Saving information').first().waitFor({ state: 'hidden' });
    await page.getByText('Finding the best technician').first().waitFor({ state: 'hidden' });

    // 8. Step 8 — On the Review page, click 'Continue to payment'
    await expect(page).toHaveURL(/.*review-request/);
    await page.getByRole('button', { name: 'Continue to payment' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Continue to payment' }).click();

    // 9. Step 9 — On the Payment page, add card, fill details, accept terms, and pay
    await page.getByRole('button', { name: /add.*card/i }).first().waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /add.*card/i }).first().click();
    await page.getByRole('textbox', { name: 'First Name' }).waitFor({ state: 'visible' });
    await page.getByRole('textbox', { name: 'First Name' }).fill(creds.cardFirstName);
    await page.getByRole('textbox', { name: 'Last Name' }).fill(creds.cardLastName);
    await page.getByRole('textbox', { name: 'Card Number' }).fill(creds.cardNumber);
    await page.getByRole('textbox', { name: 'Expiration Date (MM/YY)' }).fill(creds.cardExpiry);
    await page.getByRole('textbox', { name: 'CVV' }).fill(creds.cardCvv);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('checkbox', { name: 'Terms and Conditions Checkbox' }).waitFor({ state: 'visible' });
    await page.getByRole('checkbox', { name: 'Terms and Conditions Checkbox' }).click();
    await page.getByRole('button', { name: 'Pay now' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Pay now' }).click();

    // 10. Confirm the service request confirmation page with both service order numbers
    await expect(page).toHaveURL(/.*request-confirmation/, { timeout: 60000 });
    await expect(page.getByRole('heading', { name: 'Confirmed!' })).toBeVisible();
    await expect(page.getByText('Service order No.').first()).toBeVisible();
    await expect(page.getByText('Service order No.').last()).toBeVisible();
    await expect(page.getByText('$120').first()).toBeVisible();
  });
});
