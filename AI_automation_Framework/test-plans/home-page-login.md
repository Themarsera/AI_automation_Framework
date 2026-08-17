# Home Page / Login Test Plan

## Application Overview

Cinch My Account web application at https://myaccount-ui.qa.cinchhs.com. The application provides a home warranty account management portal. Users start at the login page (/login) and, after successful authentication, land on the dashboard (/dashboard). The dashboard displays a welcome message, the user's active plan(s), a plan-selector dropdown, an "Add a plan" button, recent activity, payment summary, and navigation links. Navigation is available through a hamburger "Menu Button" (left side) that reveals a side-panel menu, and through a "User menu button" (top-right avatar icon) that reveals a compact dropdown menu with Payments, Profile Settings, and Log Out options. The "Add a plan" button navigates to /dashboard/linkPlan (titled "Let's locate your plan"). The Payments link navigates to /payments and shows a "Payments" heading (h2). Logging out via the user dropdown returns the user to the login page.

## Test Scenarios

### 1. Login Page

**Seed:** ``

#### 1.1. [C169781] Login with Correct Credentials @critical @e2e

**File:** `tests/login/C169781-login-correct-credentials.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com
    - expect: The login page loads at /login
    - expect: The page title is 'Cinch My Account'
    - expect: The 'Log in' heading is visible
    - expect: The Email text input (role: textbox, name: 'Email') is present
    - expect: The Password text input (role: textbox, name: 'Password') is present
    - expect: The 'Log in' button (role: button, name: 'Log in') is present
  2. Fill the Email field (page.getByRole('textbox', { name: 'Email' })) with 'rlenka@cchs.com'
    - expect: The email field shows the entered value
  3. Fill the Password field (page.getByRole('textbox', { name: 'Password' })) with the valid password from test-credentials.json
    - expect: The password field accepts the input
  4. Click the 'Log in' button (page.getByRole('button', { name: 'Log in' }))
    - expect: The page navigates away from /login
    - expect: The URL contains /dashboard
    - expect: No error alert is shown
  5. Wait for the dashboard to fully load — wait for the heading 'My plans' (page.getByRole('heading', { name: 'My plans' })) to be visible
    - expect: The URL is on the /dashboard path
    - expect: The welcome message 'Welcome back Wesley!' paragraph is visible
    - expect: The 'My plans' heading (level 4) is visible
    - expect: The 'Add a plan button' button (page.getByRole('button', { name: 'Add a plan button' })) is visible
    - expect: The active plan heading 'Cinch Repair + Replace' (level 1 heading) is visible
    - expect: The 'Request service' and 'Plan details' buttons are visible
    - expect: The 'User menu button' and 'Menu Button' are visible in the header

#### 1.2. [C169782] Login with Incorrect Credentials @critical

**File:** `tests/login/C169782-login-incorrect-credentials.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com
    - expect: The login page loads at /login
    - expect: The Email and Password fields and 'Log in' button are visible
  2. Fill the Email field (page.getByRole('textbox', { name: 'Email' })) with 'wrong@test.com'
    - expect: The email field shows 'wrong@test.com'
  3. Fill the Password field (page.getByRole('textbox', { name: 'Password' })) with 'WrongPass123'
    - expect: The password field accepts the input
  4. Click the 'Log in' button (page.getByRole('button', { name: 'Log in' }))
    - expect: The page remains on /login (no navigation to /dashboard)
    - expect: An alert element (role: alert) appears containing the error message 'Wrong email or password.'
    - expect: The Email field still shows 'wrong@test.com'
    - expect: The Password field still shows the entered value
  5. Verify the exact error message text within the alert (page.getByRole('alert').filter that contains 'Wrong email or password.')
    - expect: The error alert contains the text 'Wrong email or password.' exactly as observed in the live app
    - expect: The user is not redirected away from the login page

### 2. Dashboard Page

**Seed:** ``

#### 2.1. [C171774] Verify 'Add a plan' and 'Payments' links on Dashboard page @e2e

**File:** `tests/dashboard/C171774-dashboard-links.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com and log in with valid credentials (email: rlenka@cchs.com, password from test-credentials.json) using the Email textbox, Password textbox, and 'Log in' button
    - expect: The user is authenticated and the dashboard loads at /dashboard
    - expect: The 'Add a plan button' button is visible
    - expect: The 'Menu Button' (hamburger) is visible in the header
  2. Click the 'Add a plan button' button (page.getByRole('button', { name: 'Add a plan button' }))
    - expect: The URL changes to /dashboard/linkPlan
    - expect: The page displays the text 'Let's locate your plan' as a section heading
    - expect: Three search-option buttons are visible: 'Phone', 'Address', and 'Plan Number'
    - expect: The 'Phone Number' and 'ZIP Code' input fields are visible (default search tab is Phone)
    - expect: The 'Back' button is visible
  3. Navigate back to the dashboard by clicking the 'Back' button (page.getByRole('button', { name: 'Back' })) on the linkPlan page
    - expect: The URL returns to /dashboard
    - expect: The dashboard content is visible including the 'Add a plan button' button
  4. Click the 'Menu Button' (page.getByRole('button', { name: 'Menu Button' })) to open the side navigation panel
    - expect: A side navigation panel/drawer opens
    - expect: A menu with the following items is visible: 'Home', 'My Plan', 'My Service Requests', 'Payments', 'Perks & Benefits', 'Profile Settings', 'Contact Us'
    - expect: The 'Payments' link (page.getByRole('link', { name: ' Payments' })) is visible within the menu
  5. Click the 'Payments' link (page.getByRole('link', { name: ' Payments' })) in the side navigation menu
    - expect: The URL changes to /payments
    - expect: The page displays a 'Payments' heading (level 2, page.getByRole('heading', { name: 'Payments', level: 2 }))
    - expect: The address '5412 EDSALL RIDGE PL, ALEXANDRIA, VA 22312' is shown
    - expect: A payment summary section is visible with 'Payments due', 'Update billing' button, and a transaction history table
    - expect: The transaction table has columns: 'Date', 'Payment type', 'Amount'
  6. Navigate back to the dashboard by clicking the 'Home' link (page.getByRole('link', { name: 'Home' })) in the header
    - expect: The URL changes back to /dashboard
    - expect: The dashboard content is visible
  7. Verify the 'Payments' link is also accessible from the User menu dropdown: click the 'User menu button' (page.getByRole('button', { name: 'User menu button' })) in the top right
    - expect: A dropdown menu opens showing: the user name 'WESLEY BEESON', 'Payments' link, 'Profile Settings' link, and 'Log Out' link
    - expect: The user dropdown menu item 'Payments' (page.getByRole('menuitem', { name: 'Payments' })) is visible
  8. Click the 'Payments' menuitem link in the user dropdown (page.getByRole('link', { name: ' Payments' }))
    - expect: The URL changes to /payments
    - expect: The 'Payments' h2 heading is visible on the page
