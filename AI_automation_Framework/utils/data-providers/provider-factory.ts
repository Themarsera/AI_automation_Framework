import { resolveMongoCollection } from '../../config';
import type { IDataProvider } from './data-provider.interface';
import { MongoProvider } from './mongo.provider';

let mongoSingleton: MongoProvider | null = null;

export async function closeDataProviderConnections(): Promise<void> {
  if (mongoSingleton) {
    await mongoSingleton.close();
    mongoSingleton = null;
  }
}

/**
 * Resolves Mongo connection settings, preferring explicit MONGO_URI/MONGO_DB/MONGO_COLLECTION
 * and falling back to the Java MongoConnectionData parity vars
 * (dbhost, MONGODB_PORT, MONGODB_USER, MONGODB_PASSWORD, MONGODB_DB_NAME, MONGODB_COLLECTION_TEMPLATE).
 */
function resolveMongoSettings(): { uri?: string; db?: string; collection?: string } {
  const db = process.env.MONGO_DB ?? process.env.MONGODB_DB_NAME;
  const collection = resolveMongoCollection();

  let uri = process.env.MONGO_URI;
  if (!uri && process.env.dbhost) {
    const host = process.env.dbhost;
    const port = process.env.MONGODB_PORT ?? '27017';
    const user = process.env.MONGODB_USER;
    const pass = process.env.MONGODB_PASSWORD;
    const authSource = process.env.MONGODB_AUTH_SOURCE ?? 'admin';
    const credentials =
      user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
    uri = `mongodb://${credentials}${host}:${port}/?authSource=${authSource}`;
  }

  return { uri, db, collection };
}

/** Creates the MongoDB data provider (singleton per process). */
export function createDataProvider(): IDataProvider {
  const { uri, db, collection } = resolveMongoSettings();
  if (!uri || !db || !collection) {
    throw new Error(
      'Mongo test data requires MONGO_URI/MONGO_DB (or Java-parity dbhost/MONGODB_* vars). ' +
        'Collection defaults to {TARGET_ENV}_ui when MONGO_COLLECTION is unset.'
    );
  }
  if (!mongoSingleton) {
    mongoSingleton = new MongoProvider(uri, db, collection);
  }
  return mongoSingleton;
}
