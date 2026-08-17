Playwright setup & run

1. Install dependencies:
   npm install
2. Install browsers (required for real runs):
   npx playwright install
3. Set credentials securely (example):
   export TEST_USER=you@example.com
   export TEST_PASS=YourPassword
4. Run tests:
   npx playwright test

Tips:
- Use CI env variable to enable retries: CI=true npx playwright test
- For GitHub Actions, add `npx playwright install --with-deps` in setup step or cache browsers.
