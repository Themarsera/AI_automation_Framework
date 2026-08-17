# Playwright MyAccount UI Test Suite

## Overview

This repository hosts the Playwright MyAccount UI Test suite for the **Cinch Home Services — MyAccount** web application. It is a Playwright + TypeScript framework designed for:

- **Maintainability** – Page Object Model with TypeScript
- **Scalability** – Modular structure, reusable page components
- **CI/CD compatibility** – Headless execution, environment-based config, HTML + Allure reports
- **AI-assisted authoring** – Integrated Playwright MCP agents for planning, generating, and healing tests

## Features

- UI automation for the MyAccount portal (Auth0 login, React SPA, service request flows)
- Modular and reusable test framework with Page Objects
- Environment-based configuration (QA)
- Support for headless and headed execution
- CI/CD friendly execution
- Rich test reporting (Playwright HTML report, Allure)
- Credential management via environment variables or local JSON file
- TestRail integration via MCP for test case mapping and result reporting
- AI agent workflow (Planner → Generator → Healer) for rapid test authoring

---

## Tech Stack

| Category | Technology |
|---|---|
| Language | TypeScript |
| Automation | Playwright |
| Test Framework | @playwright/test |
| Build / Run | npm |
| Reporting | Playwright HTML / Allure |
| TestRail Integration | MCP TestRail plugin |
| AI Test Authoring | Claude Code (Playwright MCP agents) |

---

## Repository Structure

```
MyAccount_Playwright_UI_Testsuite/
├── tests/
│   ├── pages/                              # Page Object Model classes
│   │   ├── BasePage.ts                     # Shared base utilities
│   │   ├── LoginPage.ts                    # Login page interactions
│   │   ├── MainPage.ts                     # Dashboard / home page
│   │   ├── ServiceRequestPage.ts           # Single-item service request
│   │   ├── MultiItemServiceRequestPage.ts  # Multi-item service request
│   │   ├── AppointmentPage.ts              # Time slot scheduling
│   │   └── PaymentPage.ts                  # Payment & confirmation
│   │
│   ├── exploration/                        # Exploratory / locator discovery specs
│   │   ├── check-html.spec.ts
│   │   ├── find-iframe.spec.ts
│   │   ├── fixed-login.spec.ts
│   │   ├── locator-discovery.spec.ts
│   │   ├── simple-discovery.spec.ts
│   │   └── testrail-integration.spec.ts
│   │
│   ├── seed.spec.ts                            # Smoke / environment check
│   ├── sp-complete-service-request-flow.spec.ts  # Single-item E2E happy path
│   ├── c171750-multi-item-service-request.spec.ts # Multi-item E2E (POM-based)
│   ├── c171750-service-request-2items.spec.ts     # Multi-item E2E (raw page)
│   ├── testCredentials.ts                      # Credential loader utility
│   └── test-data.env.example                   # Environment variable template
│
├── test-plans/                             # AI-generated structured test plans
│   ├── C171749_MyAccountRequestService.md
│   ├── C171750_MyAccountRequestService_2Items.md
│   ├── C171750_DOM_Inspection.md
│   ├── c171749-my-account-service-request.plan.md
│   ├── service-request-e2e.plan.md
│   └── sp-service-request-flow.plan.md
│
├── allure-results/                         # Raw Allure output (generated on run)
├── allure-report/                          # Built Allure HTML report
├── playwright-report/                      # Built-in Playwright HTML report
├── test-results/                           # Failure screenshots, videos, traces
│
├── .claude/agents/                         # AI agent definitions
│   ├── playwright-test-planner.md
│   ├── playwright-test-generator.md
│   └── playwright-test-healer.md
│
├── playwright.config.ts                    # Playwright configuration
├── package.json                            # Dependencies & npm scripts
├── test-credentials.json                   # Local credentials (gitignored)
├── CLAUDE.md                               # AI coding rules for this repo
└── README.md                               # This file
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- Chrome / Chromium (via Playwright)
- Git

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Rakeshcinch/MyAccount_Playwright_UI_Testsuite.git
cd MyAccount_Playwright_UI_Testsuite
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 4. Configure Credentials

Create `test-credentials.json` in the project root:

```json
{
  "user": "your-email@example.com",
  "pass": "your-password"
}
```

Or set environment variables:

```bash
export TEST_USER=your-email@example.com
export TEST_PASS=your-password
```

> `test-credentials.json` is gitignored — never commit real credentials.

---

## Test Execution

### Run All Tests

```bash
npm test
```

### Run with Headed Browser (visible UI)

```bash
npm run test:headed
```

### Run a Specific Test File

```bash
npx playwright test tests/sp-complete-service-request-flow.spec.ts
```

### Run by Tag

```bash
# Run all critical tests
npx playwright test --grep "@critical"

# Run all E2E tests
npx playwright test --grep "@e2e"
```

### Run Multi-Item Service Request Tests

```bash
npx playwright test tests/c171750-multi-item-service-request.spec.ts tests/c171750-service-request-2items.spec.ts
```

### Run in Headless Mode

```bash
HEADLESS=true npx playwright test
```

### Debug Mode

```bash
npx playwright test --debug tests/seed.spec.ts
```

### UI Mode (interactive)

```bash
npx playwright test --ui
```

### List All Tests

```bash
npx playwright test --list
```

---

## Reporting

### Playwright HTML Report

```bash
npx playwright show-report
```

Report is served at `http://localhost:9323` after a run.

### Allure Report

```bash
# Generate and open Allure report
npm run allure:generate
npm run allure:open

# Serve live from raw results
npm run allure:serve

# Run tests + generate + open in one command
npm run test:allure
```

> Allure report generation requires Java 8+ (via `allure-commandline`).

### Failure Artifacts

On failure, the following are saved automatically under `test-results/`:

| Artifact | Description |
|---|---|
| `test-failed-1.png` | Screenshot at point of failure |
| `video.webm` | Full session video recording |
| Trace | Viewable at `trace.playwright.dev` |

---

## Configuration

Key settings in `playwright.config.ts`:

| Setting | Value | Notes |
|---|---|---|
| `testDir` | `tests/` | All spec files |
| `timeout` | 30,000 ms | Per-action timeout |
| `retries` | 1 (local) / 2 (CI) | Never exceed — fix root cause instead |
| `workers` | 1 | Sequential execution |
| `headless` | false | Visible browser by default |
| `slowMo` | 120 ms | Slows actions for visibility |
| `trace` | `on-first-retry` | Captured on first retry |
| `video` | `retain-on-failure` | Kept only on failure |
| `screenshot` | `only-on-failure` | Kept only on failure |
| `baseURL` | `https://myaccount-ui.qa.cinchhs.com` | QA environment |

---

## CI/CD Integration

The framework supports:

- **Headless execution** — `HEADLESS=true`
- **Environment-based config** — via `.env` or env vars
- **Report publishing** — Playwright HTML report, screenshots, traces

Example GitHub Actions step:

```yaml
- run: npm ci
- run: npx playwright install --with-deps chromium
- run: TEST_USER=${{ secrets.TEST_USER }} TEST_PASS=${{ secrets.TEST_PASS }} npm test
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Test Scenarios Covered

| ID | Scenario |
|---|---|
| C171749 | Single-item My Account service request (happy path) |
| C171750 | Multi-item service request — 2 items, 1 category (APPLIANCE PREMIUM plan) |
| — | Smoke / seed environment check |
| — | SP complete service request flow (login to confirmation) |

### E2E Flow: Single-Item Service Request

```
Login → Close Cookie Banner → Dashboard
     → Request Service → Select Appliance (Refrigerator)
     → Fill Details (symptom, brand, serial, model)
     → Continue → Select Appointment Slots (3 slots)
     → Continue → Review → Continue to Payment
     → Add Credit Card → Accept Terms → Pay Now
     → Confirmation Page ✓
```

### E2E Flow: Multi-Item Service Request (C171750)

```
Login → Select Plan (APPLIANCE PREMIUM) → Dashboard
     → Request Service → Select Warranty Repair
     → Item 1: Refrigerator (symptom, brand, serial, model)
     → Add Item → Item 2: Clothes Washer (serial, model)
     → Continue → Review → Continue to Payment
     → Add Credit Card → Accept Terms → Pay Now
     → Confirmation (2 service order numbers) ✓
```

---

## Page Object Model

All test interactions go through Page Object classes. No raw `page.click()` or `page.fill()` calls appear in spec files.

### Class Hierarchy

```
BasePage
├── LoginPage                    — navigateToLogin(), login(email, pass)
├── MainPage                     — dashboard navigation helpers
├── ServiceRequestPage           — selectRefrigerator(), fillDropdowns(),
│                                  fillSerialAndModel(), clickContinue()
├── MultiItemServiceRequestPage  — selectWarrantyRepair(), selectItem(),
│                                  fillItemDetails(), clickAddItem(), clickContinue()
├── AppointmentPage              — selectTimeSlots(n), proceedToPayment()
└── PaymentPage                  — clickAddNewCreditCard(), fillCardDetails(),
                                   submitPayment(), verifyConfirmation(),
                                   verifyMultiItemConfirmation()
```

### Locator Priority

1. `getByRole()` — accessibility-based, most resilient
2. `getByLabel()` — for form inputs
3. `getByTestId()` — when `data-testid` attributes exist
4. `getByText()` — for stable visible text
5. `locator('css')` — last resort only

---

## AI-Assisted Test Workflow

This project uses three Claude Code AI agents. **Always follow this order:**

### 1. Test Planner (`playwright-test-planner`)

Navigates the live app, explores flows, and saves a structured plan in `test-plans/`.

- Run **before** writing any tests
- Plans cover happy path, edge cases, and error states

### 2. Test Generator (`playwright-test-generator`)

Creates spec files and Page Objects from a plan file.

- Input: plan file from `test-plans/`
- Output: spec in `tests/`, Page Object in `tests/pages/`

### 3. Test Healer (`playwright-test-healer`)

Debugs and fixes failing tests one root cause at a time.

- Runs the failing test → diagnoses → applies fix → reruns to verify
- If failure persists after one fix attempt, marks `test.fixme()` — never deletes tests

> Agent definitions live in `.claude/agents/`.

---

## TestRail Integration

Test cases are mapped to TestRail using the `C<id>` prefix in spec file names and the `@TestRail: C<id>` annotation in test comments.

| TestRail ID | Spec File | Description |
|---|---|---|
| C171749 | `c171749-*` | Single-item service request |
| C171750 | `c171750-*` | Multi-item service request (2 items, 1 category) |

Results can be pushed directly to TestRail via the MCP TestRail plugin (`TestrailMcp.json`).

---

## Contribution Guidelines

- Follow existing coding standards and naming conventions
- Always run the **Planner → Generator → Healer** agent workflow for new tests
- Ensure all new tests are modular and go through Page Objects
- Add Allure annotations (`@Feature`, `@Story`, `@Severity`) to every test
- Never commit `test.only()` or increase retries beyond the configured values
- Never hardcode credentials — use `test-credentials.json` or env vars
- Update test plans in `test-plans/` for any new flows

---

## Contributors

- **Rakesh Lenka** — rlenka@cinchhs.com

---

## License

This project is intended for internal use only.  
All rights reserved © Cinch Home Services.
