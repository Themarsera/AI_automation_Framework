import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { z } from 'zod';

const accessibilityScopeAttr = 'data-pw-fw-a11y-scope';

expect.extend({
  toMatchAPISchema(received: unknown, schema: z.ZodTypeAny) {
    const parsed = schema.safeParse(received);
    if (parsed.success) {
      return {
        pass: true,
        message: () => '',
        name: 'toMatchAPISchema',
      };
    }
    const issues =
      parsed.error.errors.map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`).join('; ') ||
      parsed.error.message;
    const preview =
      typeof received === 'object' && received !== null
        ? JSON.stringify(received).slice(0, 2500)
        : String(received).slice(0, 2500);

    return {
      pass: false,
      message: () => `${issues}\nactual (truncated): ${preview}`,
      name: 'toMatchAPISchema',
      actual: preview,
      expected: 'value matching Zod schema',
    };
  },

  async toBeAccessible(locator: Locator) {
    const page = locator.page();
    const target = locator.first();
    await target.scrollIntoViewIfNeeded();

    await target.evaluate(
      (el, attr: string) => el.setAttribute(attr, '1'),
      accessibilityScopeAttr
    );
    try {
      const results = await new AxeBuilder({ page })
        .include(`[${accessibilityScopeAttr}="1"]`)
        .analyze();

      if (results.violations.length === 0) {
        return { pass: true, message: () => '', name: 'toBeAccessible' };
      }
      const lines = results.violations.flatMap((v) =>
        v.nodes.map((n) => `- ${v.id}: ${v.description}\n  ${n.html}`)
      );
      const msg = `Axe accessibility violations (${results.violations.length}):\n${lines.slice(0, 30).join('\n')}`;
      return {
        pass: false,
        message: () => msg,
        name: 'toBeAccessible',
        actual: results.violations,
        expected: 'no axe violations in scoped subtree',
      };
    } finally {
      await target
        .evaluate(
          (el, attr: string) => el.removeAttribute(attr),
          accessibilityScopeAttr
        )
        .catch(() => undefined);
    }
  },
});

/**
 * Registers `toMatchAPISchema` (Zod) and `toBeAccessible` (Axe on locator subtree).
 * Pulled in via `fixtures/env.fixture` when you import `test`/`expect` from this package.
 */
