export type TestRecord = Record<string, unknown>;

export interface IDataProvider {
  getSuiteData(suiteId: string): Promise<TestRecord[]>;
  getRecordByKey(suiteId: string, key: string, value: unknown): Promise<TestRecord | undefined>;
}
