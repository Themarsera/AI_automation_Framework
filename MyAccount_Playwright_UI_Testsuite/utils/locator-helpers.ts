import type { Page, Locator } from 'playwright';

/**
 * Resolves elements marked with either `data-autoid` or legacy `data-auto-id`.
 */
export function byAutoid(root: Page | Locator, id: string): Locator {
  return root.locator(`[data-autoid="${id}"], [data-auto-id="${id}"]`).first();
}
