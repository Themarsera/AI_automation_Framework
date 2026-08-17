import type { Dialog, FrameLocator, Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { TIMEOUTS } from './constants/timeouts';

export type LocatorScope = Page | FrameLocator;

export type PlaywrightHelperOptions = {
  timeoutMs?: number;
  useAllureSteps?: boolean;
};

function resolveDefaultTimeoutMs(): number {
  const msRaw = process.env.EXPLICIT_WAIT_MS?.trim();
  if (msRaw && /^\d+$/.test(msRaw)) { return parseInt(msRaw, 10); }
  const secRaw = process.env.EXPLICIT_WAIT_SECONDS?.trim();
  if (secRaw && /^\d+$/.test(secRaw)) { return parseInt(secRaw, 10) * 1000; }
  return TIMEOUTS.standard;
}

/**
 * Reusable waits and interactions wrapping Playwright's native API.
 * Prefer native Playwright locators in page objects; use this helper for
 * complex interactions (iframes, dialogs, network hooks, polls).
 */
export class PlaywrightHelper {
  private readonly timeoutMs: number;
  private readonly useSteps: boolean;

  constructor(
    private readonly page: Page,
    private readonly scope: LocatorScope = page,
    options?: PlaywrightHelperOptions
  ) {
    this.timeoutMs = options?.timeoutMs ?? resolveDefaultTimeoutMs();
    this.useSteps = options?.useAllureSteps ?? true;
  }

  getPage(): Page { return this.page; }
  getScope(): LocatorScope { return this.scope; }
  getTimeoutMs(): number { return this.timeoutMs; }

  forFrame(selector: string): PlaywrightHelper {
    return new PlaywrightHelper(this.page, this.scope.frameLocator(selector), {
      timeoutMs: this.timeoutMs,
      useAllureSteps: this.useSteps,
    });
  }

  forFrames(selectors: string[]): PlaywrightHelper {
    if (selectors.length === 0) { return this; }
    return selectors.reduce<PlaywrightHelper>((h, sel) => h.forFrame(sel), this);
  }

  forFrameFromLocator(iframeLocator: Locator | string): PlaywrightHelper {
    const frameRoot = this.resolve(iframeLocator).contentFrame();
    return new PlaywrightHelper(this.page, frameRoot, {
      timeoutMs: this.timeoutMs,
      useAllureSteps: this.useSteps,
    });
  }

  getFrameLocator(selector: string): FrameLocator {
    return this.scope.frameLocator(selector);
  }

  forFrameBySrcContains(srcFragment: string): PlaywrightHelper {
    const safe = srcFragment.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return this.forFrame(`iframe[src*='${safe}']`);
  }

  async waitForFrame(
    selector: string,
    options?: { state?: 'attached' | 'visible' }
  ): Promise<PlaywrightHelper> {
    const state = options?.state ?? 'attached';
    return this.step(`Wait for frame ${selector}`, async () => {
      await this.scope.locator(selector).first().waitFor({ state, timeout: this.timeoutMs });
      return this.forFrame(selector);
    });
  }

  async waitForFrameFromLocator(
    iframeLocator: Locator | string,
    options?: { state?: 'attached' | 'visible' }
  ): Promise<PlaywrightHelper> {
    const state = options?.state ?? 'attached';
    return this.step('Wait for frame from locator', async () => {
      const loc = this.resolve(iframeLocator).first();
      await loc.waitFor({ state, timeout: this.timeoutMs });
      return this.forFrameFromLocator(loc);
    });
  }

  resolve(locator: Locator | string): Locator {
    return typeof locator === 'string' ? this.scope.locator(locator) : locator;
  }

  getByLabel(text: string, exact = false): Locator {
    return this.scope.getByLabel(text, { exact });
  }

  private async step<T>(name: string, body: () => Promise<T>): Promise<T> {
    if (!this.useSteps) { return body(); }
    return test.step(name, body);
  }

  async waitForVisible(locator: Locator | string): Promise<Locator> {
    const loc = this.resolve(locator);
    await loc.waitFor({ state: 'visible', timeout: this.timeoutMs });
    return loc;
  }

  async waitForPresence(locator: Locator | string): Promise<Locator> {
    const loc = this.resolve(locator);
    await loc.waitFor({ state: 'attached', timeout: this.timeoutMs });
    return loc;
  }

  async waitForElement(
    locator: Locator | string,
    kind: 'visible' | 'attached' = 'visible'
  ): Promise<Locator> {
    return kind === 'attached' ? this.waitForPresence(locator) : this.waitForVisible(locator);
  }

  async waitForInvisible(locator: Locator | string): Promise<boolean> {
    const loc = this.resolve(locator);
    await loc.waitFor({ state: 'hidden', timeout: this.timeoutMs });
    return true;
  }

  async waitForClickable(locator: Locator | string): Promise<Locator> {
    const loc = await this.waitForVisible(locator);
    await expect(loc).toBeEnabled({ timeout: this.timeoutMs });
    return loc;
  }

  async click(locator: Locator | string): Promise<void> {
    await this.step(`Click ${String(locator)}`, async () => {
      const loc = await this.waitForClickable(locator);
      await loc.click({ timeout: this.timeoutMs });
    });
  }

  async clickWithJavaScript(locator: Locator | string): Promise<void> {
    await this.step(`JS click ${String(locator)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.evaluate((el: HTMLElement) => el.click());
    });
  }

  async scrollIntoViewAndClick(locator: Locator | string): Promise<void> {
    await this.step(`Scroll into view and click ${String(locator)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.scrollIntoViewIfNeeded({ timeout: this.timeoutMs });
      await loc.click({ timeout: this.timeoutMs });
    });
  }

  async doubleClick(locator: Locator | string): Promise<void> {
    await this.step(`Double-click ${String(locator)}`, async () => {
      const loc = await this.waitForClickable(locator);
      await loc.dblclick({ timeout: this.timeoutMs });
    });
  }

  async hoverOver(locator: Locator | string): Promise<void> {
    await this.step(`Hover ${String(locator)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.hover({ timeout: this.timeoutMs });
    });
  }

  async rightClick(locator: Locator | string): Promise<void> {
    await this.step(`Right-click ${String(locator)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.click({ button: 'right', timeout: this.timeoutMs });
    });
  }

  async gotoUrl(url: string): Promise<void> {
    await this.page.goto(url, { timeout: this.timeoutMs });
  }

  async verifyTextVisible(text: string): Promise<void> {
    await this.page.getByText(text, { exact: false }).first().waitFor({
      state: 'visible',
      timeout: this.timeoutMs,
    });
  }

  async clearAndType(locator: Locator | string, text: string | null): Promise<void> {
    await this.step(`Clear and type into ${String(locator)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.fill(text ?? '', { timeout: this.timeoutMs });
    });
  }

  async clearAndTypeTab(locator: Locator | string, text: string | null): Promise<void> {
    await this.clearAndType(locator, text);
    const loc = await this.waitForVisible(locator);
    await loc.press('Tab');
  }

  async fillForm(
    entries: readonly { locator: Locator | string; value: string; skipWait?: boolean }[]
  ): Promise<void> {
    await this.step('Fill form fields', async () => {
      for (const e of entries) {
        const loc = e.skipWait ? this.resolve(e.locator) : await this.waitForVisible(e.locator);
        await loc.fill(e.value, { timeout: this.timeoutMs });
      }
    });
  }

  async type(locator: Locator | string, text: string | null): Promise<void> {
    await this.step(`Type into ${String(locator)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.pressSequentially(text ?? '', { timeout: this.timeoutMs });
    });
  }

  async getText(locator: Locator | string): Promise<string> {
    const loc = await this.waitForVisible(locator);
    return (await loc.innerText()).trim();
  }

  async getAttribute(locator: Locator | string, name: string): Promise<string | null> {
    const loc = await this.waitForVisible(locator);
    return loc.getAttribute(name);
  }

  async isDisplayed(locator: Locator | string): Promise<boolean> {
    try {
      return await this.resolve(locator).isVisible();
    } catch {
      return false;
    }
  }

  async selectByVisibleText(locator: Locator | string, visibleText: string): Promise<void> {
    await this.step(`Select by visible text: ${visibleText}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.selectOption({ label: visibleText }, { timeout: this.timeoutMs });
    });
  }

  async selectByValue(locator: Locator | string, value: string): Promise<void> {
    await this.step(`Select by value: ${value}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.selectOption({ value }, { timeout: this.timeoutMs });
    });
  }

  async selectByIndex(locator: Locator | string, index: number): Promise<void> {
    const loc = await this.waitForVisible(locator);
    await loc.selectOption({ index }, { timeout: this.timeoutMs });
  }

  async getAllSelectedOptionsText(locator: Locator | string): Promise<string[]> {
    const loc = await this.waitForVisible(locator);
    return loc.evaluate((el: HTMLSelectElement) =>
      Array.from(el.selectedOptions).map((o) => (o.textContent ?? '').trim())
    );
  }

  async selectByPartialText(locator: Locator | string, partialVisibleText: string): Promise<void> {
    const loc = await this.waitForVisible(locator);
    const matched = await loc.evaluate((el: HTMLSelectElement, partial: string) => {
      const opts = Array.from(el.options);
      const idx = opts.findIndex((o) => (o.text ?? '').includes(partial));
      return idx >= 0 ? opts[idx].value : null;
    }, partialVisibleText);
    if (matched === null) {
      throw new Error(`No option containing: ${partialVisibleText}`);
    }
    await loc.selectOption({ value: matched }, { timeout: this.timeoutMs });
  }

  atRoot(): PlaywrightHelper {
    return new PlaywrightHelper(this.page, this.page, {
      timeoutMs: this.timeoutMs,
      useAllureSteps: this.useSteps,
    });
  }

  async waitForUrlContains(fragment: string): Promise<boolean> {
    await this.page.waitForURL((url) => url.toString().includes(fragment), {
      timeout: this.timeoutMs,
    });
    return true;
  }

  async waitForTitleContains(fragment: string): Promise<boolean> {
    await this.page.waitForFunction(
      (f: string) => document.title.includes(f),
      fragment,
      { timeout: this.timeoutMs }
    );
    return true;
  }

  async waitForDocumentReady(): Promise<void> {
    await this.page.waitForFunction(() => document.readyState === 'complete', {
      timeout: this.timeoutMs,
    });
  }

  async acceptAlertAfter(trigger: () => Promise<void>): Promise<void> {
    await this.step('Accept browser alert', async () => {
      const dialogPromise = this.page.waitForEvent('dialog', { timeout: this.timeoutMs });
      await trigger();
      const dialog = await dialogPromise;
      await dialog.accept();
    });
  }

  async dismissAlertAfter(trigger: () => Promise<void>): Promise<void> {
    await this.step('Dismiss browser alert', async () => {
      const dialogPromise = this.page.waitForEvent('dialog', { timeout: this.timeoutMs });
      await trigger();
      const dialog = await dialogPromise;
      await dialog.dismiss();
    });
  }

  async getAlertTextAfter(trigger: () => Promise<void>): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: this.timeoutMs });
    await trigger();
    const dialog = await dialogPromise;
    const msg = dialog.message();
    await dialog.accept();
    return msg;
  }

  waitForDialog(): Promise<Dialog> {
    return this.page.waitForEvent('dialog', { timeout: this.timeoutMs });
  }

  async acceptDialog(dialog: Dialog): Promise<void> {
    await dialog.accept();
  }

  async dismissDialog(dialog: Dialog): Promise<void> {
    await dialog.dismiss();
  }

  async pressEnter(locator: Locator | string): Promise<void> {
    const loc = await this.waitForVisible(locator);
    await loc.press('Enter');
  }

  async pressTab(locator: Locator | string): Promise<void> {
    const loc = await this.waitForVisible(locator);
    await loc.press('Tab');
  }

  getByRole(...args: Parameters<Page['getByRole']>): Locator {
    return (this.scope as unknown as Page).getByRole(...args);
  }

  getByPlaceholder(text: string | RegExp, exact?: boolean): Locator {
    return this.scope.getByPlaceholder(text, { exact });
  }

  getByTestId(testId: string | RegExp): Locator {
    return this.scope.getByTestId(testId);
  }

  getByTitle(title: string | RegExp, exact?: boolean): Locator {
    return this.scope.getByTitle(title, { exact });
  }

  getByAltText(text: string | RegExp, exact?: boolean): Locator {
    return this.scope.getByAltText(text, { exact });
  }

  getByText(text: string | RegExp, exact?: boolean): Locator {
    return this.scope.getByText(text, { exact });
  }

  locator(selector: string): Locator {
    return this.scope.locator(selector);
  }

  async reload(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    await this.page.reload({
      timeout: this.timeoutMs,
      waitUntil: options?.waitUntil ?? 'load',
    });
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ timeout: this.timeoutMs });
  }

  async goForward(): Promise<void> {
    await this.page.goForward({ timeout: this.timeoutMs });
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    await this.page.waitForLoadState(state, { timeout: this.timeoutMs });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url, { timeout: this.timeoutMs });
  }

  async press(locator: Locator | string, key: string): Promise<void> {
    const loc = await this.waitForVisible(locator);
    await loc.press(key);
  }

  async keyboardPress(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async focus(locator: Locator | string): Promise<void> {
    await this.resolve(locator).focus({ timeout: this.timeoutMs });
  }

  async blur(locator: Locator | string): Promise<void> {
    await this.resolve(locator).evaluate((el: HTMLElement) => el.blur());
  }

  async clear(locator: Locator | string): Promise<void> {
    await this.resolve(locator).fill('', { timeout: this.timeoutMs });
  }

  async selectAll(locator: Locator | string): Promise<void> {
    const loc = await this.waitForVisible(locator);
    const meta = process.platform === 'darwin';
    await loc.press(meta ? 'Meta+A' : 'Control+A');
  }

  async check(locator: Locator | string): Promise<void> {
    await this.step(`Check ${String(locator)}`, async () => {
      await this.resolve(locator).check({ timeout: this.timeoutMs });
    });
  }

  async uncheck(locator: Locator | string): Promise<void> {
    await this.step(`Uncheck ${String(locator)}`, async () => {
      await this.resolve(locator).uncheck({ timeout: this.timeoutMs });
    });
  }

  async setChecked(locator: Locator | string, checked: boolean): Promise<void> {
    await this.resolve(locator).setChecked(checked, { timeout: this.timeoutMs });
  }

  async isChecked(locator: Locator | string): Promise<boolean> {
    return this.resolve(locator).isChecked();
  }

  async uploadFiles(locator: Locator | string, files: string | string[]): Promise<void> {
    await this.step(`Upload files ${String(files)}`, async () => {
      const loc = await this.waitForVisible(locator);
      await loc.setInputFiles(files);
    });
  }

  async dragAndDrop(source: Locator | string, target: Locator | string): Promise<void> {
    await this.step('Drag and drop', async () => {
      await this.resolve(source).dragTo(this.resolve(target), { timeout: this.timeoutMs });
    });
  }

  async tap(locator: Locator | string): Promise<void> {
    await this.resolve(locator).tap({ timeout: this.timeoutMs });
  }

  async scrollPage(deltaY: number, deltaX = 0): Promise<void> {
    await this.page.mouse.wheel(deltaX, deltaY);
  }

  async scrollElementBy(locator: Locator | string, deltaY: number): Promise<void> {
    await this.resolve(locator).evaluate(
      (el, dy: number) => el.scrollBy(0, dy),
      deltaY
    );
  }

  async waitForDetached(locator: Locator | string): Promise<void> {
    await this.resolve(locator).waitFor({ state: 'detached', timeout: this.timeoutMs });
  }

  async waitForHidden(locator: Locator | string): Promise<void> {
    await this.resolve(locator).waitFor({ state: 'hidden', timeout: this.timeoutMs });
  }

  async waitForEnabled(locator: Locator | string): Promise<void> {
    await expect(this.resolve(locator)).toBeEnabled({ timeout: this.timeoutMs });
  }

  async waitForDisabled(locator: Locator | string): Promise<void> {
    await expect(this.resolve(locator)).toBeDisabled({ timeout: this.timeoutMs });
  }

  async waitForEditable(locator: Locator | string): Promise<void> {
    await expect(this.resolve(locator)).toBeEditable({ timeout: this.timeoutMs });
  }

  async waitForMinCount(locator: Locator | string, min: number): Promise<void> {
    await expect(async () => {
      expect(await this.resolve(locator).count()).toBeGreaterThanOrEqual(min);
    }).toPass({ timeout: this.timeoutMs });
  }

  async waitForText(locator: Locator | string, text: string | RegExp): Promise<void> {
    await expect(this.resolve(locator)).toContainText(text, { timeout: this.timeoutMs });
  }

  async waitForAttribute(locator: Locator | string, name: string, value?: string | RegExp): Promise<void> {
    const loc = this.resolve(locator);
    if (value === undefined) {
      await expect.poll(async () => await loc.getAttribute(name), { timeout: this.timeoutMs }).not.toBeNull();
      return;
    }
    await expect(loc).toHaveAttribute(name, value, { timeout: this.timeoutMs });
  }

  async innerHtml(locator: Locator | string): Promise<string> {
    return this.resolve(locator).innerHTML();
  }

  async inputValue(locator: Locator | string): Promise<string> {
    return this.resolve(locator).inputValue();
  }

  async hasClass(locator: Locator | string, className: string): Promise<boolean> {
    const cls = await this.getAttribute(locator, 'class');
    return cls?.split(/\s+/).includes(className) ?? false;
  }

  async selectMultipleByLabel(locator: Locator | string, labels: string[]): Promise<void> {
    const loc = await this.waitForVisible(locator);
    await loc.selectOption(labels.map((label) => ({ label })), { timeout: this.timeoutMs });
  }

  async waitForResponseMatching(
    urlPredicate: string | RegExp | ((url: string) => boolean),
    trigger: () => Promise<void>
  ): Promise<import('@playwright/test').Response> {
    const pred =
      typeof urlPredicate === 'function'
        ? urlPredicate
        : urlPredicate instanceof RegExp
          ? (u: string) => urlPredicate.test(u)
          : (u: string) => u.includes(urlPredicate);
    const responsePromise = this.page.waitForResponse(
      (r) => pred(r.url()),
      { timeout: this.timeoutMs }
    );
    await trigger();
    return responsePromise;
  }

  async waitForRequestMatching(
    urlPredicate: string | RegExp | ((url: string) => boolean),
    trigger: () => Promise<void>
  ): Promise<import('@playwright/test').Request> {
    const pred =
      typeof urlPredicate === 'function'
        ? urlPredicate
        : urlPredicate instanceof RegExp
          ? (u: string) => urlPredicate.test(u)
          : (u: string) => u.includes(urlPredicate);
    const reqPromise = this.page.waitForRequest((r) => pred(r.url()), { timeout: this.timeoutMs });
    await trigger();
    return reqPromise;
  }

  async waitForPopup(trigger: () => Promise<void>): Promise<PlaywrightHelper> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: this.timeoutMs });
    await trigger();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    return new PlaywrightHelper(popup, popup, {
      timeoutMs: this.timeoutMs,
      useAllureSteps: this.useSteps,
    });
  }

  async downloadWhen(trigger: () => Promise<void>): Promise<import('@playwright/test').Download> {
    const dl = this.page.waitForEvent('download', { timeout: this.timeoutMs });
    await trigger();
    return dl;
  }

  async screenshotPage(options?: { path?: string; fullPage?: boolean }): Promise<Buffer> {
    return this.page.screenshot({
      path: options?.path,
      fullPage: options?.fullPage ?? true,
      timeout: this.timeoutMs,
    });
  }

  async screenshotElement(locator: Locator | string, path?: string): Promise<Buffer> {
    const loc = await this.waitForVisible(locator);
    return loc.screenshot({ path, timeout: this.timeoutMs });
  }

  async execJs<R>(fn: () => R): Promise<R> {
    return this.page.evaluate(fn);
  }

  async execJsArg<R>(fn: (arg: unknown) => R, arg: unknown): Promise<R> {
    return this.page.evaluate(fn as never, arg);
  }

  async execJsLocator<R>(
    locator: Locator | string,
    fn: (el: HTMLElement) => R
  ): Promise<R> {
    return this.resolve(locator).evaluate(fn);
  }

  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  forPage(targetPage: Page): PlaywrightHelper {
    return new PlaywrightHelper(targetPage, targetPage, {
      timeoutMs: this.timeoutMs,
      useAllureSteps: this.useSteps,
    });
  }

  pages(): Page[] {
    return this.page.context().pages();
  }

  async bringToFront(): Promise<void> {
    await this.page.bringToFront();
  }
}
