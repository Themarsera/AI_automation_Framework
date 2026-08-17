import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { pollDelay } from '../../utils/constants/timeouts';

export class AppointmentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async selectTimeSlots(slots: number = 3) {
    console.log('📍 SELECT TIME SLOTS');

    // Wait for page to fully load
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.page.waitForLoadState('load', { timeout: 30000 }).catch(() => null);
    await pollDelay(3000);

    // If we're on a calendar/date picker page, select a date first
    const calendarDates = await this.page.locator('[role="button"]').filter({ hasText: /^\d{1,2}$/ }).all();
    if (calendarDates.length > 0) {
      console.log('📅 Calendar detected - selecting date');
      for (const dateBtn of calendarDates) {
        if (await dateBtn.isVisible().catch(() => false) && !await dateBtn.isDisabled().catch(() => true)) {
          await dateBtn.click();
          console.log('✓ Date selected');
          await pollDelay(2000);
          await this.page.waitForLoadState('load', { timeout: 15000 }).catch(() => null);
          break;
        }
      }
    }

    // Wait for time slot checkboxes to appear
    console.log('  ⏳ Waiting for time slots to load...');
    await pollDelay(3000);

    // Wait for at least one checkbox to be visible
    const firstCheckbox = this.page.locator('input[type="checkbox"]').first();
    await firstCheckbox.waitFor({ state: 'visible', timeout: 15000 });

    const allCheckboxes = await this.page.locator('input[type="checkbox"]').all();
    let slotsSelected = 0;

    for (const cb of allCheckboxes) {
      if (slotsSelected >= slots) break;

      if (await cb.isVisible({ timeout: 1000 }).catch(() => false)) {
        const isChecked = await cb.isChecked();
        if (!isChecked) {
          await cb.check({ force: true });
          console.log(`✓ Slot ${slotsSelected + 1} selected`);
          slotsSelected++;
          await pollDelay(400);
        }
      }
    }

    if (slotsSelected === 0) {
      throw new Error('No time slot checkboxes found or selectable');
    }

    console.log(`✓ Total slots selected: ${slotsSelected}`);
  }

  async proceedToPayment() {
    console.log('📍 PROCEED TO PAYMENT');
    await this.page.evaluate(() => window.scrollBy(0, 200));

    // Click Continue on appointment page
    const continueBtn = this.page.getByRole('button', { name: /Continue|Proceed|Next/i });
    await continueBtn.click();
    console.log('✓ Continue clicked from appointment page');
    await pollDelay(3000);

    // Navigate through any intermediate pages (review, etc.) until we reach payment
    const maxAttempts = 10;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      await this.page.waitForLoadState('domcontentloaded').catch(() => null);
      await pollDelay(2000);

      const url = this.page.url();
      const pageName = url.split('/').slice(-1)[0];
      console.log(`✓ Page: ${pageName}`);

      // Check if we're on payment page - look for "Add New Credit Card" or card fields
      const addCardBtn = this.page.getByRole('button', { name: /add.*card/i });
      if (await addCardBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Payment page reached\n');
        break;
      }

      // Look for Continue/Next/Proceed buttons
      const nextButtons = await this.page.getByRole('button', { name: /Continue|Proceed|Next|Submit|Schedule|Review/i }).all();
      let clicked = false;

      for (const btn of nextButtons) {
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false) && !await btn.isDisabled()) {
          const btnText = await btn.textContent();
          if (btnText && !btnText.toLowerCase().includes('back') && !btnText.toLowerCase().includes('cancel')) {
            await btn.click();
            console.log(`  ✓ Clicked: ${btnText.trim()}`);
            clicked = true;
            break;
          }
        }
      }

      if (!clicked) {
        console.log('  ⚠️ No more navigation buttons found');
        break;
      }
    }
  }
}
