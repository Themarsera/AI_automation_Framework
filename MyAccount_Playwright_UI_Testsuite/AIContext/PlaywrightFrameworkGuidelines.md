# Playwright Framework Guidelines for AI Agents — MyAccount UI

## Document Purpose
Comprehensive guidance for AI agents (Planner, Generator, Healer) working on the **MyAccount UI** Playwright TypeScript test suite. Use this as the authoritative reference when generating or maintaining test automation code.

---

## Framework Overview

### Core Philosophy
- **TypeScript-first**: Strong typing, type safety, IntelliSense support
- **Page Object Model (POM)**: All page-specific selectors and interactions encapsulated in dedicated classes
- **Fixture-based architecture**: Playwright native fixture system for dependency injection
- **MongoDB-driven test data**: `DATA_SOURCE=mongo` by default; credentials from `test-credentials.json`
- **CI/CD ready**: Allure reports, parallel execution, retry mechanisms

---

## Directory Structure

```
MyAccount_Playwright_UI_Testsuite/
├── tests/
│   ├── pages/                  # Page Object Model classes
│   │   ├── BasePage.ts         # Abstract base — only step() helper, native Playwright APIs
│   │   ├── LoginPage.ts
│   │   ├── MainPage.ts
│   │   ├── ServiceRequestPage.ts
│   │   ├── MultiItemServiceRequestPage.ts
│   │   ├── AppointmentPage.ts
│   │   └── PaymentPage.ts
│   ├── testCredentials.ts      # Credential loader (reads test-credentials.json)
│   ├── *.spec.ts               # Test specifications
│   └── exploration/            # Exploratory / discovery tests
│
├── test-plans/                 # Structured plans saved by the Planner agent
├── AIContext/                  # AI agent reference docs (this directory)
├── scripts/                    # Utility scripts
├── reports/                    # Playwright HTML + Allure reports
├── test-credentials.json       # Runtime credentials (gitignored)
├── playwright.config.ts        # Playwright configuration
└── CLAUDE.md                   # Project rules (authoritative)
```

---

## Core Design Patterns

### 1. Page Object Model (POM)

**BasePage is intentionally thin — only a `step()` wrapper. Use native Playwright APIs directly.**

```typescript
// tests/pages/BasePage.ts — slim base
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async step<T>(actionName: string, action: () => Promise<T>): Promise<T> {
    return test.step(actionName, async () => action());
  }
}
```

**Page Object pattern:**
```typescript
// tests/pages/ExamplePage.ts
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../../utils/constants/timeouts';

export class ExamplePage extends BasePage {
  // Getter methods return Locator — lazy evaluation, chainable
  get heading() { return this.page.getByRole('heading', { name: /example/i }); }
  get submitButton() { return this.page.getByRole('button', { name: /submit/i }); }
  get errorAlert() { return this.page.getByRole('alert'); }

  async waitForPage(): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
  }

  async submit(): Promise<void> {
    await this.step('Submit form', async () => {
      await this.submitButton.waitFor({ state: 'visible' });
      await this.submitButton.click();
    });
  }
}
```

**What BasePage does NOT provide:**
- No Selenium-style helpers (`fill()`, `click()`, `waitForVisible()`)
- Use native Playwright APIs directly: `await this.page.locator().click()`, `await expect(locator).toBeVisible()`

---

### 2. Fixture-Based Test Setup

```typescript
// In a test spec
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Feature Name', () => {
  test('[C169781] Login with Correct Credentials @critical @e2e', async ({ page }, testInfo) => {
    await setAllureMetadata('MyAccount', 'Login');
    const loginPage = new LoginPage(page);

    await test.step('1: Navigate to login page', async () => {
      await loginPage.navigateToLogin();
    });

    await page.context().close();
  });
});
```

---

### 3. Data-Driven Testing

**Credentials and test data come from `test-credentials.json` via `tests/testCredentials.ts`.**

```typescript
// tests/testCredentials.ts pattern
import credentials from '../test-credentials.json';

export function getTestCredentials() {
  return {
    user: process.env.TEST_EMAIL ?? credentials.user,
    pass: process.env.TEST_PASSWORD ?? credentials.pass,
  };
}
```

**In tests:**
```typescript
const creds = getTestCredentials();
if (!creds) { test.skip(true, 'No credentials configured'); return; }
await loginPage.login(creds.user, creds.pass);
```

---

## Locator Priority Order

This project uses **data-autoid** (`data-autoid` or `data-auto-id`) as the primary stable attribute:

1. `[data-autoid="element-id"]` / `[data-auto-id="element-id"]` — **most stable, use wherever present**
2. `getByRole()` — accessibility tree, semantic
3. `getByLabel()` — for form fields
4. `getByTestId()` — when `data-testid` present
5. `getByText()` — visible text that won't change
6. `locator('css')` — last resort; no dynamic IDs or nth-child

**Never use:**
- `page.$()` / `page.$$()` (legacy)
- `xpath=...` unless absolutely no alternative
- Index-based selectors (`nth-child`, `.nth()` without a semantic reason)
- Dynamic IDs like `#pn_id_44`

---

## Waiting and Stability Rules

```typescript
// ✅ Always wait before interacting
await element.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });

// ✅ After navigation — wait for stable landmark
await page.waitForLoadState('domcontentloaded');
await landmarkLocator.waitFor({ state: 'visible' });

// ✅ For network-heavy pages
await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.long });

// ✅ Web-first assertions (auto-retry built in)
await expect(element).toBeVisible({ timeout: TIMEOUTS.standard });
await expect(element).toHaveText(/pattern/);

// ❌ Never hard-code sleeps
await page.waitForTimeout(3000); // FORBIDDEN

// ❌ isVisible() doesn't auto-retry
const visible = await element.isVisible(); // use expect().toBeVisible() instead
```

---

## Timeout Constants

**Always use `TIMEOUTS` constants. Never hardcode timeout values.**

```typescript
import { TIMEOUTS } from '../../utils/constants/timeouts';

TIMEOUTS.pollingInterval    // 500ms
TIMEOUTS.short              // 5s
TIMEOUTS.standard           // 15s
TIMEOUTS.medium             // 30s
TIMEOUTS.long               // 45s
TIMEOUTS.asyncProcessing    // 60s
```

---

## Allure Reporting

**Never use `logger.info()` in spec files.** Use Allure helpers.

```typescript
import { setAllureMetadata, allureLog } from '../../hooks/allure-helpers';

test('[C169781] Login @critical @e2e', async ({ page }, testInfo) => {
  await setAllureMetadata('MyAccount', 'Login');  // once at start

  await test.step('1: Navigate to login page', async () => {
    await loginPage.navigateToLogin();
    await allureLog('Login page loaded');
  });

  await test.step('2: Submit credentials', async () => {
    await loginPage.login(creds.user, creds.pass);
    await allureLog('Credentials submitted');
  });
});
```

---

## Test Structure Template

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getTestCredentials } from '../testCredentials';
import { setAllureMetadata, allureLog } from '../../hooks/allure-helpers';

test.describe('Login Page', () => {
  test('[C169781] Login with Correct Credentials @critical @e2e', async ({ page }) => {
    await setAllureMetadata('MyAccount', 'Login');

    const creds = getTestCredentials();
    if (!creds) { test.skip(true, 'No credentials configured'); return; }

    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await test.step('1: Navigate to login page', async () => {
      await loginPage.navigateToLogin();
      await allureLog('Login page loaded');
    });

    await test.step('2: Login with valid credentials', async () => {
      await loginPage.login(creds.user, creds.pass);
      await allureLog('Credentials submitted');
    });

    await test.step('3: Verify dashboard', async () => {
      await dashboard.waitForDashboard();
      await expect(page).toHaveURL(/dashboard/);
      await allureLog('Dashboard verified');
    });

    await page.context().close();  // Always close at end
  });
});
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Page files | `{Feature}Page.ts` | `LoginPage.ts`, `ServiceRequestPage.ts` |
| Spec files | `C{id}-{kebab-case}.spec.ts` | `C169781-login-valid-credentials.spec.ts` |
| Classes | PascalCase | `LoginPage`, `ServiceRequestPage` |
| Methods | camelCase, verb-first | `login()`, `navigateToMyPlan()`, `waitForPage()` |
| Locator getters | camelCase noun | `heading`, `submitButton`, `errorAlert` |
| Test names | `[C{id}] Description @tag1 @tag2` | `[C169781] Login with Correct Credentials @critical @e2e` |

---

## Test Tags

| Tag | When to use |
|-----|------------|
| `@critical` | Core functionality, blocking if broken |
| `@e2e` | Full end-to-end flow |
| `@smoke` | Quick sanity check |
| `@regression` | Regression suite |

---

## CI/CD Settings

From `playwright.config.ts`:
- `fullyParallel: true` in CI
- `retries: 1` locally, `retries: 2` in CI
- `forbidOnly: true` in CI
- `HEADLESS=true` in CI

---

## Anti-Patterns

### ❌ Never
- `page.waitForTimeout()` — hard sleeps
- `element.click({ force: true })` — masks real issues
- Dynamic IDs (`#pn_id_44`) — change each session
- `nth-child` / index-based selectors without semantic reason
- `logger.info()` in spec files — use `allureLog()`
- Hardcoded credentials in test files
- `test.only()` in committed code
- Raw `page.click()` / `page.fill()` in spec files — use Page Objects

### ✅ Always
- `element.waitFor({ state: 'visible' })` before interactions
- `expect(element).toBeVisible()` for assertions (auto-retries)
- `TIMEOUTS` constants for all timeout values
- `page.context().close()` at end of every test
- `setAllureMetadata()` at start of every test
- `test.step()` wrapping each major TestRail step

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `tests/pages/BasePage.ts` | Base class — extend for every page object |
| `tests/testCredentials.ts` | Credential loader |
| `test-credentials.json` | Runtime credentials (gitignored) |
| `playwright.config.ts` | Project-level settings |
| `CLAUDE.md` | Project rules (authoritative) |
| `AIContext/StandardTestDataRules.md` | MongoDB data rules |
| `AIContext/StandardBusinessRules.md` | MyAccount business flow rules |
