import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { pollDelay } from '../../utils/constants/timeouts';

export class ServiceRequestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToServiceRequest() {
    // Click "Request service" button from dashboard
    await this.page.getByRole('button', { name: 'Request service' }).click();
    console.log('✓ Service request link clicked');
    await this.page.waitForLoadState('load');
    console.log('✓ Service page loaded');
  }

  async selectRefrigerator() {
    // Wait for page to load
    await this.page.waitForLoadState('load');

    // Refrigerator is in "Top picked items" - just click the text
    await this.page.locator('text=Refrigerator').first().click();
    console.log('✓ Refrigerator selected');

    // Wait for form page to load
    await this.page.waitForLoadState('load');
    await pollDelay(2000);
  }

  async fillDropdowns() {
    console.log('📍 FILL DROPDOWNS');

    // Wait for form to be ready
    await pollDelay(2000);

    // SYMPTOMS dropdown (REQUIRED) - Click the dropdown arrow button
    console.log('  Opening Symptoms dropdown...');
    // Find the parent container with "Symptoms" text, then click the dropdown trigger button
    const symptomsSection = this.page.locator('text=Symptoms').locator('..').locator('..');
    const symptomsDropdownBtn = symptomsSection.locator('button[aria-label="dropdown trigger"]').or(symptomsSection.locator('button').last());
    await symptomsDropdownBtn.click();
    await pollDelay(1000);

    // Select random option from the list
    const symptomOptions = await this.page.locator('[role="option"]').all();
    if (symptomOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * symptomOptions.length);
      const symptomText = await symptomOptions[randomIndex].textContent();
      await symptomOptions[randomIndex].click();
      console.log(`✓ Symptoms: ${symptomText?.trim()}`);
      await pollDelay(1000);
    }

    // LOCATION - Already defaults to "Kitchen"
    console.log('✓ Location: Kitchen');

    // BRAND dropdown (REQUIRED) - Click the dropdown arrow button
    console.log('  Opening Brand dropdown...');
    const brandSection = this.page.locator('text=Brand').locator('..').locator('..');
    const brandDropdownBtn = brandSection.locator('button[aria-label="dropdown trigger"]').or(brandSection.locator('button').last());
    await brandDropdownBtn.click();
    await pollDelay(1000);

    // Select random brand from the list
    const brandOptions = await this.page.locator('[role="option"]').all();
    if (brandOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * brandOptions.length);
      const brandText = await brandOptions[randomIndex].textContent();
      await brandOptions[randomIndex].click();
      console.log(`✓ Brand: ${brandText?.trim()}`);
      await pollDelay(1000);
    }
  }

  async fillSerialAndModel(serial: string, model: string) {
    // Fill Serial Number
    const serialInput = this.page.getByLabel('Serial Number', { exact: false });
    await serialInput.fill(serial);
    console.log(`✓ Serial: ${serial}`);

    // Fill Model
    const modelInput = this.page.getByLabel('Model', { exact: false });
    await modelInput.fill(model);
    console.log(`✓ Model: ${model}`);
  }

  async clickContinue() {
    // Wait a moment for form validation
    await pollDelay(1000);

    const continueBtn = this.page.getByRole('button', { name: 'Continue' });
    await continueBtn.waitFor({ state: 'visible' });

    // Wait for button to be enabled
    let attempts = 0;
    while (await continueBtn.isDisabled() && attempts < 20) {
      await pollDelay(500);
      attempts++;
    }

    if (await continueBtn.isDisabled()) {
      throw new Error('Continue button still disabled after waiting - required fields may not be filled');
    }

    await continueBtn.click();
    console.log('✓ Continue clicked');

    // Wait for processing/loading spinners
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for any loading indicators to disappear
    const loadingIndicators = [
      this.page.getByText('Saving information'),
      this.page.getByText('Finding the best technician'),
      this.page.getByText('Processing')
    ];

    for (const indicator of loadingIndicators) {
      try {
        if (await indicator.isVisible({ timeout: 2000 })) {
          await indicator.waitFor({ state: 'hidden', timeout: 30000 });
          console.log('  ✓ Processing completed');
        }
      } catch (e) {
        // Indicator not present, continue
      }
    }

    // Final wait for page to stabilize
    await this.page.waitForLoadState('load', { timeout: 30000 }).catch(() => null);
    await pollDelay(3000);
  }
}
