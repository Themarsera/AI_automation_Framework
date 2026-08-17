# Standard Test Data Rules — MyAccount UI

Authoritative rules for how test data is stored, named, and consumed. AI agents (Planner, Generator, Healer) and engineers MUST follow these rules.

---

## 1. Primary Data Source

- **Credentials and user data**: `test-credentials.json` at repo root (gitignored).
- **Mongo test data** (service request flows, plan data): MongoDB via `DATA_SOURCE=mongo` in `.env`.
- Never commit real credentials or PII. All connection values live in the gitignored `.env`.

---

## 2. Credential Loading Pattern

```typescript
// tests/testCredentials.ts
import credentials from '../test-credentials.json';

export function getTestCredentials() {
  return {
    user: process.env.TEST_EMAIL ?? credentials.user,
    pass: process.env.TEST_PASSWORD ?? credentials.pass,
    // extend as needed: cardNumber, etc.
  };
}
```

**In tests — always guard with skip:**
```typescript
const creds = getTestCredentials();
if (!creds) { test.skip(true, 'No credentials configured'); return; }
```

---

## 3. MongoDB Layout

| Concept | MyAccount value |
|---------|----------------|
| Host | `automationdb.qa.accelerate.cinchhs.com` |
| Port | `27017` |
| User | `acceladmin` |
| Database | `appdev_customer` |
| Collection pattern | `{env}_ui` (e.g., `qa_ui`, `uat_ui`) |

**Note:** The server runs MongoDB 3.6 (wire version 6). Use `mongodb@^3.7.3` for scripts, not the modern v6 driver.

---

## 4. MongoDB Document Schema

```json
{
  "appName": "appdev_customer",
  "envName": "qa",
  "tcName": "C171750",
  "testcaseData": [
    {
      "url": "https://myaccount-ui.qa.cinchhs.com/login",
      "email": "QATesting@cinchhs.com",
      "password": "TestPass@123",
      "contactName": "Auto Test"
    }
  ]
}
```

### Required top-level fields

| Field | Rule |
|-------|------|
| `appName` | Application key: `appdev_customer` |
| `envName` | Target env: `qa` \| `uat` \| `preprod` |
| `tcName` | Primary lookup key: `C` + TestRail case ID (e.g., `C171750`) |
| `testcaseData` | Array of input records returned by the data provider |

---

## 5. How Specs Read MongoDB Data

```typescript
const suiteId = process.env.MONGO_SAMPLE_SUITE_ID ?? 'C171750';
const [data] = await dataProvider.getSuiteData(suiteId);
if (!data) throw new Error(`No Mongo test data for tcName=${suiteId}`);
```

**Do:**
- Treat records as `Record<string, unknown>`; coerce with `String(record.field)`
- Fail fast with a clear message when `tcName` returns no data
- Keep field access centralized in a page method, not scattered across the spec

**Don't:**
- Hardcode login credentials, service data, or plan values in specs
- Mutate documents from a test run
- Depend on document array order beyond index `[0]` unless explicitly data-driven

---

## 6. Adding New MongoDB Test Data (Idempotent Insert Rules)

When generating a new MongoDB-driven spec, produce an idempotent insert script at `scripts/mongo/insert-{tcName}-data.js`.

### Mandatory conditions (non-negotiable):

| Rule | Requirement |
|------|-------------|
| **Existing TC** | If `findOne({ tcName })` returns a document → **SKIP insert** and exit 0. Never modify existing data. |
| **Insert only** | Use `insertOne` ONLY when no document exists. No `upsert`, `updateOne`, `replaceOne`. |
| **No schema changes** | Copy field names from a verified reference document. No new/renamed keys without approval. |
| **No type changes** | Preserve JS types exactly (string stays string, number stays number). |
| **Unique values** | Distinct email, contactName per `tcName` for parallel safety. |
| **Validated data only** | Never hallucinate zip codes, plan names, or payment values. Ask if no reference is available. |

### Idempotent insert script pattern:

```javascript
require('dotenv').config();
const { MongoClient } = require('mongodb');

const TC_NAME = 'C#####';
const DB_NAME = process.env.MONGO_DB ?? 'appdev_customer';

async function insertIfMissing(collectionName, document) {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in local .env');

  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const col = client.db(DB_NAME).collection(collectionName);
    const existing = await col.findOne({ tcName: TC_NAME });
    if (existing) {
      console.log(`SKIP: ${TC_NAME} already exists in ${collectionName}`);
      return;
    }
    await col.insertOne(document);
    console.log(`INSERT: ${TC_NAME} → ${collectionName}`);
  } finally {
    await client.close();
  }
}

async function main() {
  await insertIfMissing('qa_ui', {
    appName: 'appdev_customer', envName: 'qa', tcName: TC_NAME,
    testcaseData: [{ /* validated values only */ }]
  });
}
main().catch(err => { console.error(err); process.exit(1); });
```

---

## 7. Environment Variables for MongoDB

```dotenv
DATA_SOURCE=mongo
MONGO_URI=mongodb://acceladmin:<pass>@automationdb.qa.accelerate.cinchhs.com:27017
MONGO_DB=appdev_customer
# MONGO_COLLECTION: leave unset to auto-resolve to {TARGET_ENV}_ui
MONGO_SAMPLE_SUITE_ID=C171750
```

---

## 8. Test Data Anti-Patterns

```javascript
// ❌ NEVER — deletes/overwrites existing TC data
await collection.deleteMany({ tcName: 'C171750' });
await collection.replaceOne({ tcName: 'C171750' }, newDoc);

// ❌ NEVER — hardcoded connection string
const uri = 'mongodb://user:pass@host:27017';

// ❌ NEVER — hallucinated field values
email: 'fake@test.com', plan: 'FakePlan'

// ✅ CORRECT — skip when exists, insert when missing
const existing = await col.findOne({ tcName });
if (existing) return;
await col.insertOne(doc);
```
