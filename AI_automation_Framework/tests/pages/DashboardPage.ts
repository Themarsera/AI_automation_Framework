// Page Object: DashboardPage
// Covers the /dashboard page — plan summary, navigation, user menu, logout

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

const WAIT = { state: 'visible' as const, timeout: 60000 };

export class DashboardPage extends BasePage {
  readonly myPlansHeading       = this.page.getByRole('heading', { name: 'My plans' });
  readonly addAPlanButton       = this.page.getByRole('button', { name: 'Add a plan button' });
  readonly menuButton           = this.page.getByRole('button', { name: 'Menu Button', exact: true });
  readonly userMenuButton       = this.page.getByRole('button', { name: 'User menu button' });
  readonly logOutLink           = this.page.getByRole('link', { name: ' Log Out' });
  readonly paymentsLinkInDrawer = this.page.getByRole('link', { name: ' Payments' }).first();

  constructor(page: Page) {
    super(page);
  }

  async waitForDashboard() {
    await this.myPlansHeading.waitFor({ state: 'visible', timeout: 90000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async clickAddAPlan() {
    await this.addAPlanButton.waitFor(WAIT);
    await this.addAPlanButton.click();
    await this.page.waitForURL(/\/dashboard\/linkPlan/, { timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByText("Let's locate your plan").first().waitFor(WAIT);
  }

  async openHamburgerMenu() {
    await this.menuButton.waitFor(WAIT);
    await this.menuButton.click();
    await this.paymentsLinkInDrawer.waitFor(WAIT);
  }

  async clickPaymentsInDrawer() {
    await this.paymentsLinkInDrawer.waitFor(WAIT);
    await this.paymentsLinkInDrawer.click();
    await this.page.waitForURL(/\/payments/, { timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout() {
    await this.userMenuButton.waitFor(WAIT);
    await this.userMenuButton.click();
    await this.logOutLink.waitFor(WAIT);
    await this.logOutLink.click();
    await this.page.waitForURL(/\/login/, { timeout: 60000 });
    await this.page.waitForLoadState('domcontentloaded');
  }
}
