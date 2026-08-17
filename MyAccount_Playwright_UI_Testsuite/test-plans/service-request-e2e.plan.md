# End-to-End Service Request Flow Test Plan

## Application Overview

This test plan covers the complete end-to-end flow for submitting a service request through the Cinch My Account portal. The flow includes user authentication, appliance/issue selection, appointment scheduling, payment processing, and confirmation verification. The tests validate all critical paths, error scenarios, and edge cases to ensure a smooth user experience from login to confirmation.

## Test Scenarios

### 1. Service Request End-to-End Flow

**Seed:** `seed.spec.ts`

#### 1.1. Complete service request with valid data - Happy Path

**File:** `tests/service-request-e2e/happy-path.spec.ts`

**Steps:**
  1. Navigate to the login page at /login
    - expect: The login page loads successfully
    - expect: Email and password fields are visible
    - expect: Login button is enabled
    - expect: Create account option is available
  2. Enter valid test credentials (email: from test-credentials.json, password: from test-credentials.json) and click Log in
    - expect: User is authenticated successfully
    - expect: Page redirects to /dashboard
    - expect: Welcome message displays user's name
    - expect: My plans section is visible
    - expect: Request service button is visible and enabled
  3. Click the Request service button from the dashboard
    - expect: User is redirected to /service-request/create-request page
    - expect: Service Request heading is displayed
    - expect: Plan information is shown (Plan Number and Plan Type)
    - expect: Search bar for covered items is visible
    - expect: Top picked items section displays with multiple appliance options
    - expect: Categories section displays (Appliance, HVAC, Plumbing, etc.)
  4. Select an appliance from the Top picked items (e.g., Refrigerator)
    - expect: Page navigates to /service-request/what-is-issue
    - expect: What's the issue? heading is displayed
    - expect: Item details panel shows the selected appliance (Refrigerator)
    - expect: Symptoms dropdown is visible and marked as Required
    - expect: Location dropdown is pre-filled with default value (Kitchen)
    - expect: Brand dropdown is visible and marked as Required
    - expect: Serial Number and Model text fields are visible (optional)
    - expect: Continue button is disabled until required fields are filled
  5. Select a symptom from the dropdown (e.g., The unit is not cooling)
    - expect: Symptom dropdown displays available options (e.g., not cooling, not working, leaking water, etc.)
    - expect: Selected symptom is displayed in the dropdown
    - expect: Continue button remains disabled until brand is also selected
  6. Select a brand from the dropdown (e.g., Samsung)
    - expect: Brand dropdown displays comprehensive list of manufacturers (GE, Samsung, LG, Whirlpool, etc.)
    - expect: Selected brand is displayed in the dropdown
    - expect: Continue button becomes enabled
    - expect: Add Item button becomes enabled (to add up to 3 items)
  7. Click the Continue button
    - expect: Loading state appears with message Finding the best technician
    - expect: Item details are collapsed and displayed in read-only format
    - expect: Page navigates to /service-request/schedule-appointment-sp-compete-v2
    - expect: Calendar view is displayed showing current month
    - expect: Select appointment windows heading is visible
    - expect: Instructions state Choose 3 time slots
  8. Select 3 time slots from available dates and times
    - expect: Calendar shows available dates (clickable dates highlighted)
    - expect: Time slots appear for selected dates (e.g., 8 AM - 12 PM, 12 PM - 4 PM)
    - expect: Each clicked time slot gets checked and added to Selected slots section
    - expect: Selected slots section shows all 3 chosen appointments with date and time
    - expect: Each selected slot has a Remove button
    - expect: Continue button becomes enabled after 3 slots are selected
  9. Click the Continue button to proceed to review
    - expect: Page navigates to /service-request/review-request
    - expect: Review heading is displayed
    - expect: Service summary section shows all request details (appliance, symptom, location, brand)
    - expect: Service Window information is displayed
    - expect: Deductible amount is shown ($150)
    - expect: Total amount is displayed ($150)
    - expect: Contact information section shows phone number and email
    - expect: Edit button is available for contact information
    - expect: Continue to payment button is visible and enabled
    - expect: Disclaimer text about no changes after payment is displayed
  10. Review all details and click Continue to payment
    - expect: Page navigates to /make-payment
    - expect: Select a payment option heading is displayed
    - expect: Add new credit card option is visible with card type icons (Visa, Mastercard, Discover, Amex)
    - expect: Existing payment methods (if any) are shown
    - expect: Paze payment option is available
    - expect: Summary section shows Total: $150.00
    - expect: Terms and conditions checkbox is unchecked
    - expect: Pay now button is disabled until terms are accepted
  11. Click Add new credit card button
    - expect: Credit card form appears with Card information section
    - expect: Required fields are marked: First Name, Last Name, Card Number, Expiration Date, CVV
    - expect: Billing information section shows pre-filled address, city, state, and ZIP from user profile
    - expect: State dropdown is functional
    - expect: Next button is disabled until all required fields are filled
    - expect: Cancel button is available
  12. Fill in credit card details (Card: (from test-credentials.json or TEST_CARD_NUMBER env var), Name: John Doe, Exp: 03/29, CVV: 351)
    - expect: Card number field displays entered digits
    - expect: Card type icon appears next to card number field (Visa icon)
    - expect: Expiration date accepts MM/YY format
    - expect: CVV field accepts 3 digits
    - expect: Billing address fields show pre-filled information
    - expect: Next button becomes enabled after all required fields are filled
    - expect: Real-time validation occurs on each field (format checking)
  13. Click Next button to save the card
    - expect: Card is validated and saved
    - expect: Page returns to payment selection screen
    - expect: New card appears as a payment option (showing last 4 digits: ************1111)
    - expect: New card is automatically selected as payment method
    - expect: Card logo is displayed next to masked number
    - expect: Edit button is available next to the new card
    - expect: Pay now button is still disabled until terms are accepted
  14. Check the I agree to the terms and conditions checkbox
    - expect: Checkbox is marked as checked
    - expect: Pay now button becomes enabled
    - expect: Terms and conditions link is clickable
  15. Click the Pay now button to submit payment
    - expect: Payment processing indicator appears
    - expect: Payment is processed successfully
    - expect: Page redirects to confirmation page
    - expect: Confirmation heading is displayed (e.g., Service request submitted)
    - expect: Service order reference number is prominently displayed (format: SCCV + alphanumeric)
    - expect: Confirmation message includes next steps
    - expect: Service request details are summarized (appliance, deductible amount)
    - expect: Expected timeline or technician contact information is provided
    - expect: Option to view service request history is available
    - expect: Option to return to dashboard is available
  16. Verify the confirmation page displays all critical information
    - expect: Service order number is clearly visible and copyable
    - expect: Confirmation email sent notification is displayed
    - expect: Selected time slots are confirmed
    - expect: Total payment amount charged is shown
    - expect: Customer support contact information is available
    - expect: Link to My Service Requests page is provided
    - expect: Print or download confirmation option is available (if supported)

#### 1.2. Service request via hamburger menu navigation

**File:** `tests/service-request-e2e/menu-navigation.spec.ts`

**Steps:**
  1. Login with valid credentials and reach dashboard
    - expect: User is logged in and on dashboard
    - expect: Hamburger menu button is visible in the top-left corner
  2. Click the hamburger menu button
    - expect: Navigation drawer slides open from the left
    - expect: Menu items are displayed (My Plan, My Service Requests, Account Settings, etc.)
    - expect: Close button or overlay is available
    - expect: Menu is fully expanded and readable
  3. Click on My Plan menu item
    - expect: Navigation drawer closes
    - expect: Page navigates to My Plan page
    - expect: Plan details are displayed
    - expect: Request service button is visible
  4. From My Plan page, click Request service button and complete the flow as in Happy Path
    - expect: Service request flow continues normally
    - expect: All subsequent steps match the happy path scenario

#### 1.3. Service request with multiple items (up to 3)

**File:** `tests/service-request-e2e/multiple-items.spec.ts`

**Steps:**
  1. Login and navigate to service request creation page
    - expect: Service request page loads successfully
  2. Select first appliance (e.g., Refrigerator) and fill required details (symptom, brand)
    - expect: First item details are filled
    - expect: Continue button is enabled
    - expect: Add Item button is enabled
  3. Click Add Item button instead of Continue
    - expect: Second item panel appears below the first
    - expect: Item 2 heading is displayed
    - expect: New item has its own symptom and brand dropdowns
    - expect: First item details remain visible and editable
    - expect: Remove item button is available for each item
    - expect: Message states: You can add up to three items per claim
    - expect: Continue button is disabled until second item details are filled
  4. Select second appliance and fill details (e.g., Clothes Washer with symptom and brand)
    - expect: Second item details are filled
    - expect: Continue button becomes enabled
    - expect: Add Item button remains enabled (1 slot remaining)
  5. Click Add Item button again
    - expect: Third item panel appears
    - expect: Item 3 heading is displayed
    - expect: Add Item button becomes disabled (maximum 3 items reached)
    - expect: Message indicates maximum items reached
    - expect: All three items are displayed in the form
  6. Fill third item details and click Continue
    - expect: Loading state: Finding the best technician for all items
    - expect: Page navigates to appointment scheduling
    - expect: All three items are displayed in the summary
    - expect: Appointment selection works the same way
  7. Select 3 time slots and proceed to review
    - expect: Review page displays all 3 items in service summary
    - expect: Deductible amount reflects all items (may be single fee or per-item)
    - expect: Total amount is calculated correctly
  8. Complete payment and verify confirmation
    - expect: Confirmation page shows all 3 items in the service request
    - expect: Single service order number covers all items
    - expect: All items are listed in the confirmation summary

#### 1.4. Edit contact information before payment

**File:** `tests/service-request-e2e/edit-contact-info.spec.ts`

**Steps:**
  1. Login and complete service request flow up to review page
    - expect: Review page is displayed with pre-filled contact information
  2. Click Edit button in Contact information section
    - expect: Contact information form becomes editable or a modal/panel opens
    - expect: Phone number and email fields are displayed
    - expect: Current values are pre-filled
    - expect: Save and Cancel buttons are available
  3. Update phone number to a different valid number (e.g., (555) 123-4567)
    - expect: Phone number field accepts the new value
    - expect: Format validation occurs (e.g., US phone format)
    - expect: Save button remains enabled
  4. Click Save button
    - expect: Contact information is updated
    - expect: Form or modal closes
    - expect: Review page shows updated phone number
    - expect: Success message appears (optional)
    - expect: Continue to payment button is still enabled
  5. Proceed with payment and complete the request
    - expect: Updated contact information is used for the service request
    - expect: Confirmation page reflects the updated phone number

#### 1.5. Remove and re-add appointment time slots

**File:** `tests/service-request-e2e/modify-time-slots.spec.ts`

**Steps:**
  1. Login and navigate to appointment scheduling page with appliance selected
    - expect: Appointment scheduling page loads with calendar and time slots
  2. Select 3 time slots from available options
    - expect: All 3 slots are selected and displayed in Selected slots section
    - expect: Continue button is enabled
  3. Click the Remove button on the second selected slot
    - expect: Second slot is removed from Selected slots list
    - expect: Only 2 slots remain selected
    - expect: Continue button becomes disabled
    - expect: Removed slot becomes available for selection again in the calendar
    - expect: Message indicates: Select 3 time slots
  4. Select a different time slot to replace the removed one
    - expect: New slot is added to Selected slots section
    - expect: Total of 3 slots are now selected
    - expect: Continue button becomes enabled again
  5. Click Continue and proceed with the flow
    - expect: Updated time slots are reflected in the review page
    - expect: Service request proceeds normally with the new time slots

#### 1.6. Use existing saved payment method

**File:** `tests/service-request-e2e/saved-payment-method.spec.ts`

**Steps:**
  1. Login with an account that has a saved payment method and complete service request flow to payment page
    - expect: Payment page displays saved payment method(s)
    - expect: Saved card shows last 4 digits and card type icon
    - expect: Saved card is pre-selected as default payment option
  2. Verify the saved card is selected
    - expect: Radio button for saved card is checked
    - expect: Card details are displayed (masked number, card type)
    - expect: Edit option may be available for saved card
  3. Check the terms and conditions checkbox
    - expect: Checkbox is checked
    - expect: Pay now button becomes enabled
  4. Click Pay now to submit payment
    - expect: Payment is processed using the saved card
    - expect: Confirmation page is displayed with service order number
    - expect: No additional CVV or card details were required (as per saved card flow)

#### 1.7. Select appliance using search functionality

**File:** `tests/service-request-e2e/search-appliance.spec.ts`

**Steps:**
  1. Login and navigate to service request creation page
    - expect: Service request page loads
    - expect: Search bar with placeholder Find covered items, refrigerators, clothes washer, ceiling fan, etc... is visible
  2. Click on the search input field and type refrigerator
    - expect: Search field is focused
    - expect: Text is entered in the search field
    - expect: Autocomplete or dropdown suggestions may appear
    - expect: Matching items are filtered or highlighted
  3. Select Refrigerator from search results or suggestions
    - expect: Refrigerator is selected
    - expect: Page navigates to what-is-issue page
    - expect: Selected appliance is displayed in the item details panel
  4. Complete the service request flow as usual
    - expect: Flow continues normally with the searched and selected appliance

#### 1.8. Browse appliances by category

**File:** `tests/service-request-e2e/browse-by-category.spec.ts`

**Steps:**
  1. Login and navigate to service request creation page
    - expect: Service request page displays categories section (Appliance, HVAC, Plumbing, etc.)
  2. Click on a category button (e.g., Appliance)
    - expect: Category expands or navigates to a list of items within that category
    - expect: List of appliances is displayed (e.g., Refrigerator, Dishwasher, Clothes Washer, etc.)
    - expect: Items are clickable
  3. Select an appliance from the category list (e.g., Dishwasher)
    - expect: Dishwasher is selected
    - expect: Page navigates to what-is-issue page
    - expect: Selected appliance is displayed in the item details
  4. Complete the service request flow
    - expect: Flow proceeds normally with the category-selected appliance

#### 1.9. Invalid login credentials - Negative Test

**File:** `tests/service-request-e2e/invalid-login.spec.ts`

**Steps:**
  1. Navigate to the login page
    - expect: Login page is displayed
  2. Enter invalid email (e.g., invalid@test.com) and invalid password (e.g., wrongpass123)
    - expect: Email and password fields accept the input
  3. Click the Log in button
    - expect: Error message is displayed: Wrong email or password or similar
    - expect: User remains on the login page
    - expect: No redirect occurs
    - expect: Email and password fields retain their values (or are cleared based on UX design)
    - expect: Login button remains enabled for retry
  4. Verify the error message is visible and clear
    - expect: Error alert or message is prominently displayed
    - expect: Message clearly indicates authentication failure
    - expect: Accessibility: Error is announced to screen readers

#### 1.10. Missing required fields in appliance selection - Negative Test

**File:** `tests/service-request-e2e/missing-required-fields.spec.ts`

**Steps:**
  1. Login and navigate to what-is-issue page by selecting an appliance
    - expect: What's the issue? page is displayed with required fields marked
  2. Select only Symptom but leave Brand empty
    - expect: Symptom dropdown shows selected value
    - expect: Brand dropdown remains empty or shows placeholder
    - expect: Continue button remains disabled
  3. Attempt to click Continue button (should be disabled)
    - expect: Continue button is disabled and unclickable
    - expect: No navigation occurs
    - expect: Visual feedback indicates the button is disabled (grayed out, no cursor change)
  4. Fill in the Brand field
    - expect: Brand dropdown shows selected value
    - expect: Continue button becomes enabled
  5. Verify validation messages appear if any fields are cleared after being filled
    - expect: If a required field is cleared, an error message may appear
    - expect: Continue button is disabled again until the field is re-filled

#### 1.11. Insufficient time slots selected - Negative Test

**File:** `tests/service-request-e2e/insufficient-time-slots.spec.ts`

**Steps:**
  1. Login and navigate to appointment scheduling page
    - expect: Appointment scheduling page loads with instructions to select 3 time slots
  2. Select only 1 or 2 time slots
    - expect: Selected slot(s) appear in the Selected slots section
    - expect: Continue button remains disabled
    - expect: Message still indicates: Select 3 time slots
    - expect: Remaining slots show as not selected
  3. Attempt to click Continue button (should be disabled)
    - expect: Continue button is disabled and unclickable
    - expect: No navigation occurs
    - expect: Visual indicator shows button is not active
  4. Select the remaining slots to reach 3 total
    - expect: All 3 slots are selected
    - expect: Continue button becomes enabled

#### 1.12. Terms and conditions not accepted - Negative Test

**File:** `tests/service-request-e2e/terms-not-accepted.spec.ts`

**Steps:**
  1. Login and complete service request flow up to payment page
    - expect: Payment page loads with payment options and terms checkbox
  2. Select a payment method but do not check the terms and conditions checkbox
    - expect: Payment method is selected
    - expect: Terms checkbox remains unchecked
    - expect: Pay now button remains disabled
  3. Attempt to click Pay now button (should be disabled)
    - expect: Pay now button is disabled and unclickable
    - expect: No payment processing occurs
    - expect: Visual feedback shows button is inactive
  4. Check the terms and conditions checkbox
    - expect: Checkbox is checked
    - expect: Pay now button becomes enabled

#### 1.13. Invalid credit card details - Negative Test

**File:** `tests/service-request-e2e/invalid-credit-card.spec.ts`

**Steps:**
  1. Login and navigate to payment page, then click Add new credit card
    - expect: Credit card form is displayed
  2. Enter invalid card number (e.g., 1234567890123456)
    - expect: Card number field accepts the input (may show real-time validation)
    - expect: Card type icon may not appear or shows an error icon
  3. Fill in other required fields (Name, Expiration, CVV)
    - expect: All fields are filled
  4. Click Next button
    - expect: Validation error is displayed: Invalid card number or similar
    - expect: Form does not submit
    - expect: User remains on the card entry form
    - expect: Error message is associated with the card number field
    - expect: Next button may remain enabled for retry or become disabled until error is fixed
  5. Correct the card number to a valid test card (e.g., (from test-credentials.json or TEST_CARD_NUMBER env var))
    - expect: Error message disappears
    - expect: Card type icon appears
    - expect: Next button remains or becomes enabled
  6. Click Next and proceed
    - expect: Card is validated and saved
    - expect: Returns to payment selection screen

#### 1.14. Expired credit card - Negative Test

**File:** `tests/service-request-e2e/expired-credit-card.spec.ts`

**Steps:**
  1. Login and navigate to credit card entry form
    - expect: Credit card form is displayed
  2. Enter valid card number and name, but use an expired date (e.g., 01/20)
    - expect: Expiration date field accepts the input
  3. Fill in CVV and click Next
    - expect: Validation error is displayed: Card is expired or Expiration date must be in the future
    - expect: Form does not submit
    - expect: Error is associated with the expiration date field
    - expect: User remains on the form for correction
  4. Update expiration date to a future date (e.g., 03/29)
    - expect: Error message clears
    - expect: Next button is enabled
  5. Click Next
    - expect: Card is validated and saved successfully

#### 1.15. Cancel service request during payment

**File:** `tests/service-request-e2e/cancel-during-payment.spec.ts`

**Steps:**
  1. Login and complete service request flow up to payment page
    - expect: Payment page is displayed with payment options
  2. Click the Cancel button on the payment page
    - expect: Confirmation dialog may appear: Are you sure you want to cancel?
    - expect: If confirmed, user is redirected to dashboard or previous page
    - expect: Service request is not submitted
    - expect: No payment is processed
    - expect: User can restart the service request from scratch if desired

#### 1.16. Network error during payment submission - Negative Test

**File:** `tests/service-request-e2e/network-error-payment.spec.ts`

**Steps:**
  1. Login and complete service request flow up to payment page
    - expect: Payment page is ready
  2. Simulate network failure or timeout before clicking Pay now (using browser dev tools or test framework network mocking)
    - expect: Network is in a failed state
  3. Select payment method, accept terms, and click Pay now
    - expect: Payment processing begins
    - expect: After timeout or network error, an error message is displayed: Payment failed. Please try again or similar
    - expect: User remains on the payment page
    - expect: Pay now button is re-enabled for retry
    - expect: Service request is not marked as submitted
    - expect: User can retry the payment or cancel
  4. Restore network and retry payment
    - expect: Payment processes successfully
    - expect: Confirmation page is displayed

#### 1.17. Session timeout during service request flow

**File:** `tests/service-request-e2e/session-timeout.spec.ts`

**Steps:**
  1. Login and start a service request flow
    - expect: User is logged in and progressing through the flow
  2. Simulate session expiration (e.g., wait for token expiry or manually clear session in test environment)
    - expect: Session is expired
  3. Attempt to proceed to the next step (e.g., click Continue on appointment scheduling)
    - expect: Error message is displayed: Session expired. Please log in again or similar
    - expect: User is redirected to the login page
    - expect: Service request progress is not saved (or is saved based on implementation)
    - expect: After re-login, user may be redirected back to the flow or needs to restart
  4. Login again and verify behavior
    - expect: User can log in successfully
    - expect: If progress was saved, user can resume; otherwise, user starts from the beginning

#### 1.18. Accessibility - Keyboard navigation

**File:** `tests/service-request-e2e/accessibility-keyboard.spec.ts`

**Steps:**
  1. Navigate to the login page using only keyboard (Tab key)
    - expect: Email field can be focused using Tab
    - expect: Password field can be focused using Tab
    - expect: Log in button can be focused and activated with Enter or Space
    - expect: Focus indicators are visible on all interactive elements
  2. Login using keyboard only and navigate to service request creation
    - expect: All navigation and interactive elements are accessible via keyboard
    - expect: Dropdowns (symptom, brand) can be opened and navigated with keyboard (Arrow keys, Enter)
    - expect: Buttons (Continue, Back) are accessible via Tab and can be activated with Enter
  3. Navigate through appointment scheduling using keyboard
    - expect: Calendar dates and time slots can be focused and selected using keyboard
    - expect: Selected slots can be removed using keyboard
    - expect: Continue button is accessible
  4. Complete payment form using keyboard navigation
    - expect: All form fields (card number, expiration, CVV) can be focused and filled using keyboard
    - expect: Terms checkbox can be toggled using Space key
    - expect: Pay now button can be focused and activated with Enter
  5. Verify focus order is logical throughout the flow
    - expect: Focus moves in a logical order (top to bottom, left to right)
    - expect: No focus traps occur
    - expect: Focus is visible at all times

#### 1.19. Accessibility - Screen reader compatibility

**File:** `tests/service-request-e2e/accessibility-screen-reader.spec.ts`

**Steps:**
  1. Use a screen reader (e.g., NVDA, JAWS, VoiceOver) to navigate the login page
    - expect: Email and password fields are announced with labels
    - expect: Log in button is announced as a button
    - expect: Error messages are announced when login fails
    - expect: All interactive elements have accessible names
  2. Navigate through the service request flow with screen reader
    - expect: All headings, labels, and instructions are announced
    - expect: Dropdowns announce their current value and options
    - expect: Required field indicators are announced
    - expect: Button states (enabled/disabled) are announced
    - expect: Loading states and progress indicators are announced
  3. Complete appointment scheduling with screen reader
    - expect: Calendar dates and time slots are announced with full date and time information
    - expect: Selected slots are announced as selected
    - expect: Instructions (Select 3 time slots) are announced
  4. Complete payment form with screen reader
    - expect: All form labels are announced
    - expect: Field requirements and errors are announced
    - expect: Terms and conditions checkbox state is announced
    - expect: Pay now button state is announced

#### 1.20. Responsive design - Mobile viewport

**File:** `tests/service-request-e2e/responsive-mobile.spec.ts`

**Steps:**
  1. Set browser viewport to mobile size (e.g., 375x667 for iPhone)
    - expect: Login page renders correctly in mobile viewport
    - expect: Form fields are appropriately sized and usable
    - expect: No horizontal scrolling is required
  2. Login and navigate through service request flow in mobile viewport
    - expect: Dashboard and all pages render correctly in mobile view
    - expect: Hamburger menu is functional on mobile
    - expect: Buttons and interactive elements are large enough for touch interaction
    - expect: Dropdowns and selects work properly on mobile
    - expect: Calendar and time slot selection are usable on small screens
    - expect: Payment form fields are accessible and properly sized
  3. Complete the entire service request flow on mobile viewport
    - expect: All steps complete successfully
    - expect: No layout issues or overlapping elements
    - expect: Confirmation page displays correctly

#### 1.21. Browser compatibility - Chrome, Firefox, Safari, Edge

**File:** `tests/service-request-e2e/browser-compatibility.spec.ts`

**Steps:**
  1. Run the complete service request happy path test in Chrome
    - expect: All features work correctly in Chrome
    - expect: No console errors or warnings
    - expect: UI renders as expected
  2. Run the complete service request happy path test in Firefox
    - expect: All features work correctly in Firefox
    - expect: No console errors or warnings
    - expect: UI renders consistently with Chrome
  3. Run the complete service request happy path test in Safari
    - expect: All features work correctly in Safari
    - expect: No console errors or warnings
    - expect: UI renders consistently
  4. Run the complete service request happy path test in Edge
    - expect: All features work correctly in Edge
    - expect: No console errors or warnings
    - expect: UI renders consistently
