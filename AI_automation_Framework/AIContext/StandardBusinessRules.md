# Standard Business Rules — MyAccount UI

Authoritative rules for understanding the MyAccount application flows. AI agents (Planner, Generator, Healer) MUST reference this when planning, generating, or healing tests.

---

## Application Overview

**MyAccount UI** is a self-service portal for Cinch Home Services customers. It allows customers to:

1. **Login** — Authenticate with email and password
2. **View My Plan** — See active home warranty plan details
3. **Service Requests** — Submit and track service requests (single and multi-item)
4. **Appointments** — Schedule and manage technician appointments
5. **Payments** — View and manage billing / payment methods
6. **Hamburger Menu** — Navigation hub to all major sections

---

## Application URL

Base URLs are controlled by the `WEB_BASE_URL` env var in `.env`:

| Environment | URL |
|-------------|-----|
| QA | `https://myaccount-ui.qa.cinchhs.com/login` |
| Preprod | `https://myaccount-ui.preprod.cinchhs.com` |

---

## Core User Flows

### 1. Login Flow

**Steps:**
1. Navigate to `/login`
2. Enter email and password
3. Click "Log in" / submit
4. Verify redirect to dashboard/main page

**Data:** `getTestCredentials()` from `tests/testCredentials.ts`

---

### 2. Service Request Flow — Single Item (SP Complete)

**Steps:**
1. Login
2. Navigate to Service Request via My Plan or hamburger menu
3. Select a symptom / issue category
4. Fill out request details
5. Schedule appointment
6. Confirm and submit

**Test Files:** `tests/sp-complete-service-request-flow.spec.ts`

---

### 3. Service Request Flow — Multi-Item (C171750)

**Steps:**
1. Login
2. Navigate to Service Requests
3. Add first item (select symptom, details)
4. Add second item (select symptom, details)
5. Schedule combined appointment
6. Confirm and submit both items

**Test Files:** `tests/c171750-multi-item-service-request.spec.ts`

---

### 4. My Plan Flow

**Steps:**
1. Login
2. Navigate to "My Plan" via hamburger menu
3. Verify plan details (plan name, coverage items, deductible)

---

### 5. Hamburger Menu Navigation

The hamburger menu provides access to all major sections. It may be conditionally rendered based on viewport and authentication state.

---

## PrimeNG Component Rules

This application uses PrimeNG components extensively. Key patterns:

### Dropdowns / Select
PrimeNG dropdown options **render in a global body overlay** — they are NOT scoped under the triggering component in the DOM.

```typescript
// ✅ Correct pattern
await this.page.getByRole('combobox', { name: /symptom/i }).click();
// Options appear in global overlay — search page-wide, NOT under component
await this.page.getByRole('option', { name: /no cooling/i }).click();

// ❌ Wrong — scoping under component misses the overlay
await this.page.locator('.p-dropdown').locator('option', { name: 'No Cooling' }).click();
```

### Modals / Dialogs
PrimeNG dialogs use `role="dialog"` and may animate in. Always wait for the dialog to be fully visible before interacting.

```typescript
const dialog = this.page.getByRole('dialog');
await dialog.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
```

---

## Data-Auto-ID Convention

The MyAccount UI uses `data-autoid` (NOT `data-testid`) as the preferred stable test attribute.

```typescript
// Preferred locator pattern
this.page.locator('[data-autoid="submit-btn"]')
// or
this.page.locator('[data-auto-id="menu-item-my-plan"]')
```

Always check the live DOM snapshot for `data-autoid` attributes before falling back to role/label selectors.

---

## Authentication State

- Tests are **not** session-sharing — each test starts fresh
- Credentials are loaded from `tests/testCredentials.ts`
- Never hardcode credentials in test files
- If `getTestCredentials()` returns null → `test.skip()`

---

## Known Slow Pages

These pages require `TIMEOUTS.long` (45s) or `TIMEOUTS.asyncProcessing` (60s):
- Post-login dashboard load (API calls to fetch plan data)
- After service request submission (backend processing)
- Appointment confirmation page

---

## Environment Variables

```dotenv
# .env
TARGET_ENV=qa
WEB_BASE_URL=https://myaccount-ui.qa.cinchhs.com/login
HEADLESS=false
DATA_SOURCE=mongo
MONGO_URI=mongodb://user:pass@automationdb.qa.accelerate.cinchhs.com:27017
MONGO_DB=appdev_customer
```
