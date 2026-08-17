#!/usr/bin/env node
/**
 * Refreshes Allure environment.properties and categories.json in allure-results.
 * Used before local `npm run allure:generate` when tests were not re-run.
 * Keep property keys aligned with utils/allure/report-metadata.ts.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allureResultsDir = path.join(root, 'allure-results');
const categoriesSource = path.join(root, 'config/allure/categories.json');

const targetEnv = (process.env.TARGET_ENV ?? 'qa').toLowerCase();
const dataSource = (process.env.DATA_SOURCE ?? 'mongo').toLowerCase();
const mongoDb = process.env.MONGO_DB ?? process.env.MONGODB_DB_NAME ?? 'appdev_customer';
const mongoCollection =
  process.env.MONGO_COLLECTION ??
  process.env.MONGODB_COLLECTION_TEMPLATE ??
  `${targetEnv}_ui`;
const browserProject = process.env.PW_PROJECT?.trim() || process.env.PLAYWRIGHT_PROJECT?.trim() || 'chromium';
const tagFilter = process.env.PLAYWRIGHT_TAG?.trim();
const workers = process.env.PW_WORKERS?.trim();

const webBaseUrls = {
  qa: 'https://myaccount-ui.qa.cinchhs.com',
  preprod: 'https://myaccount-ui.preprod.cinchhs.com',
  prod: 'https://myaccount.cinchhomeservices.com',
};
const apiBaseUrls = {
  qa: 'https://myaccount-ui.qa.cinchhs.com',
  preprod: 'https://myaccount-ui.preprod.cinchhs.com',
  prod: 'https://myaccount.cinchhomeservices.com',
};

const entries = {
  Environment: targetEnv.toUpperCase(),
  'Target Env': targetEnv,
  'Data Source': dataSource,
  'Web Base URL': process.env.WEB_BASE_URL ?? webBaseUrls[targetEnv] ?? webBaseUrls.qa,
  'API Base URL': process.env.API_BASE_URL ?? apiBaseUrls[targetEnv] ?? apiBaseUrls.qa,
  Browser: browserProject,
  CI: process.env.CI === 'true' ? 'true' : 'false',
};

if (dataSource === 'mongo') {
  entries['Mongo Database'] = mongoDb;
  entries['Mongo Collection'] = mongoCollection;
}
if (tagFilter) {
  entries['Test Tag Filter'] = tagFilter.startsWith('@') ? tagFilter : `@${tagFilter}`;
}
if (workers) {
  entries.Workers = workers;
}
if (process.env.BUILD_NUMBER) {
  entries['Build Number'] = process.env.BUILD_NUMBER;
}
if (process.env.BUILD_URL) {
  entries['Build URL'] = process.env.BUILD_URL;
}

mkdirSync(allureResultsDir, { recursive: true });

if (existsSync(categoriesSource)) {
  copyFileSync(categoriesSource, path.join(allureResultsDir, 'categories.json'));
}

const environmentContent = `${Object.entries(entries)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}\n`;

writeFileSync(path.join(allureResultsDir, 'environment.properties'), environmentContent, 'utf8');

if (process.env.CI === 'true') {
  writeFileSync(path.join(root, 'environment.properties'), environmentContent, 'utf8');
}

console.log(`[allure] Wrote environment (${targetEnv.toUpperCase()}) and categories to ${allureResultsDir}`);
