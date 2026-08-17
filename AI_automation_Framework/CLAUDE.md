# Playwright Test Suite — Claude Code Rules

## Perspective

When working with this codebase, **always think like a Playwright expert, QA automation architect, and CI/CD expert**.

Approach all work through these lenses:
- **Playwright expertise**: Best practices for selectors, waiting strategies, test organization, fixtures, parallelization, trace debugging
- **QA automation architecture**: Test pyramid principles, maintainability, reusability, data-driven testing, reporting (Allure/HTML), flakiness reduction
- **CI/CD**: Pipeline optimization, test distribution, failure analysis, environment management

## Repository Overview

This is a **TypeScript Playwright framework** for the **MyAccount UI** (Cinch Home Services). It is:
1. **Standalone** — clone and run tests immediately against qa/preprod
2. **Credential-driven** — user data from `test-credentials.json`; service data from MongoDB (`DATA_SOURCE=mongo`)
3. **Minimal** — slim `BasePage` with only `step()` helper; page objects use native Playwright APIs

## Key Architecture

- **Page Object Model**: Thin `tests/pages/BasePage.ts` (only `step()` wrapper); locators as getter methods returning `Locator`
- **Test data**: `tests/testCredentials.ts` for credentials; MongoDB for flow-specific data
- **Reports**: Allure + HTML reports

## Important Locations

- `tests/pages/` — page objects (extend slim `BasePage`)
- `tests/*.spec.ts` — test specifications
- `test-plans/` — structured plans from the Planner agent
- `AIContext/PlaywrightFrameworkGuidelines.md` — comprehensive framework guide for AI agents
- `AIContext/StandardBusinessRules.md` — MyAccount application flow rules
- `AIContext/StandardTestDataRules.md` — MongoDB and credential data rules

## Git Commit Policy

**CRITICAL: NEVER automatically commit changes after code generation or test healing.**

1. **NO AUTO-COMMITS**: After generating code, fixing tests, or healing failures, DO NOT create git commits automatically
2. **ALWAYS ASK FIRST**: Before any commit, explicitly ask the user for approval
3. **SHOW CHANGES**: Present modified files and a brief summary; wait for user confirmation
4. **USER CONTROL**: The user must explicitly request a commit ("commit these changes")

## Test Retry Policy

- On test failure, retry **once only** (`retries: 1` locally, `retries: 2` on CI).
- Never increase retries beyond these values to mask flaky tests — fix the root cause instead.
- The `playwright.config.ts` `retries` field controls this globally; do not override per-test with `test.retry()`.

## Workflow: Always Use the Three Specialized Agents

### 1. Test Planner (`playwright-test-planner`)
- **Always** use the Playwright Test Planner agent **before writing any tests**.
- The planner navigates the live app, explores flows, and produces a structured test plan saved under `test-plans/`.
- Do not skip planning and jump straight to writing tests.
- Plans must cover: happy path, edge cases, and error states for each feature.
- Reference: `AIContext/PlaywrightFrameworkGuidelines.md`, `AIContext/StandardBusinessRules.md`

### 2. Test Generator (`playwright-test-generator`)
- **Always** use the Playwright Test Generator agent to create test files from a plan.
- Generated tests must follow the Page Object Model pattern (see below).
- Never write raw `page.click()`/`page.fill()` calls inside test specs — all interactions go through Page Object classes.
- Test files go in `tests/` and page objects in `tests/pages/`.
- Reference: `AIContext/PlaywrightFrameworkGuidelines.md`, `AIContext/StandardTestDataRules.md`

### 3. Test Healer (`playwright-test-healer`)
- **Always** use the Playwright Test Healer agent to debug and fix failing tests.
- The healer runs the failing test, diagnoses one root cause at a time, applies a fix, and reruns to verify.
- If the same failure persists after one complete fix attempt and is not environment-caused, mark it `test.fixme()` — never delete a test to make the suite green.
- Do not manually edit locators or selectors without first running the healer.

## Page Object Model (POM) Standards

- Every page or major component gets its own class in `tests/pages/`.
- Class names match the page (e.g., `LoginPage`, `MainPage`, `AppointmentPage`).
- Locators are defined as **getter methods** returning `Locator` — lazy evaluation, chainable, type-safe.
- No inline locator strings in spec files.
- Page methods perform one logical action (e.g., `login()`, `navigateToMyPlan()`) and return `void` or the next Page Object.
- Extend `BasePage` — but use native Playwright APIs directly; BasePage only provides `step()`.

```typescript
// Correct — getter methods, native Playwright APIs
export class LoginPage extends BasePage {
  get emailInput() { return this.page.getByLabel('Email'); }
  get passwordInput() { return this.page.getByLabel('Password'); }
  get loginButton() { return this.page.getByRole('button', { name: 'Log in' }); }

  async login(email: string, password: string): Promise<void> {
    await this.step('Login', async () => {
      await this.emailInput.waitFor({ state: 'visible' });
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    });
  }
}
```

## Locator Rules

**Priority order** (this app uses `data-autoid`/`data-auto-id` as the primary stable attribute):
1. `[data-autoid="element-id"]` / `[data-auto-id="element-id"]` — **most stable, preferred in this app**
2. `getByRole()` — accessibility tree, semantic
3. `getByLabel()` — for form fields
4. `getByTestId()` — when `data-testid` present
5. `getByText()` — stable visible text
6. `locator('css')` — last resort; no dynamic IDs or nth-child

- Never use `page.locator('xpath=...')` or index-based selectors like `nth-child` unless absolutely no alternative.
- Never use `page.$()` or `page.$$()` (legacy API).
- Never use dynamic IDs like `#pn_id_44` — they change each session.

### PrimeNG Dropdown Special Pattern

PrimeNG dropdown options render in a **global body overlay** — they are NOT children of the trigger component:

```typescript
// ✅ Correct
await this.page.getByRole('combobox', { name: /symptom/i }).click();
await this.page.getByRole('option', { name: /no cooling/i }).click(); // page-wide, NOT scoped

// ❌ Wrong — scoping under component misses the overlay
await this.page.locator('.p-dropdown').locator('option', { name: 'No Cooling' }).click();
```

## Waiting and Stability Rules

- **Always** wait for elements before interacting:
  ```typescript
  await element.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
  ```
- After navigation, wait for a stable landmark:
  ```typescript
  await page.waitForLoadState('domcontentloaded');
  await landmarkLocator.waitFor({ state: 'visible' });
  ```
- For slow/network-heavy pages: `await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.long });`
- **Never** use `page.waitForTimeout()` — always wait for element state or network state.
- Use `expect(locator).toBeVisible()` for assertions, **not** `.isVisible()` (no auto-retry).
- Use generous timeouts on slow elements: `TIMEOUTS.asyncProcessing` (60s) for post-submission pages.

## Timeout Constants

**Always use `TIMEOUTS` constants. Never hardcode timeout values in page objects or specs.**

```typescript
import { TIMEOUTS } from '../../utils/constants/timeouts';

TIMEOUTS.pollingInterval    // 500ms
TIMEOUTS.short              // 5s
TIMEOUTS.standard           // 15s
TIMEOUTS.medium             // 30s
TIMEOUTS.long               // 45s
TIMEOUTS.asyncProcessing    // 60s
```

## Allure Reporting

- **Never use `logger.info()` in spec files.** Use Allure helpers from `hooks/allure-helpers.ts`.
- Call `setAllureMetadata(epic, feature)` once at the start of each test.
- Use `allureLog(message, details?)` for progress inside test steps.
- Wrap each major TestRail step in `test.step('N: description', async () => { ... })`.

```typescript
import { setAllureMetadata, allureLog } from '../../hooks/allure-helpers';

test('[C169781] Login with Correct Credentials @critical @e2e', async ({ page }) => {
  await setAllureMetadata('MyAccount', 'Login');

  await test.step('1: Navigate to login page', async () => {
    await loginPage.navigateToLogin();
    await allureLog('Login page loaded');
  });
});
```

## General Test Rules

- Each test must be independent — no shared state between tests.
- Use `test.describe` blocks to group related scenarios.
- Tag all tests: `@critical` (blocking flows), `@e2e` (full flows), `@smoke` (sanity), `@regression` (regression suite).
- Test title format: `[C{id}] Description @tag1 @tag2`
- Credentials and environment config come from `test-credentials.json` and `.env` — **never hardcode** in tests.
- Always call `page.context().close()` at the end of every test after all assertions pass.
- Screenshots, videos, and traces are captured automatically on failure via `playwright.config.ts` — do not add manual screenshot calls except for debugging.
- Keep `retries` at 1 locally; never commit a test with `test.only()`.
- Run `npm run typecheck` and `npm run lint` before marking generation/healing complete.

## Code Standards

### TypeScript
- Always specify return types on exported/public methods
- `readonly` for locator getter properties  
- `await` all async Playwright calls
- No unused imports or variables

### Naming
| Type | Convention | Example |
|------|-----------|---------|
| Page files | `{Feature}Page.ts` | `LoginPage.ts` |
| Spec files | `C{id}-{kebab-case}.spec.ts` | `C169781-login-valid-credentials.spec.ts` |
| Methods | camelCase verb-first | `login()`, `navigateToMyPlan()` |
| Test names | `[C{id}] Description @tags` | `[C169781] Login @critical @e2e` |
