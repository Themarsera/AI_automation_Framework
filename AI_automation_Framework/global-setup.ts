import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { getTargetEnv, loadConfig, resolveMongoCollection } from './config';
import { validateEnv } from './config/env-schema';

function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  // Fail fast on misconfiguration before any browser launches.
  const validated = validateEnv();
  if (!process.env.TARGET_ENV) {
    process.env.TARGET_ENV = validated.TARGET_ENV;
  }
  if (!process.env.DATA_SOURCE) {
    process.env.DATA_SOURCE = validated.DATA_SOURCE;
  }
  const cfg = loadConfig();
  process.env.WEB_BASE_URL = process.env.WEB_BASE_URL ?? cfg.webBaseUrl;
  process.env.API_BASE_URL = process.env.API_BASE_URL ?? cfg.apiBaseUrl;
  const targetEnv = getTargetEnv();
  const mongoDb = process.env.MONGO_DB ?? process.env.MONGODB_DB_NAME;
  const mongoCollection =
    (process.env.DATA_SOURCE ?? 'mongo').toLowerCase() === 'mongo' && mongoDb
      ? ` ${mongoDb}.${resolveMongoCollection()}`
      : '';
  console.log(
    `[global-setup] TARGET_ENV=${targetEnv} web=${process.env.WEB_BASE_URL} data=${process.env.DATA_SOURCE ?? 'mongo'}${mongoCollection}`
  );
}

export default globalSetup;
