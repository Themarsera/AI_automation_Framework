import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { getTargetEnv, loadConfig, resolveMongoCollection } from '../../config';

const ALLURE_RESULTS_DIR = path.resolve(process.cwd(), 'allure-results');
const CATEGORIES_SOURCE = path.resolve(process.cwd(), 'config/allure/categories.json');

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function buildEnvironmentProperties(): string {
  const targetEnv = getTargetEnv();
  const cfg = loadConfig();
  const dataSource = (process.env.DATA_SOURCE ?? 'mongo').toLowerCase();
  const mongoDb = process.env.MONGO_DB ?? process.env.MONGODB_DB_NAME ?? 'appdev_customer';
  const mongoCollection = resolveMongoCollection();
  const browserProject = process.env.PW_PROJECT?.trim() || process.env.PLAYWRIGHT_PROJECT?.trim() || 'chromium';
  const tagFilter = process.env.PLAYWRIGHT_TAG?.trim();
  const workers = process.env.PW_WORKERS?.trim();

  const entries: Record<string, string> = {
    Environment: targetEnv.toUpperCase(),
    'Target Env': targetEnv,
    'Data Source': dataSource,
    'Web Base URL': process.env.WEB_BASE_URL ?? cfg.webBaseUrl,
    'API Base URL': process.env.API_BASE_URL ?? cfg.apiBaseUrl,
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

  return `${Object.entries(entries)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
}

/** Writes Allure environment metadata and failure categories into allure-results (qa | preprod | prod). */
export function writeAllureReportMetadata(): void {
  ensureDir(ALLURE_RESULTS_DIR);

  if (existsSync(CATEGORIES_SOURCE)) {
    copyFileSync(CATEGORIES_SOURCE, path.join(ALLURE_RESULTS_DIR, 'categories.json'));
  }

  const environmentContent = buildEnvironmentProperties();
  writeFileSync(path.join(ALLURE_RESULTS_DIR, 'environment.properties'), environmentContent, 'utf8');

  if (process.env.CI === 'true') {
    writeFileSync(path.resolve(process.cwd(), 'environment.properties'), environmentContent, 'utf8');
  }
}
