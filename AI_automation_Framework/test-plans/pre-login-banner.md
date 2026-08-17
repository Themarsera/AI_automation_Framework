# Pre-Login Banner Test Plan

## Application Overview

The Cinch My Account login page (https://myaccount-ui.qa.cinchhs.com/login) displays a promotional/informational banner BEFORE a user logs in. The banner contains the text "Why create an account? Click here." rendered inside a PrimeNG `p-message` component with `role="alert"`. The "Click here." text is an anchor element that navigates the unauthenticated user to a dedicated "Why Create Account" page at /login/whyCreateAccount. This test plan covers: banner visibility on the login page, CTA navigation, destination page content validation, and banner persistence after returning to the login page. No login is performed at any point.

## Test Scenarios

### 1. Pre-Login Banner

**Seed:** ``

#### 1.1. Banner is visible on the login page before authentication @critical

**File:** `tests/pre-login-banner/banner-visibility.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com/login and wait for the page to reach domcontentloaded state.
    - expect: Page URL is https://myaccount-ui.qa.cinchhs.com/login
    - expect: Page title is 'Cinch My Account'
  2. Assert that the banner element with role='alert' is visible. Locator: page.getByRole('alert')
    - expect: The alert banner is visible in the DOM above the login form
  3. Assert the banner text content. Locator: page.getByRole('alert') — check text includes 'Why create an account?' and 'Click here.'
    - expect: Banner displays full text: 'Why create an account? Click here.'
  4. Assert that the 'Click here.' anchor link is present inside the alert. Locator: page.getByRole('alert').locator('a')
    - expect: An anchor element with text ' Click here.' is present inside the alert banner

#### 1.2. Banner CTA navigates to Why Create Account page @critical @e2e

**File:** `tests/pre-login-banner/banner-cta-navigation.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com/login and wait for domcontentloaded.
    - expect: Login page is loaded with URL https://myaccount-ui.qa.cinchhs.com/login
  2. Locate the 'Click here.' anchor link inside the alert banner. Locator: page.getByRole('alert').locator('a') — the link has text ' Click here.' and no href attribute (it uses a click event handler).
    - expect: The 'Click here.' link is visible and interactive inside the alert banner
  3. Click the 'Click here.' anchor link. Because the element has no href, use JavaScript click: await page.getByRole('alert').locator('a').click() or evaluate document.querySelector('[role="alert"] a').click()
    - expect: Browser navigates to https://myaccount-ui.qa.cinchhs.com/login/whyCreateAccount
  4. Wait for the destination page to fully load (domcontentloaded) and assert the URL.
    - expect: Page URL is exactly https://myaccount-ui.qa.cinchhs.com/login/whyCreateAccount
    - expect: Page title remains 'Cinch My Account'
  5. Assert the page heading is visible. Locator: page.getByRole('heading', { name: 'Why create an online account?', level: 2 })
    - expect: Heading 'Why create an online account?' (h2) is visible on the destination page
  6. Assert the subtitle/description paragraph is visible. Locator: page.getByText("It's a convenient, secure way to access your home protection plan online.")
    - expect: Paragraph text 'It's a convenient, secure way to access your home protection plan online.' is visible
  7. Assert the sub-heading is visible. Locator: page.getByRole('heading', { name: 'With an online account, you can:', level: 3 })
    - expect: Heading 'With an online account, you can:' (h3) is visible
  8. Assert the benefits list items are all visible. Locator: use page.getByRole('listitem') to check for each item.
    - expect: List contains all 6 items: 'Download your plan documents', 'Make service requests', 'Track service requests', 'Manage your payments', 'Access member benefits', 'Update your information'
  9. Assert the 'Get started' button is visible. Locator: page.getByRole('button', { name: 'Get started' })
    - expect: 'Get started' button is visible and enabled on the destination page
  10. Assert the 'Login' button is visible. Locator: page.getByRole('button', { name: 'Login' })
    - expect: 'Login' button is visible and enabled on the destination page

#### 1.3. Banner persists after navigating back from destination page @critical

**File:** `tests/pre-login-banner/banner-persistence.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com/login and wait for domcontentloaded.
    - expect: Login page is loaded
  2. Click the 'Click here.' CTA anchor link inside the alert banner. Locator: evaluate document.querySelector('[role="alert"] a').click()
    - expect: Browser navigates to https://myaccount-ui.qa.cinchhs.com/login/whyCreateAccount
  3. Wait for the destination page to load and assert URL is https://myaccount-ui.qa.cinchhs.com/login/whyCreateAccount.
    - expect: Destination page is loaded successfully
  4. Use browser back navigation: await page.goBack()
    - expect: Browser navigates back to https://myaccount-ui.qa.cinchhs.com/login
  5. Wait for domcontentloaded and assert the alert banner is still visible. Locator: page.getByRole('alert')
    - expect: The alert banner with role='alert' is visible again on the login page after navigating back
  6. Assert the banner text is still correct. Locator: page.getByRole('alert') — verify text includes 'Why create an account?' and 'Click here.'
    - expect: Banner still displays 'Why create an account? Click here.' after returning to the login page
  7. Assert the 'Click here.' anchor link is still present and interactive inside the banner. Locator: page.getByRole('alert').locator('a')
    - expect: The 'Click here.' anchor link is still present inside the alert banner after navigating back

#### 1.4. Banner is displayed unauthenticated only — user never reaches protected routes

**File:** `tests/pre-login-banner/banner-unauthenticated-state.spec.ts`

**Steps:**
  1. Navigate directly to https://myaccount-ui.qa.cinchhs.com/login without any credentials or session cookies.
    - expect: Page URL is https://myaccount-ui.qa.cinchhs.com/login
    - expect: No redirect occurs to a protected route
  2. Assert the alert banner is visible without any login action. Locator: page.getByRole('alert')
    - expect: Alert banner is visible immediately on page load without authentication
  3. Assert the login form is also visible alongside the banner (Email textbox, Password textbox, Log in button). Locators: page.getByRole('textbox', { name: 'Email' }), page.getByRole('textbox', { name: 'Password' }), page.getByRole('button', { name: 'Log in' })
    - expect: Login form elements (Email, Password, Log in button) are all visible on the page alongside the banner
  4. Assert the 'Create an account' section is visible below the login form. Locator: page.getByRole('button', { name: 'Create account' })
    - expect: The 'Create account' button is visible, confirming the full unauthenticated login page layout is intact with the banner
