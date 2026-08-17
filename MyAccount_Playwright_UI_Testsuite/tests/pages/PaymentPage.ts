import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { pollDelay } from '../../utils/constants/timeouts';

export class PaymentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickAddNewCreditCard() {
    console.log('📍 CLICK "ADD NEW CREDIT CARD"');
    await this.page.evaluate(() => window.scrollBy(0, 200));

    const addCardBtn = this.page.getByRole('button', { name: /add.*card/i });
    await addCardBtn.waitFor({ state: 'visible', timeout: 5000 });
    const btnText = await addCardBtn.textContent();
    console.log(`✓ Found: "${btnText?.trim()}"`);
    await addCardBtn.click();
    console.log('✓ Clicked\n');
    await pollDelay(2500);
  }

  async fillCardDetails(firstName: string, lastName: string, cardNumber: string, cvv: string) {
    console.log('📍 FILL CARD DETAILS');
    await pollDelay(1500);

    const firstNameInput = this.page.getByPlaceholder(/first.*name/i).or(this.page.getByLabel(/first.*name/i));
    await firstNameInput.fill(firstName);
    console.log(`✓ First Name: ${firstName}`);

    const lastNameInput = this.page.getByPlaceholder(/last.*name/i).or(this.page.getByLabel(/last.*name/i));
    await lastNameInput.fill(lastName);
    console.log(`✓ Last Name: ${lastName}`);

    const cardInput = this.page.getByPlaceholder(/card.*number/i).or(this.page.getByLabel(/card.*number/i));
    await cardInput.fill(cardNumber);
    console.log(`✓ Card: ****${cardNumber.slice(-4)}`);

    const cvvInput = this.page.getByPlaceholder(/cvv|security.*code/i).or(this.page.getByLabel(/cvv|security.*code/i));
    await cvvInput.fill(cvv);
    console.log(`✓ CVV: ****\n`);
  }

  async submitPayment() {
    console.log('📍 SUBMIT PAYMENT');
    await this.page.evaluate(() => window.scrollBy(0, 500));

    const paymentBtn = this.page.getByRole('button', { name: /pay|submit|place.*order|confirm/i });
    await paymentBtn.waitFor({ state: 'visible', timeout: 5000 });

    const btnText = await paymentBtn.textContent();
    console.log(`✓ Clicking: "${btnText?.trim()}"`);

    await paymentBtn.click();
    console.log('✓ Payment submitted');

    await pollDelay(5000);
    await this.page.waitForLoadState('domcontentloaded').catch(() => null);
  }

  async verifyMultiItemConfirmation() {
    await expect(this.page).toHaveURL(/.*request-confirmation/, { timeout: 60000 });
    await expect(this.page.getByRole('heading', { name: 'Confirmed!' })).toBeVisible();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await pollDelay(2000);
    await expect(this.page.getByText('Service order No.').first()).toBeVisible();
    await expect(this.page.getByText('Service order No.').last()).toBeVisible();
    await expect(this.page.getByText('$120').first()).toBeVisible();
  }

  async verifyConfirmation(): Promise<boolean> {
    await pollDelay(2000);

    const finalUrl = this.page.url();
    const finalContent = await this.page.content();

    const isConfirmed = finalUrl.includes('confirmation') || finalUrl.includes('success') ||
           finalContent.includes('Thank you') || finalContent.includes('Order Confirmation') ||
           finalContent.includes('confirmed') || finalContent.toLowerCase().includes('service.*request.*created');

    if (isConfirmed) {
      await this.page.evaluate(() => window.scrollBy(0, 300));
      await pollDelay(1000);
      await this.page.evaluate(() => window.scrollBy(0, 300));
      console.log('✓ Scrolled through confirmation page');
    }

    return isConfirmed;
  }
}
