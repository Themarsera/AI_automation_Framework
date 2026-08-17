/** Failure categories shown in the Allure Categories widget (keep aligned with config/allure/categories.json). */
export const FAILURE_CATEGORIES = {
  testData: 'Test data issues',
  database: 'Database issues',
  api: 'API issues',
  locator: 'Locator issues',
  ui: 'UI issues',
  product: 'Product defects',
} as const;

export type FailureCategory = (typeof FAILURE_CATEGORIES)[keyof typeof FAILURE_CATEGORIES];

const TEST_DATA_PATTERN =
  /No test data|test data not found|testcaseData|Mongo test data requires|empty suite|No record found|dataProvider|suiteId|tcName/i;
const DATABASE_PATTERN =
  /MongoServerError|MongoNetworkError|MongoTimeoutError|MongoParseError|ECONNREFUSED.*27017|Server selection timed out|authentication failed/i;
const API_PATTERN =
  /apiRequestContext|APIRequestContext|Request failed with status code [45]\d\d|fetch failed|REST API|GraphQL|response\.json\(\)|status\s*:\s*[45]\d\d/i;
const LOCATOR_PATTERN =
  /TimeoutError.*locator|waiting for locator|locator\.(click|fill|waitFor)|strict mode violation|element\(s\) not found|getByRole|getByTestId|getByPlaceholder|data-autoid|toBeVisible\(\)|toBeEnabled\(\)|toHaveText\(\)|toContainText\(\)/i;
const UI_PATTERN =
  /page\.goto|waitForURL|Navigation timeout|504 Gateway|502 Bad Gateway|503 Service|net::ERR_|Loading page|Page crashed|Target closed|dialog|modal/i;

/** Infer a failure category from a Playwright/Node error for Allure labels and debugging. */
export function inferFailureCategory(error: unknown): FailureCategory {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const stack = error instanceof Error ? error.stack ?? '' : '';
  const combined = `${message}\n${stack}`;

  if (TEST_DATA_PATTERN.test(combined)) {
    return FAILURE_CATEGORIES.testData;
  }
  if (DATABASE_PATTERN.test(combined)) {
    return FAILURE_CATEGORIES.database;
  }
  if (API_PATTERN.test(combined)) {
    return FAILURE_CATEGORIES.api;
  }
  if (LOCATOR_PATTERN.test(combined)) {
    return FAILURE_CATEGORIES.locator;
  }
  if (UI_PATTERN.test(combined)) {
    return FAILURE_CATEGORIES.ui;
  }
  return FAILURE_CATEGORIES.product;
}
