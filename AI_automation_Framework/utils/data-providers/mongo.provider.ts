import { MongoClient } from 'mongodb';
import type { IDataProvider, TestRecord } from './data-provider.interface';

/**
 * Documents are expected to include `tcName` or `suiteId` matching the requested suite.
 * Shape: { tcName: string, testcaseData: TestRecord[] } or flat { suiteId: string, ...fields }
 */
export class MongoProvider implements IDataProvider {
  private client: MongoClient | null = null;

  constructor(
    private readonly uri: string,
    private readonly dbName: string,
    private readonly collectionName: string
  ) {}

  private async getCollection() {
    if (!this.client) {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
    }
    return this.client.db(this.dbName).collection(this.collectionName);
  }

  async getSuiteData(suiteId: string): Promise<TestRecord[]> {
    const col = await this.getCollection();

    const doc = await col.findOne({
      $or: [
        { suiteId: suiteId },
        { tcName: suiteId },
      ],
    });

    if (!doc) {
      return [];
    }

    // If data is nested in testcaseData or records array, merge shared parent fields into each record.
    const nestedRecords = Array.isArray(doc.testcaseData)
      ? doc.testcaseData
      : Array.isArray(doc.records)
        ? doc.records
        : null;

    if (nestedRecords) {
      const { _id, testcaseData: _testcaseData, records: _records, ...parentFields } = doc;
      const metadataKeys = new Set(['appName', 'envName', 'tcName', 'suiteId']);
      const shared = Object.fromEntries(
        Object.entries(parentFields).filter(([key]) => !metadataKeys.has(key))
      );

      return (nestedRecords as TestRecord[]).map((record) => ({
        ...shared,
        ...record,
      }));
    }

    const { _id, ...rest } = doc;
    return [rest as TestRecord];
  }

  async getRecordByKey(suiteId: string, key: string, value: unknown): Promise<TestRecord | undefined> {
    const col = await this.getCollection();
    const doc = await col.findOne({ suiteId, [key]: value });
    if (!doc) {
      return undefined;
    }
    const { _id, ...rest } = doc;
    return rest as TestRecord;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}
