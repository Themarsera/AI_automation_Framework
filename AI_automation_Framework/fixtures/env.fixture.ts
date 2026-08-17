import { existsSync } from 'node:fs';
import path from 'node:path';
import { test as base } from '@playwright/test';

import type { Auth } from '../api/clients/rest.client';
import { getEnvApiAuth } from '../utils/secrets';
import '../utils/register-expect-extensions';

export const testWithBrowserEnv = base.extend<{
  /** Default API auth from env (`API_BEARER_TOKEN`, `API_BASIC_*`, `API_OAUTH2_ACCESS_TOKEN`). */
  apiAuth: Auth | undefined;
}>({
  launchOptions: async ({}, use) => {
    const slowMo = Number(process.env.PW_SLOW_MO ?? '');
    const channel = process.env.PW_CHANNEL?.trim();
    const headed = process.env.PW_HEADED === '1' || process.env.PW_HEADED === 'true';
    await use({
      ...(Number.isFinite(slowMo) && slowMo > 0 ? { slowMo } : {}),
      ...(channel ? { channel } : {}),
      ...(headed ? { headless: false } : {}),
    });
  },

  contextOptions: async ({}, use) => {
    const raw =
      process.env.STORAGE_STATE_PATH?.trim() || process.env.PLAYWRIGHT_STORAGE_STATE?.trim();
    let storage: string | undefined;
    if (raw) {
      const abs = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
      if (existsSync(abs)) {
        storage = abs;
      }
    }

    const w = Number(process.env.PW_VIEWPORT_WIDTH ?? 1280);
    const h = Number(process.env.PW_VIEWPORT_HEIGHT ?? 720);

    await use({
      ...(storage ? { storageState: storage } : {}),
      viewport: {
        width: Number.isFinite(w) ? w : 1280,
        height: Number.isFinite(h) ? h : 720,
      },
      locale: process.env.PW_LOCALE?.trim() || 'en-US',
      ...(process.env.PW_TIMEZONE?.trim()
        ? { timezoneId: process.env.PW_TIMEZONE.trim() }
        : {}),
      ignoreHTTPSErrors: process.env.PW_IGNORE_HTTPS_ERRORS === '1',
    });
  },

  apiAuth: async ({}, use) => {
    await use(getEnvApiAuth());
  },
});
