import { attachment, epic, feature, step } from 'allure-js-commons';
import type { TestInfo } from '@playwright/test';
import { getTargetEnv, resolveMongoCollection } from '../config';
import type { IDataProvider, TestRecord } from '../utils/data-providers/data-provider.interface';
import { isolateEnrollmentRecord } from '../utils/parallel-test-data';

export interface MongoSuiteConfig {
  /** Default tcName; overridden by MONGO_SAMPLE_SUITE_ID when set. */
  suiteId: string;
  /** Applied automatically before each test when provided. */
  epic?: string;
  feature?: string;
}

export type MongoSuiteFixtures = {
  suiteData: TestRecord;
};

/**
 * Loads MongoDB suite data inside an Allure step (runs before the test body via fixture).
 */
export async function loadMongoSuiteData(
  dataProvider: IDataProvider,
  suiteId: string
): Promise<TestRecord> {
  const resolvedId = process.env.MONGO_SAMPLE_SUITE_ID ?? suiteId;
  const targetEnv = getTargetEnv();
  const mongoCollection = resolveMongoCollection();
  const mongoDb = process.env.MONGO_DB ?? process.env.MONGODB_DB_NAME ?? 'appdev_customer';

  let data: TestRecord | undefined;

  await step(`Load MongoDB test data (${resolvedId})`, async () => {
    await attachment(
      'MongoDB source',
      `Reading from ${mongoDb}.${mongoCollection} (env=${targetEnv}, tcName=${resolvedId})`,
      'text/plain'
    );

    const records = await dataProvider.getSuiteData(resolvedId);
    data = records[0];

    if (!data) {
      throw new Error(
        `No MongoDB test data found for tcName=${resolvedId} in ${mongoDb}.${mongoCollection}. ` +
          `Ensure DATA_SOURCE=mongo and test data exists in MongoDB.`
      );
    }

    await attachment('MongoDB data', 'Test data loaded successfully', 'text/plain');
  });

  return data!;
}

/**
 * Loads Mongo suite data and applies parallel-safe email/phone/address isolation.
 */
export async function loadIsolatedMongoSuiteData(
  dataProvider: IDataProvider,
  suiteId: string,
  testInfo: TestInfo
): Promise<TestRecord> {
  const data = await loadMongoSuiteData(dataProvider, suiteId);
  return isolateEnrollmentRecord(data, testInfo);
}

/**
 * Playwright fixture factory — fetches Mongo data before each test and optionally sets Allure labels.
 *
 * @example
 * const test = base.extend({ ...pages }).extend(mongoSuiteDataFixture({ suiteId: 'C171750' }));
 * test('...', async ({ suiteData }) => { const data = suiteData; });
 */
export function mongoSuiteDataFixture(config: MongoSuiteConfig) {
  return {
    suiteData: async (
      { dataProvider }: { dataProvider: IDataProvider },
      use: (data: TestRecord) => Promise<void>,
      testInfo: TestInfo
    ) => {
      if (config.epic && config.feature) {
        await epic(config.epic);
        await feature(config.feature);
      }

      const data = await loadMongoSuiteData(dataProvider, config.suiteId);
      await use(isolateEnrollmentRecord(data, testInfo));
    },
  };
}
