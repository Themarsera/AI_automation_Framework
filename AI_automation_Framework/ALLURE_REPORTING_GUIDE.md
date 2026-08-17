# Allure Reporting Integration Guide

## 📊 Allure Reporting Now Integrated!

Allure Report has been successfully integrated into your Playwright project for beautiful, detailed test reports.

---

## 🚀 Quick Start

### 1. Run Tests and Generate Report
```bash
# Run tests and auto-generate + open report
npm run test:allure
```

### 2. Alternative Commands

**Run tests only:**
```bash
npx playwright test tests/sp-complete-service-request-flow.spec.ts --headed
```

**Generate report from results:**
```bash
npm run allure:generate
```

**Open generated report:**
```bash
npm run allure:open
```

**Serve report (auto-refresh):**
```bash
npm run allure:serve
```

---

## 📋 What's in the Report?

### Dashboard Overview
- ✅ Total tests executed
- ⏱️ Execution time
- 📊 Pass/Fail/Skip statistics
- 📈 Trends over time
- 🎯 Success rate percentage

### Test Details
- 📝 Step-by-step execution
- ⏰ Duration for each step
- 📸 Screenshots (on failure)
- 🎥 Video recordings
- 📋 Console logs
- 🔍 Network traces

### Categorization
- **Critical Tests** - Tests tagged with @critical
- **E2E Tests** - End-to-end flow tests tagged with @e2e
- **Failed Tests** - Automatically grouped
- **Broken Tests** - Tests with infrastructure issues

### Environment Info
- Test Environment: QA
- Base URL: https://myaccount-ui.qa.cinchhs.com
- Browser: Chromium
- Node Version: (current version)

---

## 🎯 Using Allure Decorators in Tests

You can enhance your tests with Allure annotations:

```typescript
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('SP Service Request Flow', () => {
  test('@critical @e2e Complete flow', async ({ page }) => {
    // Add test description
    await allure.description('Complete service request flow from login to confirmation');
    
    // Add owner
    await allure.owner('QA Team');
    
    // Add tags
    await allure.tag('smoke', 'regression');
    
    // Add severity
    await allure.severity('critical');
    
    // Create steps with descriptions
    await allure.step('Login to application', async () => {
      await page.goto('https://myaccount-ui.qa.cinchhs.com');
      const creds = getTestCredentials();
      await page.getByRole('textbox', { name: 'Email' }).fill(creds!.user);
      await page.getByRole('textbox', { name: 'Password' }).fill(creds!.pass);
      await page.getByRole('button', { name: 'Log in' }).click();
    });
    
    await allure.step('Navigate to Service Request', async () => {
      await page.getByRole('button', { name: 'Request service' }).click();
    });
    
    // Attach screenshots
    const screenshot = await page.screenshot();
    await allure.attachment('Dashboard Screenshot', screenshot, 'image/png');
    
    // Attach JSON data
    await allure.attachment('Test Data', JSON.stringify({
      email: '(redacted)',
      item: 'Refrigerator',
      serial: 'SN12345'
    }), 'application/json');
  });
});
```

---

## 📂 Project Structure After Integration

```
MyAccount_Playwright_UI_Testsuite/
├── allure-results/          ← Raw test results (generated after test run)
├── allure-report/           ← HTML report (generated from results)
├── playwright.config.ts     ← Updated with allure-playwright reporter
├── package.json             ← Updated with Allure scripts
└── tests/
    └── sp-complete-service-request-flow.spec.ts
```

---

## 🔄 Workflow

### Development Workflow
```bash
# 1. Run test
npx playwright test tests/sp-complete-service-request-flow.spec.ts --headed

# 2. Generate report
npm run allure:generate

# 3. Open report in browser
npm run allure:open
```

### Quick Workflow (All-in-One)
```bash
npm run test:allure
```

### CI/CD Workflow
```bash
# Run tests (generates allure-results/)
npx playwright test

# Generate report
npm run allure:generate

# Publish allure-report/ as artifact
```

---

## 🎨 Report Features

### 1. **Overview Dashboard**
- Test execution summary
- Duration trends
- Success rate graph
- Test categories breakdown

### 2. **Suites View**
- Tests organized by test suite
- Hierarchical test structure
- Quick filtering by status

### 3. **Graphs**
- Status breakdown (pie chart)
- Severity distribution
- Duration trends over time
- Top 10 slowest tests

### 4. **Timeline**
- Visual timeline of test execution
- Parallel test execution view
- Step-by-step timing

### 5. **Behaviors**
- Tests grouped by features
- User stories view
- BDD-style organization

### 6. **Packages**
- Tests organized by file structure
- Package-level statistics

---

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run test:allure` | Run tests + generate + open report (all-in-one) |
| `npm run allure:generate` | Generate HTML report from results |
| `npm run allure:open` | Open existing report in browser |
| `npm run allure:serve` | Serve report with live reload |

---

## 🔍 Advanced Configuration

The Allure reporter is configured in `playwright.config.ts`:

```typescript
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['allure-playwright', {
    detail: true,                    // Detailed step reporting
    outputFolder: 'allure-results',  // Results directory
    suiteTitle: false,               // Use test file name as suite
    categories: [...],               // Custom categories
    environmentInfo: {...}           // Environment details
  }]
]
```

---

## 🐛 Troubleshooting

### Issue: "allure: command not found"
**Solution:** Ensure allure-commandline is installed:
```bash
npm install --save-dev allure-commandline
```

### Issue: No report generated
**Solution:** Run tests first to generate results:
```bash
npx playwright test
npm run allure:generate
```

### Issue: Old results in report
**Solution:** Clean results before running:
```bash
rm -rf allure-results allure-report
npx playwright test
npm run allure:generate
```

### Issue: Port already in use
**Solution:** Kill existing Allure server:
```bash
lsof -ti:random_port | xargs kill -9
npm run allure:open
```

---

## 📸 Report Screenshots

When you open the Allure report, you'll see:

1. **Dashboard** - Overview with statistics and graphs
2. **Test Details** - Step-by-step execution with timing
3. **Attachments** - Screenshots, videos, logs
4. **History** - Test execution trends over time
5. **Categories** - Tests grouped by type (Critical, E2E, etc.)

---

## 🎯 Benefits

### Over Standard Playwright HTML Report:
- ✅ **Better Visualization** - Beautiful graphs and charts
- ✅ **Historical Trends** - Track test stability over time
- ✅ **Better Organization** - Categories, tags, severity levels
- ✅ **Rich Annotations** - Steps, attachments, descriptions
- ✅ **BDD Support** - Feature/Story organization
- ✅ **Team Friendly** - Easy to share and understand
- ✅ **CI/CD Integration** - Works great with Jenkins, GitHub Actions, etc.

---

## 🚀 Next Steps

1. **Run your first test with Allure:**
   ```bash
   npm run test:allure
   ```

2. **Explore the report** - Check out all the features

3. **Enhance tests** - Add Allure decorators for better reporting

4. **Share reports** - Export and share with team

5. **Integrate with CI** - Publish reports as build artifacts

---

## 📚 Resources

- [Allure Playwright Documentation](https://www.npmjs.com/package/allure-playwright)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [Allure Examples](https://demo.qameta.io/allure/)

---

**Allure Reporting is now ready to use! 🎉**

Run `npm run test:allure` to see your first beautiful report!
