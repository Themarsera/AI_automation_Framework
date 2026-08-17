import type { APIResponse } from '@playwright/test';
import { z, type ZodTypeAny } from 'zod';

/**
 * Parses a JSON HTTP body and validates against a Zod schema.
 * Use with {@link ApiFlowHelper#getJsonValidating}, or the custom `expect(payload).toMatchAPISchema(schema)` matcher.
 */
export async function parseResponseJsonWithSchema<T extends ZodTypeAny>(
  res: APIResponse,
  schema: T
): Promise<z.output<T>> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    throw new Error(`Response is not JSON: ${text.slice(0, 800)}`);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg =
      parsed.error.errors.map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`).join('; ') ||
      parsed.error.message;
    throw new Error(`API schema validation failed: ${msg}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parsed.data;
}
