# AI Automation Framework

A comprehensive **Playwright + TypeScript** automation testing framework for the **MyAccount** web application. Enterprise-grade with AI-assisted test authoring, rich reporting, and production-ready CI/CD integration.

## ✨ Features

### 🧠 AI-Powered Test Lifecycle
- **Test Planner Agent** – Explores live app flows and generates structured test plans
- **Test Generator Agent** – Creates test specs from plans (POM-compliant)
- **Test Healer Agent** – Debugs and fixes failing tests automatically
- Integrated MCP agents for rapid, reliable test authoring

### 🏗️ Enterprise Architecture
- **Page Object Model (POM)** – Clean, maintainable, reusable page classes
- **Modular Components** – Composable test utilities and data providers
- **Environment Management** – QA, PreProd, Prod configurations
- **Parallel Execution** – Run 100s of tests in minutes
- **Data Providers** – MongoDB integration for dynamic test data

### 📊 Rich Reporting & Observability
- **Playwright HTML Reports** – Interactive test results with video/traces
- **Allure Reports** – Custom failure categories, metadata, trends
- **TestRail Integration** – Automatic test case tracking via MCP
- **Auto-Capture** – Screenshots, videos, traces on failure

### 🔐 Security & Maintainability
- **Credential Management** – Environment variables or `test-credentials.json`
- **TypeScript** – Type-safe automation code
- **Linting & Formatting** – ESLint + Prettier enforced
- **Cloud-Ready** – GitHub Actions CI/CD support

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/Themarsera/AI_automation_Framework.git
cd AI_automation_Framework
npm install
npx playwright install chromium
```

### 2. Configure Credentials

Create `test-credentials.json` in the project root:

```json
{
  "testUser": {
    "email": "your-test-email@example.com",
    "password": "your-test-password"
  }
}
```

Or set environment variables:
```bash
export TEST_USER_EMAIL="your-test-email@example.com"
export TEST_USER_PASSWORD="your-test-password"
export TEST_ENV="qa"  # qa, preprod, prod
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/login/C169781-Login-with-Correct-Credentials.spec.ts

# Run with headed browser
npm test -- --headed

# Run in debug mode
npm test -- --debug

# Generate Allure report
npm test && npm run allure:report
```

---

## 📁 Project Structure

```
AI_automation_Framework/
├── tests/
│   ├── pages/                          # Page Object Model classes
│   │   ├── BasePage.ts                 # Base class with step() helper
│   │   ├── LoginPage.ts                # Auth0 login flows
│   │   ├── MainPage.ts                 # Dashboard home page
│   │   ├── ServiceRequestPage.ts       # Single-item service requests
│   │   ├── MultiItemServiceRequestPage.ts  # Multi-item flows
│   │   ├── AppointmentPage.ts          # Appointment scheduling
│   │   ├── PaymentPage.ts              # Payment processing
│   │   └── DashboardPage.ts            # Dashboard interactions
│   │
│   ├── login/                          # Login test specs
│   │   ├── C169777-Verify-Click-here-link.spec.ts
│   │   ├── C169778-Verify-Get-started-CTA-link.spec.ts
│   │   ├── C169781-Login-with-Correct-Credentials.spec.ts
│   │   └── C169782-Login-with-Incorrect-Credentials.spec.ts
│   │
│   ├── dashboard/                      # Dashboard test specs
│   │   └── C171774-Verify-links-on-Dashboard-page.spec.ts
│   │
│   ├── exploration/                    # Exploratory / discovery tests
│   │   ├── check-html.spec.ts
│   │   ├── find-iframe.spec.ts
│   │   ├── locator-discovery.spec.ts
│   │   └── testrail-integration.spec.ts
│   │
│   ├── testCredentials.ts              # Credential loader utility
│   └── test-data.env.example           # Environment template
│
├── test-plans/                         # AI-generated test plans
│   ├── C171749_MyAccountRequestService.md
│   ├── C171750_complete_e2e.md
│   ├── service-request-e2e.plan.md
│   └── sp-service-request-flow.plan.md
│
├── config/                             # Environment configuration
│   ├── index.ts
│   ├── env-schema.ts
│   └── environments/
│       ├── qa.ts
│       ├── preprod.ts
│       └── prod.ts
│
├── fixtures/                           # Playwright fixtures
│   ├── base.fixture.ts                 # Base page fixture
│   ├── env.fixture.ts                  # Environment fixture
│   └── mongo-suite.fixture.ts          # MongoDB test data fixture
│
├── hooks/                              # Allure reporting hooks
│   ├── allure-helpers.ts               # allureLog(), setAllureMetadata()
│   └── allure-metadata.ts              # Metadata extraction
│
├── utils/                              # Shared utilities
│   ├── playwright-helper.ts            # Common Playwright utilities
│   ├── locator-helpers.ts              # Locator building helpers
│   ├── string-helpers.ts               # String manipulation
│   ├── constants/
│   │   └── timeouts.ts                 # Timeout constants
│   ├── data-providers/                 # Test data sources
│   │   ├── mongo.provider.ts           # MongoDB provider
│   │   └── provider-factory.ts         # Factory pattern
│   └── allure/                         # Allure integration
│       └── failure-category.ts         # Custom failure categories
│
├── api/                                # API helpers
│   ├── clients/
│   │   └── rest.client.ts              # REST client
│   └── helpers/
│       ├── api-flow-helper.ts          # API test flows
│       └── schema-validation.ts        # Schema validation
│
├── AIContext/                          # AI agent instruction files
│   ├── PlaywrightFrameworkGuidelines.md  # Framework best practices
│   ├── StandardBusinessRules.md        # MyAccount flow rules
│   └── StandardTestDataRules.md        # Data & credential rules
│
├── .claude/agents/                     # MCP agent definitions
│   ├── playwright-test-planner.md
│   ├── playwright-test-generator.md
│   └── playwright-test-healer.md
│
├── playwright.config.ts                # Playwright configuration
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies & scripts
├── CLAUDE.md                           # AI coding rules
├── PLAYWRIGHT_SETUP.md                 # Setup guide
├── ALLURE_REPORTING_GUIDE.md           # Allure documentation
└── README.md                           # This file
```

---

## 🛠️ Tech Stack

| Area | Technology |
|------|-----------|
| **Language** | TypeScript 5.0+ |
| **Framework** | Playwright v1.40+ |
| **Test Runner** | @playwright/test |
| **Package Manager** | npm |
| **Reports** | Playwright HTML + Allure |
| **Data Source** | MongoDB + JSON |
| **Integration** | TestRail (MCP) |
| **CI/CD** | GitHub Actions |
| **AI Integration** | Claude MCP agents |

---

## 📖 Key Documentation

- **[CLAUDE.md](./CLAUDE.md)** – AI coding rules, workflow, and best practices
- **[AIContext/PlaywrightFrameworkGuidelines.md](./AIContext/PlaywrightFrameworkGuidelines.md)** – Comprehensive framework guide
- **[AIContext/StandardBusinessRules.md](./AIContext/StandardBusinessRules.md)** – MyAccount application flows
- **[AIContext/StandardTestDataRules.md](./AIContext/StandardTestDataRules.md)** – Test data and credentials
- **[PLAYWRIGHT_SETUP.md](./PLAYWRIGHT_SETUP.md)** – Initial setup instructions
- **[ALLURE_REPORTING_GUIDE.md](./ALLURE_REPORTING_GUIDE.md)** – Allure report usage

---

## 🎯 Test Organization

### Test Structure
```
test('Test Title @tag1 @tag2', async ({ page }) => {
  // Arrange – setup test data
  // Act – perform user actions
  // Assert – verify expected behavior
});
```

### Naming Convention
- Test files: `[C{id}]-{kebab-case}.spec.ts`
- Test titles: `[C{id}] Description @tag1 @tag2`
- Tags: `@critical`, `@e2e`, `@smoke`, `@regression`

### Example Test
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { setAllureMetadata, allureLog } from '../../hooks/allure-helpers';

test('[C169781] Login with Correct Credentials @critical @e2e', async ({ page }) => {
  await setAllureMetadata('MyAccount', 'Login');

  const loginPage = new LoginPage(page);
  
  await test.step('1: Navigate to login page', async () => {
    await loginPage.navigateToLogin();
    await allureLog('Login page loaded');
  });

  await test.step('2: Enter credentials', async () => {
    await loginPage.login('test@example.com', 'password');
  });

  await test.step('3: Verify dashboard loads', async () => {
    await expect(page).toHaveURL(/dashboard/);
    await allureLog('Successfully logged in');
  });
});
```

---

## 🤖 AI Workflow (Planner → Generator → Healer)

### 1. Test Planner
```bash
npm run planner -- "Add password reset test"
```
Generates structured test plan in `test-plans/`

### 2. Test Generator
```bash
npm run generator -- "test-plans/password-reset.plan.md"
```
Creates test specs from plan in `tests/`

### 3. Test Healer
```bash
npm run healer -- tests/auth/C123-password-reset.spec.ts
```
Debugs and fixes failing tests automatically

---

## 📋 npm Scripts

```bash
npm test                    # Run all tests
npm run test:headed         # Run with headed browser
npm run test:debug          # Run in debug mode
npm run allure:generate     # Generate Allure reports
npm run allure:report       # Open Allure report
npm run lint                # Run ESLint
npm run format              # Format code with Prettier
npm run typecheck           # TypeScript type check
npm run planner -- "..."    # Run Test Planner agent
npm run generator -- "..."  # Run Test Generator agent
npm run healer -- "..."     # Run Test Healer agent
```

---

## 🔧 Environment Configuration

### QA
```bash
export TEST_ENV=qa
export TEST_BASE_URL=https://qa.myaccount.example.com
```

### PreProd
```bash
export TEST_ENV=preprod
export TEST_BASE_URL=https://preprod.myaccount.example.com
```

### Production
```bash
export TEST_ENV=prod
export TEST_BASE_URL=https://myaccount.example.com
```

---

## 🐛 Debugging

### Run in Debug Mode
```bash
npm test -- --debug
```

### View Traces
Traces are auto-captured on failure in `test-results/`

### Watch Mode
```bash
npm test -- --watch
```

---

## 📊 Reports

### Playwright Report
```bash
npm test
npx playwright show-report
```

### Allure Report
```bash
npm test
npm run allure:generate
npm run allure:report
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Submit a PR with description of changes

---

## 📜 License

MIT

---

## 📧 Support

For questions or issues:
- Open a GitHub issue
- Check existing documentation in `AIContext/`
- Review test examples in `tests/`

---

**Built with ❤️ for reliable, maintainable automation testing**
