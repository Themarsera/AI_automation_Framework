import { z } from 'zod';

/**
 * Validates the environment configuration so misconfiguration fails fast
 * (before a browser is launched) with a clear message instead of a mid-test error.
 * Unknown keys are passed through — this only guards the vars the framework relies on.
 */
const EnvSchema = z
  .object({
    TARGET_ENV: z.enum(['qa', 'preprod', 'prod']).default('qa'),
    DATA_SOURCE: z.enum(['mongo']).default('mongo'),
    WEB_BASE_URL: z.string().url().optional(),
    API_BASE_URL: z.string().url().optional(),
    MONGO_URI: z.string().optional(),
    MONGO_DB: z.string().optional(),
    MONGO_COLLECTION: z.string().optional(),
    // Java MongoConnectionData parity (used to build MONGO_URI when absent)
    dbhost: z.string().optional(),
    MONGODB_DB_NAME: z.string().optional(),
    MONGODB_COLLECTION_TEMPLATE: z.string().optional(),
  })
  .passthrough()
  .superRefine((env, ctx) => {
    const dataSource = (env.DATA_SOURCE ?? 'mongo').toLowerCase();
    if (dataSource === 'mongo') {
      if (!env.MONGO_URI && !env.dbhost) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'MONGO_URI (or dbhost + MONGODB_* parity vars) is required when DATA_SOURCE=mongo',
          path: ['MONGO_URI'],
        });
      }
      if (!env.MONGO_DB && !env.MONGODB_DB_NAME) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'MONGO_DB (or MONGODB_DB_NAME) is required when DATA_SOURCE=mongo',
          path: ['MONGO_DB'],
        });
      }
    }
    // MONGO_COLLECTION is optional — it defaults to `${TARGET_ENV}_ui`.
  });

export type ValidatedEnv = z.infer<typeof EnvSchema>;

/** Parse & validate `process.env`; throws a readable aggregated error on failure. */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): ValidatedEnv {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
