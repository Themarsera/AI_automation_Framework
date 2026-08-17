// Page Object: PaymentsPage
// Covers the /payments page — heading and content assertions

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

const WAIT = { state: 'visible' as const, timeout: 90000 };

export class PaymentsPage extends BasePage {
  readonly paymentsHeading = this.page.getByRole('heading', { name: 'Payments', level: 2 });

  constructor(page: Page) {
    super(page);
  }

  async assertOnPaymentsPage() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.paymentsHeading.waitFor(WAIT);
    await expect(this.paymentsHeading).toBeVisible({ timeout: 60000 });
  }
}
