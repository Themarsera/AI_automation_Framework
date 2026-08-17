import type { TestRecord } from './data-providers/data-provider.interface';

/**
 * Read a required string field from a MongoDB test record.
 * Fails fast when Generator/Healer forgot to seed data or field name is wrong.
 */
export function requireMongoString(
  record: TestRecord,
  key: string,
  suiteId?: string
): string {
  const value = record[key];
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(
      `MongoDB test data missing required field "${key}"` +
        (suiteId ? ` for tcName=${suiteId}` : '') +
        '. Healer: add patch entry in scripts/mongo/patch-mongo-missing-fields.js and run npm run mongo:patch' +
        (suiteId ? ` -- ${suiteId}` : '')
    );
  }
  return String(value);
}

/**
 * Read an optional string field; returns undefined when absent.
 */
export function optionalMongoString(record: TestRecord, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }
  return String(value);
}
