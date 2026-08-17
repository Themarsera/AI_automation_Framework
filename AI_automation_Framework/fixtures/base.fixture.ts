import { ApiFlowHelper } from '../api/helpers/api-flow-helper';
import { loadConfig } from '../config';
import { labelFailureCategory } from '../hooks/allure-helpers';
import { createDataProvider } from '../utils/data-providers';
import type { IDataProvider } from '../utils/data-providers';

import { testWithBrowserEnv } from './env.fixture';

type Fixtures = {
  api: ApiFlowHelper;
  dataProvider: IDataProvider;
};

testWithBrowserEnv.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus && testInfo.error) {
    await labelFailureCategory(testInfo.error);
  }
});

export const test = testWithBrowserEnv.extend<Fixtures>({
  api: async ({ request, apiAuth }, use) => {
    const config = loadConfig();
    await use(new ApiFlowHelper(request, config.apiBaseUrl, apiAuth));
  },
  dataProvider: async ({}, use) => {
    await use(createDataProvider());
  },
});

export { expect } from '@playwright/test';
