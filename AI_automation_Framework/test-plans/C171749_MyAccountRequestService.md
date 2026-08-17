# Test Plan: C171749 - My Account Request Service (1 item, 1 category)

## A. Test Case Summary

| Field | Value |
|-------|-------|
| **Test Case ID** | C171749 |
| **Title** | My Account Request Service - 1 item, 1 category (with Payment) |
| **Project** | Cinch MyAccount QA |
| **Base URL** | https://myaccount-ui.qa.cinchhs.com |
| **Preconditions** | User is logged into MyAccount system with valid credentials |
| **Total Steps** | 8 |
| **Test Type** | Functional - End-to-End with Payment |
| **Priority** | Critical |

---

## B. Test Data Mapping

| Field | Type | Used In Steps | Reference Key |
|-------|------|---------------|----------------|
| User Email | String | 1 (Login) | `USER_EMAIL` |
| User Password | String | 1 (Login) | `USER_PASSWORD` |
| Service Category | String | 2 (Select Category) | `SERVICE_CATEGORY` |
| Service Item | String | 3 (Select Item) | `SERVICE_ITEM` |
| Request Quantity | Number | 4 (Enter Quantity) | `REQUEST_QUANTITY` |
| Delivery Address | String | 5 (Confirm Delivery) | `DELIVERY_ADDRESS` |
| Card Number | String | 7 (Payment) | `PAYMENT_CARD_NUMBER` |
| Card Expiry | String | 7 (Payment) | `PAYMENT_CARD_EXPIRY` |
| Card CVV | String | 7 (Payment) | `PAYMENT_CARD_CVV` |
| Card Holder Name | String | 7 (Payment) | `PAYMENT_CARDHOLDER_NAME` |
| Billing Address | String | 6 (Billing Info) | `BILLING_ADDRESS` |
| Billing Zip Code | String | 6 (Billing Info) | `BILLING_ZIP` |

**Test Data Configuration:**
```
USER_EMAIL: (from test-credentials.json or TEST_USER env var)
USER_PASSWORD: [SECURE - from vault/env]
SERVICE_CATEGORY: "Medical Supplies" or relevant category
SERVICE_ITEM: "1 item" within selected category
REQUEST_QUANTITY: 1
DELIVERY_ADDRESS: [Current address on file]

# Payment Data (SECURE - Environment Variables Only)
PAYMENT_CARD_NUMBER: [env: TEST_CARD_NUMBER]
PAYMENT_CARD_EXPIRY: [env: TEST_CARD_EXPIRY]  # Format: MM/YY
PAYMENT_CARD_CVV: [env: TEST_CARD_CVV]
PAYMENT_CARDHOLDER_NAME: "Test User" or from account
BILLING_ADDRESS: [Same as delivery or different]
BILLING_ZIP: [Billing zip code]
```

**IMPORTANT: Payment data MUST be stored in environment variables or secure vault, NEVER hardcoded in tests.**

---

## C. Page Flow Overview

```
Login Page
    ↓
Dashboard / Home
    ↓
My Account / Services Section
    ↓
Request Service Page
    ├→ Category Selection (1 category)
    ├→ Item Selection (1 item from category)
    ├→ Quantity/Details Entry
    ├→ Delivery Address Confirmation
    ├→ Review & Continue to Checkout
    └→ Request Submission
    ↓
Checkout / Payment Page
    ├→ Billing Address Entry/Confirmation
    ├→ Order Summary Review
    ├→ Payment Method Selection
    └→ Credit Card Details Entry
    ↓
Payment Processing
    ├→ Card Validation
    ├→ Payment Authorization
    └→ Payment Confirmation
    ↓
Success Confirmation / Order Reference & Receipt
```

---

## D. Step-by-Step Automation Plan

### Step 1: Login to MyAccount System

| Field | Value |
|-------|-------|
| **Step ID** | STEP_001 |
| **Description** | User navigates to MyAccount application and logs in with valid credentials |
| **Action Type** | Navigation + Form Fill + Click |
| **Target Page** | Login Page |
| **Elements** | Email Input, Password Input, Login Button |
| **Primary Locator** | `[data-testid="email-input"]` for email field |
| **Fallback Locators** | `input[type="email"]`, `input[name="email"]`, `#email` |
| **Input Data** | `USER_EMAIL`, `USER_PASSWORD` |
| **Expected Result** | User is authenticated and redirected to Dashboard |
| **Validation Type** | URL redirect + Dashboard element visibility |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `login(email, password)` |
| **Wait Strategy** | Wait for dashboard element visible, Network idle |

**Detailed Steps:**
1. Navigate to base URL (https://myaccount-ui.qa.cinchhs.com)
2. Wait for login form to be visible
3. Fill email field with `USER_EMAIL`
4. Fill password field with `USER_PASSWORD`
5. Click "Sign In" / "Login" button
6. Wait for dashboard to load (network idle + element visibility)

**Assertions:**
- URL contains dashboard path (e.g., `/dashboard`, `/home`)
- Welcome message or user name displayed
- Navigation menu visible

---

### Step 2: Navigate to Request Service Section

| Field | Value |
|-------|-------|
| **Step ID** | STEP_002 |
| **Description** | User navigates to Request Service or My Account Services area |
| **Action Type** | Click Navigation |
| **Target Page** | Dashboard / Services Menu |
| **Elements** | Services Menu Item, Request Service Button/Link |
| **Primary Locator** | `[data-testid="request-service-button"]` |
| **Fallback Locators** | `a[href*="request"]`, `button:has-text("Request Service")`, `.services-nav` |
| **Input Data** | None |
| **Expected Result** | User is taken to Service Request page with category list visible |
| **Validation Type** | Page load + Element visibility |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `navigateToRequestService()` |
| **Wait Strategy** | Wait for service categories list visible, Network idle |

**Detailed Steps:**
1. Locate Services or Request Service navigation element
2. Click on Services/Request Service menu item
3. Wait for service request page to load completely
4. Verify category list is visible

**Assertions:**
- Service request page is displayed
- Category list or dropdown is visible and populated
- Page heading confirms "Request Service" or similar

---

### Step 3: Select Service Category (1 Category)

| Field | Value |
|-------|-------|
| **Step ID** | STEP_003 |
| **Description** | User selects a single service category from available options |
| **Action Type** | Click / Select Dropdown |
| **Target Page** | Service Request Page |
| **Elements** | Category Dropdown / Category List Item |
| **Primary Locator** | `[data-testid="category-select"]` or `select[name="category"]` |
| **Fallback Locators** | `.category-dropdown`, `[aria-label="Service Category"]`, `select#category` |
| **Input Data** | `SERVICE_CATEGORY` |
| **Expected Result** | Selected category is highlighted/confirmed; items for that category appear |
| **Validation Type** | Element selection state + Conditional item list visibility |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `selectServiceCategory(categoryName)` |
| **Wait Strategy** | Wait for dropdown options visible, Wait for items list to update after selection |

**Detailed Steps:**
1. Identify category selection control (dropdown, radio buttons, or list)
2. Click to open category options (if dropdown)
3. Locate and click the specified category from `SERVICE_CATEGORY`
4. Wait for items list to refresh/load
5. Verify category is selected/highlighted

**Assertions:**
- Selected category shows as active/highlighted
- Items list updates to show items only from selected category
- No error messages displayed

---

### Step 4: Select Service Item (1 Item)

| Field | Value |
|-------|-------|
| **Step ID** | STEP_004 |
| **Description** | User selects one item from the category and enters quantity |
| **Action Type** | Click / Form Fill / Select |
| **Target Page** | Service Request Page - Item Selection |
| **Elements** | Item List/Dropdown, Item Checkbox/Radio, Quantity Input |
| **Primary Locator** | `[data-testid="item-select"]` or `input[name="service-item"]` |
| **Fallback Locators** | `.item-option`, `[role="radio"]`, `#serviceItem`, `label:has-text("${SERVICE_ITEM}")` |
| **Input Data** | `SERVICE_ITEM`, `REQUEST_QUANTITY` |
| **Expected Result** | Item is selected; quantity field is visible and editable |
| **Validation Type** | Item selection + Quantity field presence |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `selectServiceItem(itemName, quantity)` |
| **Wait Strategy** | Wait for items list visible, Wait for quantity input visible after item selection |

**Detailed Steps:**
1. Locate the service item matching `SERVICE_ITEM` in the items list
2. Click on item to select (checkbox, radio button, or card click)
3. Verify item is selected (checked, highlighted, or highlighted)
4. Locate quantity input field
5. Clear existing value and enter `REQUEST_QUANTITY` (typically 1)
6. Verify quantity field shows entered value

**Assertions:**
- Item is selected/checked
- Quantity field is visible and enabled
- Quantity value matches entered amount
- No validation errors for quantity

---

### Step 5: Confirm Delivery Address and Proceed to Checkout

| Field | Value |
|-------|-------|
| **Step ID** | STEP_005 |
| **Description** | User confirms delivery address and proceeds to payment/checkout |
| **Action Type** | Click / Form Verification / Click Continue |
| **Target Page** | Service Request Page - Review & Continue |
| **Elements** | Delivery Address Display, Confirm Address Checkbox, Continue/Next Button |
| **Primary Locator** | `[data-testid="continue-to-checkout-button"]` |
| **Fallback Locators** | `button:has-text("Continue")`, `button:has-text("Next")`, `button:has-text("Proceed to Checkout")` |
| **Input Data** | None (uses stored address) |
| **Expected Result** | User is navigated to checkout/payment page |
| **Validation Type** | Page navigation + Checkout page element visibility |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `proceedToCheckout()` |
| **Wait Strategy** | Wait for continue button clickable, Wait for checkout page to load (network idle + payment form visible) |

**Detailed Steps:**
1. Scroll to review section (delivery address, items, quantity)
2. Verify delivery address is correct (from `DELIVERY_ADDRESS` or on-file address)
3. If address confirmation checkbox exists, click to confirm
4. Locate and click "Continue to Checkout" / "Next" / "Proceed" button
5. Wait for checkout page to load completely
6. Verify payment form is visible on checkout page

**Assertions:**
- Delivery address review is displayed and correct
- Page navigates to checkout/payment section
- Payment form is visible and ready for input
- Order summary shows correct item, quantity, and delivery address
- No error messages displayed during navigation

---

### Step 6: Enter Billing Information

| Field | Value |
|-------|-------|
| **Step ID** | STEP_006 |
| **Description** | User enters or confirms billing address information |
| **Action Type** | Form Fill / Select / Click |
| **Target Page** | Checkout / Payment Page - Billing Section |
| **Elements** | Billing Address Fields, Same as Delivery Checkbox, Zip Code Input |
| **Primary Locator** | `[data-testid="billing-address-input"]` or `input[name="billing-address"]` |
| **Fallback Locators** | `input#billingAddress`, `[aria-label="Billing Address"]`, `.billing-section input` |
| **Input Data** | `BILLING_ADDRESS`, `BILLING_ZIP` |
| **Expected Result** | Billing address fields are populated; form validates without errors |
| **Validation Type** | Form field population + No validation errors |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `enterBillingInformation(address, zipCode)` |
| **Wait Strategy** | Wait for billing form visible, Optional: Wait for address lookup/autocomplete |

**Detailed Steps:**
1. Locate billing address section on checkout page
2. Check if "Same as Delivery Address" option exists and is appropriate
   - If yes and addresses match: Click checkbox to auto-fill
   - If no or addresses differ: Manually enter billing address
3. Enter/verify billing address from `BILLING_ADDRESS`
4. Enter/verify billing zip code from `BILLING_ZIP`
5. Verify form accepts input without validation errors
6. Confirm all billing fields are populated correctly

**Assertions:**
- Billing address field displays entered/selected address
- Zip code field displays entered value
- No "required field" errors appear
- Form shows as "valid" or ready to proceed
- Optional: Address autocomplete suggestions appear (if applicable)

---

### Step 7: Enter Payment Card Details

| Field | Value |
|-------|-------|
| **Step ID** | STEP_007 |
| **Description** | User enters credit card details for payment processing |
| **Action Type** | Form Fill / Secure Input |
| **Target Page** | Checkout / Payment Page - Payment Method Section |
| **Elements** | Card Number Input, Expiry Input, CVV Input, Cardholder Name Input |
| **Primary Locator** | `[data-testid="card-number-input"]` or `input[name="cardNumber"]` |
| **Fallback Locators** | `#cardNumber`, `input[placeholder="Card Number"]`, `iframe[title="Card Number"]` |
| **Input Data** | `PAYMENT_CARD_NUMBER`, `PAYMENT_CARD_EXPIRY`, `PAYMENT_CARD_CVV`, `PAYMENT_CARDHOLDER_NAME` |
| **Expected Result** | Card details are entered; card is validated (optional live validation) |
| **Validation Type** | Field population + Optional card validation UI feedback |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `enterPaymentCardDetails(cardNumber, expiry, cvv, cardholderName)` |
| **Wait Strategy** | Wait for payment form visible, Handle potential iframes for card fields (Stripe/Square/etc.) |

**SECURITY NOTES:**
- Card data sourced from environment variables ONLY
- Never log or display card numbers in test output
- Use iframe context if card fields are sandboxed (Stripe, Square, etc.)
- Card data cleared after payment completion

**Detailed Steps:**
1. Locate payment method section on checkout page
2. Verify payment method is set to "Credit Card" (or appropriate selection)
3. **Card Number Field:**
   - Handle iframe context if payment processor sandboxes the field
   - Fill card number from `PAYMENT_CARD_NUMBER`
   - Verify field accepts input without errors
4. **Expiry Field:**
   - Fill expiry date from `PAYMENT_CARD_EXPIRY` (format: MM/YY)
   - Handle auto-formatting if field supports it
5. **CVV Field:**
   - Fill CVV from `PAYMENT_CARD_CVV`
   - Field should be short (3-4 digits)
6. **Cardholder Name Field:**
   - Fill name from `PAYMENT_CARDHOLDER_NAME`
   - Typically matches account name
7. Verify all fields are populated and show accepted state

**Assertions:**
- Card number field displays masked value (e.g., ***1111)
- Expiry field displays in correct format
- CVV field is hidden/masked (security best practice)
- Cardholder name displays correctly
- Optional: Live card validation shows card type (Visa, Mastercard, etc.)
- No validation errors appear for card format

---

### Step 8: Review Order and Submit Payment

| Field | Value |
|-------|-------|
| **Step ID** | STEP_008 |
| **Description** | User reviews final order details and submits payment |
| **Action Type** | Form Verification / Click Submit |
| **Target Page** | Checkout / Payment Page - Order Review & Submit |
| **Elements** | Order Summary, Total Amount, Terms Checkbox, Place Order/Pay Button |
| **Primary Locator** | `[data-testid="place-order-button"]` |
| **Fallback Locators** | `button:has-text("Place Order")`, `button:has-text("Pay Now")`, `button:has-text("Complete Purchase")` |
| **Input Data** | None |
| **Expected Result** | Payment is processed; order is created; confirmation page displays |
| **Validation Type** | Payment success + Order confirmation + URL/Page redirect |
| **Reusable Method** | Yes |
| **Suggested Method Name** | `submitPaymentAndVerifyConfirmation()` |
| **Wait Strategy** | Wait for place order button clickable, Wait for payment processing (network activity), Wait for confirmation page (network idle + success message) |

**Detailed Steps:**
1. Scroll to order review section to verify all details:
   - Item(s) and quantities match request
   - Delivery address is correct
   - Billing address is correct
   - Payment method shows last 4 digits of card
   - Total amount is displayed
2. If Terms & Conditions checkbox exists, verify and click to accept
3. Locate and click "Place Order" / "Pay Now" / "Complete Purchase" button
4. Wait for payment processing to complete
   - Monitor network activity for payment gateway calls
   - Use appropriate wait strategy for payment response (typically 10-30 seconds)
5. Verify confirmation page appears with:
   - Success message
   - Order/Receipt number
   - Order details summary
6. Capture order reference number for tracking and reporting

**Assertions:**
- Order summary displays correct item, quantity, and address
- Payment button is enabled and clickable
- Payment processes without error (no decline message)
- URL changes to confirmation page (e.g., `/confirmation`, `/receipt`, `/order-complete`)
- Success message displays (e.g., "Order placed successfully", "Thank you for your purchase")
- Order/Receipt number is visible and non-empty (format validation: starts with expected prefix)
- Confirmation page displays order details for user reference
- Optional: Email confirmation initiated (check order status or email receipt message)

**Risk Mitigation:**
- Handle payment processing timeout (use 30-45s timeout instead of default)
- Check for "declined" or "error" messages and capture for debugging
- Some payment gateways show confirmation on next page; allow for redirect
- Order number may take 1-2 seconds to populate; use wait with retry

---

## E. Reusable Components & Framework Integration

### Existing Page Objects to Reuse

1. **LoginPage**
   - `login(email, password)` - Handles authentication
   - Already implemented in framework

2. **DashboardPage**
   - `navigateToServices()` - Menu navigation
   - May need extension for request service navigation

3. **Common Utilities**
   - `waitForNetworkIdle()` - Network stability
   - `waitForElementVisible(selector)` - Element visibility waits
   - `captureScreenshot(name)` - On-failure screenshots
   - `handleIframe(iframeSelector, callback)` - For payment processor iframes

### New Components to Create

| Component | Type | Purpose | Justification |
|-----------|------|---------|---------------|
| **ServiceRequestPage** | Page Object | Encapsulate service request form interactions | Specific to this test scenario |
| **CheckoutPage** | Page Object | Payment and billing form interactions | New checkout functionality |
| **PaymentPage** | Page Object | Credit card entry and payment processing | Separate concerns for payment |
| **selectServiceCategory()** | Method | Handle single/multi category selection | Different UI than typical dropdowns |
| **selectServiceItem()** | Method | Select item and set quantity atomically | Common operation in request flow |
| **verifyDeliveryAddress()** | Method | Verify address before submission | Critical validation point |
| **proceedToCheckout()** | Method | Navigate from request to checkout | New step in flow |
| **enterBillingInformation()** | Method | Fill billing address and zip | New payment step |
| **enterPaymentCardDetails()** | Method | Secure card data entry with env var sourcing | New payment step |
| **submitPaymentAndVerifyConfirmation()** | Method | Submit payment and capture order number | Critical for order tracking |
| **getSecureCardData()** | Utility | Source payment data from environment variables | Security best practice |
| **maskCardNumberForLogging()** | Utility | Log card data safely (last 4 digits only) | Security/debugging helper |

---

## F. Risk Analysis & Mitigation

### Failure Points & Mitigation Strategies

| Risk Area | Potential Issue | Mitigation Strategy |
|-----------|-----------------|-------------------|
| **Dynamic Dropdowns** | Category/Item dropdowns load via AJAX | Use network wait + explicit waits for list population |
| **Address Display** | Delivery address may format dynamically | Verify key fields present rather than exact match |
| **Form Validation** | Quantity field may have client-side validation | Test with valid numeric input; handle validation messages |
| **Async Submission** | Request may process asynchronously | Wait for network idle + success message visibility (not just redirect) |
| **Session Timeout** | Long waits might timeout session | Use sensible timeouts (30-60s); retry login if needed |
| **Locator Brittleness** | UI might change between builds | Prioritize data-testid, then role-based, then CSS |
| **Multi-category Complexity** | Test says "1 category" but UI may show many | Use explicit category lookup, not index-based selection |

### Flaky Areas & Smart Wait Strategies

1. **Category Load:** Category list appears after page load
   - Wait: `waitForElementVisible('[data-testid="category-select"]')`
   - Timeout: 10s
   - Retry: Yes

2. **Item Population:** Items list refreshes on category change
   - Wait: `waitForElementVisible('.item-list')`
   - Wait: Network idle (after category selection)
   - Timeout: 8s

3. **Checkout Navigation:** Redirect to checkout page after continue
   - Wait: Network idle
   - Wait: `waitForElementVisible('[data-testid="payment-form"]')`
   - Timeout: 10s

4. **Payment iframe Loading:** Stripe/Square/etc. iframes load asynchronously
   - Wait: iframe document ready
   - Wait: Card input field visible within iframe
   - Timeout: 8s
   - Retry: Yes (iframes can be flaky)

5. **Payment Processing:** Payment gateway call and response
   - Wait: Network activity for payment endpoint
   - Wait: Confirmation page loads after success
   - Timeout: 30-45s (payment processors are slower)
   - Retry: No (do not retry payment submissions)

6. **Order Number Population:** Order ID may take 1-2s to appear on confirmation
   - Wait: `waitForElementVisible('[data-testid="order-number"]')`
   - Timeout: 5s with polling every 500ms
   - Retry: Yes

---

## G. Test Execution Flow (Pseudocode)

```pseudocode
Test: "My Account Request Service - 1 item, 1 category (with Payment)"
  
  Setup:
    - Load test data (credentials, category, item, quantity, address)
    - Load secure payment data from environment variables
    - Set base URL to https://myaccount-ui.qa.cinchhs.com
    - Verify payment data is available (fail fast if missing)
  
  Test Steps:
    1. Login(USER_EMAIL, USER_PASSWORD)
       - Assert: Dashboard loaded
       - Capture: Screenshot on failure
    
    2. NavigateToRequestService()
       - Assert: Service request page visible
       - Wait: Category list populated
    
    3. SelectServiceCategory(SERVICE_CATEGORY)
       - Assert: Category selected/highlighted
       - Wait: Items list updated
    
    4. SelectServiceItem(SERVICE_ITEM, REQUEST_QUANTITY)
       - Assert: Item selected
       - Assert: Quantity field shows value
    
    5. VerifyDeliveryAddress(DELIVERY_ADDRESS)
       - Assert: Address matches (or confirm on-file address)
    
    6. ProceedToCheckout()
       - Click: Continue/Next button
       - Wait: Checkout page loaded
       - Wait: Payment form visible
       - Capture: Order summary for verification
    
    7. EnterBillingInformation(BILLING_ADDRESS, BILLING_ZIP)
       - Fill: Billing address fields
       - Assert: No validation errors
       - Verify: Form shows valid state
    
    8. EnterPaymentCardDetails(
         PAYMENT_CARD_NUMBER,
         PAYMENT_CARD_EXPIRY,
         PAYMENT_CARD_CVV,
         PAYMENT_CARDHOLDER_NAME
       )
       - Handle: iframe context if payment processor sandboxes
       - Fill: Card fields securely
       - Assert: Card is validated (if live validation enabled)
       - Log: Masked card info (last 4 digits only)
    
    9. SubmitPaymentAndVerifyConfirmation()
       - Click: Place Order / Pay Now button
       - Wait: Payment processing (30-45s timeout)
       - Wait: Confirmation page loaded
       - Capture: Order/Receipt number
       - Assert: Success message visible
    
    10. AssertOrderCreated()
        - Assert: Confirmation page shows all order details
        - Assert: Order number is present and non-empty
        - Assert: Order summary matches request (item, quantity, address)
        - Capture: Receipt for audit trail
  
  Cleanup:
    - Clear payment data from memory
    - Logout or navigate away
    - Clear test data from session
    - Optional: Verify order in backend (API call to confirm)
```

---

## H. Generator Instructions

### Code Generation Guidelines

1. **Test Structure**
   ```typescript
   test.describe('My Account - Service Request with Payment', () => {
     test('Request service with 1 item, checkout, and payment', async ({ page }) => {
       // Steps 1-10 implemented here
     });
   });
   ```

2. **Allure Annotations**
   ```typescript
   test.describe('MyAccount - Service Requests (E2E with Payment)', () => {
     test('@critical @e2e @payment "Request service - 1 item, 1 category, complete payment"', async ({ page }) => {
       // Allure.feature('Request Service with Payment')
       // Allure.story('End-to-end: request to order confirmation')
       // Allure.severity('CRITICAL')
     });
   });
   ```

3. **Data Binding Approach**
   - Use test data object passed as parameter
   - Keep credentials secure (use environment variables or vault)
   - **Payment Data MUST be sourced from environment variables ONLY**
   - Map test data keys to actual values in setup/fixture
   - Use helper function to validate env vars are present before test runs

   ```typescript
   function loadPaymentData() {
     const cardNumber = process.env.TEST_CARD_NUMBER;
     const cardExpiry = process.env.TEST_CARD_EXPIRY;
     const cardCVV = process.env.TEST_CARD_CVV;
     
     if (!cardNumber || !cardExpiry || !cardCVV) {
       throw new Error('Missing payment test data in environment variables');
     }
     
     return { cardNumber, cardExpiry, cardCVV };
   }
   ```

4. **Special Handling**
   - **Network Waits:** Use `waitForNavigation()` or `waitForLoadState('networkidle')`
   - **Payment Iframe:** Check for iframe context and use `frameLocator()` for Stripe/Square fields
   - **Async Operations:** Don't assume submission is instant; wait for success message
   - **Address Verification:** May require fuzzy matching (trimmed whitespace, case-insensitive)
   - **Order Number Capture:** Extract and log confirmation number for traceability
   - **Payment Processing Timeout:** Use 30-45s timeout (longer than default 30s)
   - **Card Masking in Logs:** Only log last 4 digits of card for security

5. **Error Handling**
   - Catch validation errors (e.g., quantity out of range, card declined)
   - Log error messages for debugging (sanitized - no sensitive data)
   - Screenshot on every assertion failure
   - Report captured order number even on failure (for cleanup/manual verification)
   - Handle payment declines gracefully (test data should be valid, but handle edge cases)

   ```typescript
   try {
     await paymentPage.submitPayment();
   } catch (error) {
     if (error.message.includes('declined')) {
       console.error('Payment declined - check card validity');
     }
     throw error;
   }
   ```

6. **Assertions (Playwright expect)**
   ```typescript
   // Success message visible
   await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
   
   // Order/Receipt number captured
   await expect(page.locator('[data-testid="order-number"]')).toContainText(/ORD-\d{6,10}/);
   
   // URL redirected to confirmation
   await expect(page.url()).toContain('/confirmation');
   
   // Order details match request
   const orderItem = page.locator('[data-testid="order-item"]');
   await expect(orderItem).toContainText(SERVICE_ITEM);
   
   // Card masked properly in display
   const cardDisplay = page.locator('[data-testid="card-display"]');
   await expect(cardDisplay).toContainText(/\*\*\*\*\s*1111/);
   ```

7. **Test Data Example**
   ```typescript
   const testData = {
     email: process.env.TEST_USER_EMAIL,
     password: process.env.TEST_USER_PASSWORD,
     category: 'Medical Supplies',
     item: 'Face Masks - Box of 50',
     quantity: 1,
     deliveryAddress: 'On File',
     billingAddress: '123 Main St, City, ST 12345',
     billingZip: '12345',
     // Payment data loaded from env vars via helper function
   };
   ```

8. **Payment Security Best Practices**
   ```typescript
   // NEVER log actual card numbers
   console.log(`Attempting payment with card ending in ${cardNumber.slice(-4)}`);
   
   // Clear card data after use
   const paymentData = { cardNumber, cardExpiry, cardCVV };
   // ... use paymentData ...
   // Clear from memory when done
   Object.keys(paymentData).forEach(key => delete paymentData[key]);
   
   // Use secure iframe context for Stripe/Square
   const cardNumberFrame = page.frameLocator('iframe[title="Card Number"]');
   await cardNumberFrame.locator('input').fill(cardNumber);
   ```

---

## I. Execution Checklist

### Pre-Test Setup
- [ ] Test case ID confirmed: C171749
- [ ] Base URL verified: https://myaccount-ui.qa.cinchhs.com
- [ ] Test data sourced and secured
- [ ] **Payment test data loaded in environment variables:**
  - [ ] `TEST_CARD_NUMBER` = (from env var)
  - [ ] `TEST_CARD_EXPIRY` = "03/29"
  - [ ] `TEST_CARD_CVV` = (from env var)
  - [ ] `TEST_CARDHOLDER_NAME` = "Test User" or account name
- [ ] Locators validated against live application
- [ ] Page objects created/updated
- [ ] Wait strategies defined for each step
- [ ] Success criteria clearly defined
- [ ] Error scenarios considered
- [ ] Fallback locators provided for resilience
- [ ] Screenshots/video capture configured

### Payment-Specific Checks
- [ ] Payment processor identified (Stripe, Square, PayPal, etc.)
- [ ] iframe handling implemented if needed
- [ ] Card decline scenarios documented
- [ ] Payment timeout set to 30-45 seconds
- [ ] Order number capture regex pattern validated
- [ ] Confirmation page URL pattern identified
- [ ] Payment data sanitization in logs implemented
- [ ] No sensitive data in error messages
- [ ] Test card validity verified (use test/sandbox card only)

### Security Validation
- [ ] No hardcoded credit card numbers in code
- [ ] No payment data logged to console or files
- [ ] Environment variables used for all sensitive data
- [ ] Test data cleared from memory after payment
- [ ] Payment forms never captured in screenshots
- [ ] Only last 4 digits of card displayed in reports
- [ ] iframe content isolated (if applicable)

### Final Verification
- [ ] Test case is independent and repeatable
- [ ] Test can be run multiple times without order conflicts
- [ ] Documentation reviewed and accepted by QA lead
- [ ] Security review completed by InfoSec team
- [ ] Payment processor testing approved

---

## J. Appendix: Locator Discovery Strategy

### Priority Order for Locator Selection:

1. **data-testid (PREFERRED)**
   - Most stable, explicitly added by developers
   - Example: `[data-testid="submit-button"]`

2. **Role-Based Selectors**
   - Semantic and accessible
   - Example: `button:has-text("Submit")`
   - Example: `[role="button"][aria-label="Submit"]`

3. **Label/Text-Based**
   - User-facing and readable
   - Example: `label:has-text("Service Category")`

4. **CSS/XPath (LAST RESORT)**
   - Brittle, avoid unless necessary
   - Example: `.form-section > .category-dropdown`

### Fallback Chain Example:
```
Primary:    [data-testid="category-select"]
Fallback 1: select[name="category"]
Fallback 2: [aria-label="Service Category"]
Fallback 3: .category-dropdown
Fallback 4: select#category
```

---

## K. Environment Variable Configuration

### Required Environment Variables for Test Execution

**Create a `.env.test` file in the project root (ADD TO .gitignore):**

```bash
# Test User Credentials
TEST_USER_EMAIL=(from test-credentials.json or TEST_USER env var)
TEST_USER_PASSWORD=<secure-password>

# Service Request Test Data
TEST_SERVICE_CATEGORY="Medical Supplies"
TEST_SERVICE_ITEM="Face Masks - Box of 50"
TEST_SERVICE_QUANTITY=1
TEST_DELIVERY_ADDRESS="123 Test St, Test City, TS 12345"

# Billing Information
TEST_BILLING_ADDRESS="123 Test St, Test City, TS 12345"
TEST_BILLING_ZIP="12345"

# Payment Test Card Data (SANDBOX/TEST ONLY)
TEST_CARD_NUMBER=<test-card-number>
TEST_CARD_EXPIRY=03/29
TEST_CARD_CVV=<cvv>
TEST_CARDHOLDER_NAME="Test User"

# Optional: Payment Gateway Configuration
TEST_PAYMENT_PROCESSOR=stripe  # or "square", "paypal", etc.
TEST_PAYMENT_TIMEOUT=45000  # milliseconds
```

### Loading Environment Variables in Test

**Option 1: Using dotenv package**
```typescript
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const testData = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
  cardNumber: process.env.TEST_CARD_NUMBER,
  cardExpiry: process.env.TEST_CARD_EXPIRY,
  cardCVV: process.env.TEST_CARD_CVV,
};
```

**Option 2: Using playwright.config.ts**
```typescript
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  use: {
    baseURL: 'https://myaccount-ui.qa.cinchhs.com',
    env: {
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
      TEST_CARD_NUMBER: process.env.TEST_CARD_NUMBER,
      // ... other env vars
    },
  },
});
```

### GitHub Actions / CI/CD Configuration

**Add to `.github/workflows/test.yml`:**
```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  TEST_CARD_NUMBER: ${{ secrets.TEST_CARD_NUMBER }}
  TEST_CARD_EXPIRY: ${{ secrets.TEST_CARD_EXPIRY }}
  TEST_CARD_CVV: ${{ secrets.TEST_CARD_CVV }}
  TEST_CARDHOLDER_NAME: ${{ secrets.TEST_CARDHOLDER_NAME }}
```

**Add secrets in GitHub Settings → Secrets and variables → Actions**

### Local Testing Setup

```bash
# 1. Copy template and add real values
cp .env.test.template .env.test

# 2. Edit .env.test with actual test data
vim .env.test

# 3. Ensure .env.test is in .gitignore (CRITICAL)
echo ".env.test" >> .gitignore

# 4. Run tests
npm run test -- C171749
```

### Security Reminders

⚠️ **NEVER COMMIT** `.env.test` with real test data  
⚠️ **NEVER LOG** card numbers or CVV in console  
⚠️ **NEVER SHARE** test card details in messages or emails  
⚠️ **ALWAYS USE** sandbox/test credentials for QA environments  
⚠️ **ROTATE** test card data periodically  

---

## L. Payment Processor-Specific Notes

### Stripe Integration
- Card fields may be in iframes (elements or hosted fields)
- Use `frameLocator()` to access card number, expiry, CVC inputs
- Test card: CARD_NUMBER_REDACTED (always use provided test card)
- Handles validation automatically (format checking on blur)

### Square Integration
- Web Payments SDK uses iframes for hosted fields
- Request ID must be unique per transaction (Square handles this)
- Test card: CARD_NUMBER_REDACTED
- CVV field may be combined with card number field

### PayPal Integration
- May redirect to external PayPal page
- Use `waitForNavigation()` for redirect handling
- Handle popup windows if PayPal login required
- Sandbox account needed for testing

### Generic Payment Gateway
- Identify iframe structure and field names
- Use `frameLocator('iframe[title="..."]')` for iframes
- Test with provided sandbox credentials
- Document any special validation requirements

---

**Document Version:** 2.0 (Enhanced with Payment)  
**Last Updated:** 2026-06-23  
**Created By:** Playwright Test Planner Agent  
**Status:** Ready for Generator Implementation with Payment Automation
