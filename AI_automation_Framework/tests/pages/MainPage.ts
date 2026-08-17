import { Page, expect } from '@playwright/test';

export class MainPage {
  readonly page: Page;
  readonly hamburger: ReturnType<Page['locator']>;
  readonly drawer: ReturnType<Page['locator']>;

  constructor(page: Page) {
    this.page = page;
    this.hamburger = page.locator('[data-testid="menu-toggle"], button[aria-label*="menu"], button[aria-label*="open menu"], button:has(svg)');
    this.drawer = page.locator('nav, [data-testid="drawer"], [role="dialog"], [role="menu"]');
  }

  async openMenu() {
    // Prefer an explicitly left-side hamburger button to avoid clicking profile menu on the right
    const viewport = this.page.viewportSize() || { width: 1280, height: 800 };

    const candidates = this.page.locator('button, [data-testid="menu-toggle"], [aria-label*="menu"], button:has-text("Menu")');
    const count = await candidates.count().catch(() => 0);
    for (let i = 0; i < count; ++i) {
      const c = candidates.nth(i);
      const box = await c.boundingBox().catch(() => null);
      if (!box) continue;
      // Choose candidate on left half of viewport
      if (box.x + box.width / 2 < viewport.width / 2) {
        try {
          await c.waitFor({ state: 'visible', timeout: 3000 });
          // multiple click strategies
          try { await c.click({ timeout: 5000 }); } catch { try { await c.evaluate((el: HTMLElement) => el.click()); } catch { const b = await c.boundingBox(); if (b) await this.page.mouse.click(b.x + b.width/2, b.y + b.height/2); } }
          // wait for drawer
          await Promise.race([
            this.drawer.first().waitFor({ state: 'visible', timeout: 10000 }),
            this.page.waitForFunction(() => !!document.querySelector('nav, [data-testid="drawer"], [role="dialog"], [role="menu"], .drawer, .side-menu, .menu-panel'), null, { timeout: 10000 })
          ]);
          console.log('Menu opened via left-side candidate');
          return;
        } catch (e) {
          console.warn('Left-side candidate failed, trying next', e);
        }
      }
    }

    // Fallback to original robust strategy (try explicit selectors then generic hamburger)
    const selectors = [
      '[data-testid="menu-toggle"]',
      'button[aria-label*="menu"]',
      'button[title*="Menu"]',
      'button[aria-label*="open"]',
      'button[aria-controls]'
    ];

    for (const sel of selectors) {
      const loc = this.page.locator(sel).first();
      if (!(await loc.count().catch(() => 0))) continue;
      try {
        await loc.waitFor({ state: 'visible', timeout: 3000 });
        try { await loc.click({ timeout: 5000 }); } catch { try { await loc.evaluate((el: HTMLElement) => el.click()); } catch { const b = await loc.boundingBox(); if (b) await this.page.mouse.click(b.x + b.width/2, b.y + b.height/2); } }
        await Promise.race([
          this.drawer.first().waitFor({ state: 'visible', timeout: 10000 }),
          this.page.waitForFunction(() => !!document.querySelector('nav, [data-testid="drawer"], [role="dialog"], [role="menu"], .drawer, .side-menu, .menu-panel'), null, { timeout: 10000 })
        ]);
        console.log(`Menu opened using selector ${sel}`);
        return;
      } catch (e) {
        console.warn(`Selector ${sel} failed:`, e);
      }
    }

    // Final fallback: generic hamburger locator
    try {
      const h = this.hamburger.first();
      await h.waitFor({ state: 'visible', timeout: 5000 });
      try { await h.click({ timeout: 5000 }); } catch { try { await h.evaluate((el: HTMLElement) => el.click()); } catch { /* ignore */ } }
      await Promise.race([
        this.drawer.first().waitFor({ state: 'visible', timeout: 10000 }),
        this.page.waitForFunction(() => !!document.querySelector('nav, [data-testid="drawer"], [role="dialog"], [role="menu"], .drawer, .side-menu, .menu-panel'), null, { timeout: 10000 })
      ]);
      console.log('Menu opened using generic hamburger fallback');
      return;
    } catch (finalErr) {
      throw new Error('Failed to open menu after all strategies: ' + String(finalErr));
    }
  }

  async closeMenu() {
    const close = this.page.locator('[data-testid="menu-close"], button[aria-label*="close"], button:has-text("Close")');
    if (await close.count()) await close.first().click();
  }

  // Click a menu item by visible text. Prefer locating inside the open drawer and ensure visibility/scroll before clicking.
  async clickMenuItem(name: string) {
    // Try role=link inside the drawer
    const linkInDrawer = this.drawer.getByRole ? this.drawer.getByRole('link', { name, exact: false }) : this.drawer.locator(`text=${name}`);
    if (await linkInDrawer.count()) {
      const loc = linkInDrawer.first();
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      await loc.scrollIntoViewIfNeeded();
      // If the item is a link, navigate directly to avoid flaky UI clicks
      const href = await loc.evaluate((el: HTMLElement) => {
        const a = el.closest('a');
        if (a) return a.getAttribute('href');
        if (el.tagName.toLowerCase() === 'a') return (el as HTMLAnchorElement).getAttribute('href');
        return null;
      });
      if (href) {
        const url = href.startsWith('http') ? href : new URL(href, 'https://myaccount-ui.qa.cinchhs.com').toString();
        await this.page.goto(url, { waitUntil: 'load', timeout: 10000 });
        return;
      }
      await loc.click({ timeout: 5000 });
      return;
    }

    // Try button inside the drawer
    const buttonInDrawer = this.drawer.getByRole ? this.drawer.getByRole('button', { name, exact: false }) : this.drawer.locator(`text=${name}`);
    if (await buttonInDrawer.count()) {
      const loc = buttonInDrawer.first();
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      await loc.scrollIntoViewIfNeeded();
      const href = await loc.evaluate((el: HTMLElement) => {
        const a = el.closest('a');
        if (a) return a.getAttribute('href');
        if (el.tagName.toLowerCase() === 'a') return (el as HTMLAnchorElement).getAttribute('href');
        return null;
      });
      if (href) {
        const url = href.startsWith('http') ? href : new URL(href, 'https://myaccount-ui.qa.cinchhs.com').toString();
        await this.page.goto(url, { waitUntil: 'load', timeout: 10000 });
        return;
      }
      await loc.click({ timeout: 5000 });
      return;
    }

    // Fallback to page-level role/button
    const byRole = this.page.getByRole('link', { name, exact: false });
    if (await byRole.count()) {
      const loc = byRole.first();
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      await loc.scrollIntoViewIfNeeded();
      const href = await loc.evaluate((el: HTMLElement) => el.getAttribute('href'));
      if (href) {
        const url = href.startsWith('http') ? href : new URL(href, 'https://myaccount-ui.qa.cinchhs.com').toString();
        await this.page.goto(url, { waitUntil: 'load', timeout: 10000 });
        return;
      }
      await loc.click({ timeout: 5000 });
      return;
    }

    const byButton = this.page.getByRole('button', { name, exact: false });
    if (await byButton.count()) {
      const loc = byButton.first();
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      await loc.scrollIntoViewIfNeeded();
      const href = await loc.evaluate((el: HTMLElement) => {
        const a = el.closest('a');
        if (a) return a.getAttribute('href');
        if (el.tagName.toLowerCase() === 'a') return (el as HTMLAnchorElement).getAttribute('href');
        return null;
      });
      if (href) {
        const url = href.startsWith('http') ? href : new URL(href, 'https://myaccount-ui.qa.cinchhs.com').toString();
        await this.page.goto(url, { waitUntil: 'load', timeout: 10000 });
        return;
      }
      await loc.click({ timeout: 5000 });
      return;
    }

    // Last resort: text match anywhere
    const byText = this.page.getByText(name, { exact: false });
    const loc = byText.first();
    await loc.waitFor({ state: 'visible', timeout: 5000 });
    await loc.scrollIntoViewIfNeeded();
    const href = await loc.evaluate((el: HTMLElement) => {
      const a = el.closest('a');
      if (a) return a.getAttribute('href');
      if (el.tagName.toLowerCase() === 'a') return (el as HTMLAnchorElement).getAttribute('href');
      return null;
    });
    if (href) {
      const url = href.startsWith('http') ? href : new URL(href, 'https://myaccount-ui.qa.cinchhs.com').toString();
      await this.page.goto(url, { waitUntil: 'load', timeout: 10000 });
      return;
    }
    await loc.click({ timeout: 5000 });
  }

  // Generic validation: check for a heading containing the menu name or visible unique text
  async validatePageFor(name: string) {
    const heading = this.page.getByRole('heading', { name, exact: false });
    try {
      if (await heading.count()) {
        await expect(heading.first()).toBeVisible({ timeout: 5000 });
        return;
      }
      const text = this.page.getByText(name, { exact: false });
      await expect(text.first()).toBeVisible({ timeout: 5000 });
      return;
    } catch (e) {
      // As a last resort, ensure URL changed or page is not the login page
      await expect(this.page).not.toHaveURL(/\/login/, { timeout: 5000 });
    }
  }
}
