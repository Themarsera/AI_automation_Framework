import type { TestInfo } from '@playwright/test';
import type { TestRecord } from './data-providers/data-provider.interface';

function workerSlot(testInfo: TestInfo): string {
  return `w${testInfo.workerIndex}p${testInfo.parallelIndex}`;
}

function parallelSuffix(testInfo: TestInfo): string {
  const testIdPart = testInfo.testId.replace(/\W/g, '').slice(-6) || 'run';
  return `${workerSlot(testInfo)}-${testIdPart}`;
}

export function uniqueEmail(baseEmail: string, testInfo: TestInfo): string {
  const trimmed = baseEmail.trim();
  const at = trimmed.indexOf('@');
  const domain = at > 0 ? trimmed.slice(at + 1) : 'cinchhs.com';
  const local = at > 0 ? trimmed.slice(0, at) : trimmed;
  return `${local}+${workerSlot(testInfo)}@${domain}`;
}

/** Vary last 3 digits while keeping a valid 10-digit US phone number. */
export function uniquePhoneNumber(basePhone: string, testInfo: TestInfo): string {
  const digits = basePhone.replace(/\D/g, '');
  const prefix = (digits.length >= 7 ? digits.slice(0, 7) : '5127314').padEnd(7, '0');
  const slot = (testInfo.workerIndex * 137 + testInfo.parallelIndex * 17 + testInfo.retry) % 1000;
  return `${prefix}${String(slot).padStart(3, '0')}`;
}

/** Unique mailing address line for property / billing forms in parallel runs. */
export function uniqueStreetAddress(baseStreet: string, testInfo: TestInfo): string {
  const street = baseStreet.trim() || '100 Test Street';
  return `${street} Unit ${parallelSuffix(testInfo)}`;
}

/**
 * Clone Mongo enrollment data with worker-scoped email, phone, and address.
 * Apply to every full enrollment flow so CI parallel workers do not share identities.
 */
export function isolateEnrollmentRecord(record: TestRecord, testInfo: TestInfo): TestRecord {
  const isolated: TestRecord = { ...record };

  if (typeof isolated.email === 'string' && isolated.email.length > 0) {
    isolated.email = uniqueEmail(isolated.email, testInfo);
  }

  if (typeof isolated.phoneNumber === 'string' && isolated.phoneNumber.length > 0) {
    isolated.phoneNumber = uniquePhoneNumber(isolated.phoneNumber, testInfo);
  }

  if (typeof isolated.streetAddress2 === 'string' && isolated.streetAddress2.length > 0) {
    isolated.streetAddress2 = uniqueStreetAddress(isolated.streetAddress2, testInfo);
  }

  return isolated;
}
