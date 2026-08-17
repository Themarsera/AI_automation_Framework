import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MultiItemServiceRequestPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  async selectWarrantyRepair() {
    await this.page.locator('div').filter({ hasText: 'Warranty RepairWe fix' }).nth(5)
      .waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator('div').filter({ hasText: 'Warranty RepairWe fix' }).nth(5).click();
    await this.page.waitForURL(/create-request/, { timeout: 15000 });
  }

  async selectItem(itemName: string) {
    await this.page.locator('div').filter({ hasText: new RegExp(`^${itemName}$`) }).nth(4)
      .waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator('div').filter({ hasText: new RegExp(`^${itemName}$`) }).nth(4).click();
    await this.page.waitForURL(/what-is-issue/, { timeout: 15000 });
  }

  async fillRefrigeratorDetails(serial: string, model: string) {
    const panel = this.page.getByRole('region', { name: 'Toggle details for Refrigerator' });
    await panel.waitFor({ state: 'visible', timeout: 10000 });

    // Symptom — click the combobox placeholder text to open the dropdown overlay
    await panel.getByText('Select a symptom').click();
    await this.page.getByRole('option').first().waitFor({ state: 'visible', timeout: 8000 });
    await this.page.getByRole('option').first().click();

    // Brand — click the combobox placeholder text
    await panel.getByText('Select a brand').click();
    await this.page.getByRole('option', { name: 'Bosch' }).waitFor({ state: 'visible', timeout: 8000 });
    await this.page.getByRole('option', { name: 'Bosch' }).click();

    await panel.getByRole('textbox', { name: 'Serial Number' }).fill(serial);
    await panel.getByRole('textbox', { name: 'Model' }).fill(model);
  }

  async clickAddItem() {
    await this.page.getByRole('button', { name: /Add Item/i })
      .waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByRole('button', { name: /Add Item/i }).click();
    // Wait for saving spinner then select-category page
    try {
      await this.page.getByText('Saving information').waitFor({ state: 'visible', timeout: 3000 });
      await this.page.getByText('Saving information').waitFor({ state: 'hidden', timeout: 30000 });
    } catch { /* spinner may not appear */ }
    await this.page.waitForURL(/select-category/, { timeout: 15000 });
    await this.page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4)
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillClothesWasherDetails(serial: string, model: string) {
    const panel = this.page.getByRole('region', { name: 'Toggle details for Clothes Washer' });
    await panel.waitFor({ state: 'visible', timeout: 10000 });

    // Symptom — click the combobox placeholder text to open dropdown overlay
    await panel.getByText('Select a symptom').click();
    await this.page.getByRole('option').first().waitFor({ state: 'visible', timeout: 8000 });
    await this.page.getByRole('option').first().click();

    // Brand — click the combobox placeholder text
    await panel.getByText('Select a brand').click();
    await this.page.getByRole('option', { name: 'Admiral' }).waitFor({ state: 'visible', timeout: 8000 });
    await this.page.getByRole('option', { name: 'Admiral' }).click();

    await panel.getByRole('textbox', { name: 'Serial Number' }).fill(serial);
    await panel.getByRole('textbox', { name: 'Model' }).fill(model);
  }

  async clickContinue() {
    const continueButton = this.page.getByRole('button', { name: 'Continue' });
    await continueButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(continueButton).toBeEnabled({ timeout: 10000 });
    await continueButton.click();
    // Wait for technician spinner then review page
    try {
      await this.page.getByText('Finding the best technician').waitFor({ state: 'visible', timeout: 5000 });
      await this.page.getByText('Finding the best technician').waitFor({ state: 'hidden', timeout: 30000 });
    } catch { /* spinner may not appear */ }
    await this.page.waitForURL(/review-request/, { timeout: 15000 });
    await this.page.getByRole('button', { name: 'Continue to payment' })
      .waitFor({ state: 'visible', timeout: 15000 });
  }
}
