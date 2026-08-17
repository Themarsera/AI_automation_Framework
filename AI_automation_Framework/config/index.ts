import { qa } from './environments/qa';
import { preprod } from './environments/preprod';
import { prod } from './environments/prod';

export type AppConfig = {
  webBaseUrl: string;
  apiBaseUrl: string;
};

const envMap: Record<string, AppConfig> = {
  qa: { ...qa },
  preprod: { ...preprod },
  prod: { ...prod },
};

export type TargetEnv = keyof typeof envMap;

export function getTargetEnv(): TargetEnv {
  const env = (process.env.TARGET_ENV ?? 'qa').toLowerCase();
  if (env !== 'qa' && env !== 'preprod' && env !== 'prod') {
    throw new Error(`Unknown TARGET_ENV: ${env}. Use qa | preprod | prod`);
  }
  return env;
}

/** Mongo collection for UI test data — defaults to `{TARGET_ENV}_ui` (e.g. qa_ui). */
export function resolveMongoCollection(): string {
  const targetEnv = getTargetEnv();
  return (
    process.env.MONGO_COLLECTION ??
    process.env.MONGODB_COLLECTION_TEMPLATE ??
    `${targetEnv}_ui`
  );
}

export function loadConfig(): AppConfig {
  const base = envMap[getTargetEnv()];
  return {
    webBaseUrl: process.env.WEB_BASE_URL ?? base.webBaseUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? base.apiBaseUrl,
  };
}
