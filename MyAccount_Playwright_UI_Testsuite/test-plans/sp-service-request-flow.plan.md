# SP Service Provider Complete Service Request Flow Test Plan

## Application Overview

This test plan covers the complete end-to-end flow for Service Provider (SP) service requests in the Cinch My Account application. The flow includes user authentication, item selection, service details input, appointment scheduling, payment processing, and confirmation verification. The application uses modern web components including custom dropdowns with role="combobox", dynamic calendars, and integrated payment forms.

## Test Scenarios

### 1. SP Service Request Flow - Happy Path

**Seed:** `tests/seed.spec.ts`

#### 1.1. Complete Service Request Flow - Login to Confirmation

**File:** `tests/sp-complete-service-request-flow.spec.ts`

**Steps:**
  1. Navigate to the application URL: https://myaccount-ui.qa.cinchhs.com
    - expect: The login page should load
    - expect: A cookie consent banner may appear
  2. If cookie banner appears, click the 'X' button to close it using selector: button:has-text("X")
    - expect: Cookie banner should close
    - expect: Login form should be visible
  3. Enter email '(from test-credentials.json or TEST_USER env var)' into the email field using selector: #login-email
    - expect: Email should be entered into the field
  4. Enter password '(from test-credentials.json or TEST_PASS env var)' into the password field using selector: input[type="password"]
    - expect: Password should be masked and entered
  5. Click the 'Log in' button using selector: button:has-text("Log in")
    - expect: Authentication should occur
    - expect: Page should redirect to dashboard
    - expect: URL should change to /dashboard with access_token in hash
  6. Wait 3-5 seconds for dashboard to fully load
    - expect: Dashboard page should be fully loaded
    - expect: User's plan information should be displayed
    - expect: 'Request service' button should be visible
  7. Click the 'Request service' button using selector: button:has-text("Request service")
    - expect: Page should navigate to /service-request/create-request
    - expect: Service request page should display with plan information
    - expect: 'Top picked items' section should be visible
  8. Click on 'Refrigerator' card from the top picked items using selector: p-card.item-card:has-text("Refrigerator")
    - expect: Page should navigate to /service-request/what-is-issue
    - expect: Form with three dropdowns (Symptoms, Location, Brand) should appear
    - expect: Serial Number and Model text fields should be visible
    - expect: Location dropdown should default to 'Kitchen'
  9. Click on the Symptoms dropdown using selector: [role="combobox"][aria-label="Select a symptom"]
    - expect: Symptoms dropdown should expand
    - expect: A listbox with role="listbox" should appear
    - expect: Multiple symptom options should be displayed (e.g., 'The unit is not cooling', 'The unit is leaking water', etc.)
  10. Select a symptom option (e.g., 'The unit is not cooling') using selector: [role="option"]:has-text("The unit is not cooling")
    - expect: Selected symptom should appear in the combobox
    - expect: Dropdown should close
    - expect: Combobox text should change from 'Select a symptom' to the selected option
  11. Verify Location dropdown shows 'Kitchen' as default value
    - expect: Location combobox with aria-label="Kitchen" should be visible
    - expect: No action needed as it defaults to Kitchen
  12. Click on the Brand dropdown using selector: [role="combobox"][aria-label="Select a brand"]
    - expect: Brand dropdown should expand
    - expect: A listbox with multiple brand options should appear
    - expect: Brands like 'Admiral', 'Amana', 'Bosch', 'Frigidaire' should be visible
  13. Select a brand (e.g., 'Bosch') using selector: [role="option"][aria-label="Bosch"]
    - expect: Selected brand should appear in the combobox
    - expect: Dropdown should close
  14. Enter 'SN12345' into Serial Number field using selector: input[aria-label="Serial Number"]
    - expect: Serial number should be entered in the field
  15. Enter 'MODEL123' into Model field using selector: input[aria-label="Model"]
    - expect: Model number should be entered in the field
    - expect: Continue button should become enabled
  16. Click the 'Continue' button using selector: button:has-text("Continue")
    - expect: Button text should change to show spinner with 'Saving information'
    - expect: Then change to 'Finding the best technician'
    - expect: Form details should be collapsed and shown in read-only mode
    - expect: Remove and Edit buttons should be disabled during processing
  17. Wait 5-10 seconds for processing to complete
    - expect: Page should navigate to /service-request/schedule-appointment-sp-compete-v2
    - expect: Calendar and appointment scheduling interface should appear
  18. Verify the appointment page elements are loaded
    - expect: Heading 'Select appointment windows' should be visible
    - expect: Instruction 'Choose 3 time slots' should be displayed
    - expect: Calendar grid with role="grid" should be visible
    - expect: Available dates should be clickable
    - expect: Time slot checkboxes should be visible below the calendar
  19. Select first time slot checkbox using selector: #slot-0
    - expect: Checkbox should be checked
    - expect: Selected slot should appear in the 'Selected slots' section on the right
    - expect: Checkbox should show a checkmark icon
  20. Select second time slot checkbox using selector: #slot-1
    - expect: Second checkbox should be checked
    - expect: Second slot should appear in the 'Selected slots' section
  21. Select third time slot checkbox using selector: #slot-2
    - expect: Third checkbox should be checked
    - expect: Third slot should appear in the 'Selected slots' section
    - expect: All three time slots should be displayed with dates and times (e.g., '06/25, 8 AM - 12 PM')
    - expect: Continue button should remain enabled
  22. Click the 'Continue' button using selector: button:has-text("Continue")
    - expect: Page should navigate to /service-request/review-request
    - expect: Review page should display
  23. Verify review page content
    - expect: Heading 'Review' should be visible
    - expect: 'Service summary' section should show refrigerator item details
    - expect: Symptom 'The unit is not cooling' should be displayed
    - expect: Deductible amount of $150 should be shown
    - expect: Total amount of $150 should be displayed
    - expect: Contact information section should show phone and email
    - expect: 'Continue to payment' button should be visible
  24. Click 'Continue to payment' button using selector: button:has-text("Continue to payment")
    - expect: Page should navigate to /make-payment
    - expect: Payment page should load
  25. Verify payment page elements
    - expect: Heading 'Select a payment option' should be visible
    - expect: 'Add new credit card' option should be visible as a p-card element
    - expect: Existing payment methods may be shown as radio buttons
    - expect: 'Paze' payment option should be visible
    - expect: Summary section showing Total $150.00 should be displayed
    - expect: Terms and conditions checkbox should be visible
    - expect: 'Pay now' button should be disabled until terms are accepted
  26. Click on 'Add new credit card' button using selector: p-card.item-card-border[role="button"]
    - expect: Credit card form should appear
    - expect: Form should have sections: 'Card information' and 'Billing information'
    - expect: Required fields should be marked: First Name, Last Name, Card Number, Expiration Date, CVV
    - expect: Billing address fields should be pre-populated with user's address
  27. Enter 'Rakesh' into First Name field using selector: input[aria-label="First Name"]
    - expect: First name should be entered
  28. Enter 'Lenka' into Last Name field using selector: input[aria-label="Last Name"]
    - expect: Last name should be entered
  29. Enter '(from test-credentials.json or TEST_CARD_NUMBER env var)' into Card Number field using selector: input[aria-label="Card Number"]
    - expect: Card number should be entered
    - expect: Card icon should appear indicating card type (Visa/MasterCard/etc.)
  30. Enter '12/28' into Expiration Date field using selector: #expiration-date-input
    - expect: Expiration date should be entered in MM/YY format
  31. Enter '351' into CVV field using selector: input[aria-label="CVV"]
    - expect: CVV should be entered
    - expect: 'Next' button should become enabled
  32. Verify billing information is pre-populated
    - expect: Address field should show '5412 EDSALL RIDGE PL'
    - expect: City field should show 'ALEXANDRIA'
    - expect: State dropdown should show 'VA'
    - expect: ZIP Code field should show '22312'
  33. Click 'Next' button using selector: button:has-text("Next")
    - expect: Form should close
    - expect: New payment method should appear as a radio button option
    - expect: Card number should be masked as '************1111'
    - expect: New card should be selected by default (radio button checked)
    - expect: An 'Edit' button should appear next to the new card
  34. Check the Terms and Conditions checkbox using selector: input[type="checkbox"][aria-label="Terms and Conditions Checkbox"]
    - expect: Checkbox should be checked with a checkmark icon
    - expect: 'Pay now' button should become enabled
  35. Click 'Pay now' button using selector: button:has-text("Pay now")
    - expect: Button should show spinner
    - expect: Button text should change to 'Submitting request'
    - expect: Button should become disabled during processing
    - expect: Payment processing should begin
  36. Wait 10-15 seconds for payment processing and navigation
    - expect: One of two outcomes should occur:
    - expect: SUCCESS: Page navigates to confirmation page showing service request details and confirmation number
    - expect: LIMITATION: Error message appears stating 'Unable to process this service request because the quantity of units for this item has been exceeded' (due to test account limits)
    - expect: In either case, payment processing flow should complete
  37. If confirmation page loads, verify confirmation details
    - expect: Confirmation heading should be displayed
    - expect: Service order number should be visible
    - expect: Item details (Refrigerator, symptom) should be shown
    - expect: Selected time slots should be displayed
    - expect: Payment confirmation ($150.00 paid) should be shown
    - expect: Next steps or contact information should be provided
  38. If confirmation page loads, scroll through the entire page
    - expect: All confirmation details should be accessible
    - expect: Page should contain complete service request summary

#### 1.2. Service Request Form Validation - Required Fields

**File:** `tests/sp-service-request-validation.spec.ts`

**Steps:**
  1. Navigate to service request page and select an item (Refrigerator)
    - expect: Form with three dropdowns should be displayed
  2. Verify the Continue button is disabled initially
    - expect: Continue button should have disabled attribute
    - expect: Button should not be clickable
  3. Select only a Symptom without selecting Brand
    - expect: Continue button should remain disabled
    - expect: Brand field should show 'Required' label
  4. Select only a Brand without selecting Symptom
    - expect: Continue button should remain disabled
    - expect: Symptoms field should show 'Required' label
  5. Select both Symptom and Brand
    - expect: Continue button should become enabled
    - expect: No validation errors should be displayed
  6. Verify Location field defaults to Kitchen and is optional
    - expect: Location should show 'Kitchen' by default
    - expect: No 'Required' label should be present on Location
  7. Verify Serial Number and Model fields are optional
    - expect: Both fields should be fillable but not required
    - expect: Safety warning text should be displayed below the fields
    - expect: Warning should state not to access hazardous areas for model/serial numbers

#### 1.3. Appointment Scheduling - Time Slot Selection Validation

**File:** `tests/sp-appointment-scheduling.spec.ts`

**Steps:**
  1. Complete service details form and navigate to appointment page
    - expect: Calendar and time slot selection interface should be displayed
  2. Verify initial state of time slot selection
    - expect: Instruction 'Select 3 time slots' should be displayed
    - expect: Calendar should show available dates highlighted
    - expect: Time slots should be displayed for available dates
    - expect: Selected slots section should show 'not selected' for all three slots
  3. Select only 1 time slot
    - expect: First slot in Selected slots section should show the date and time
    - expect: Other two slots should remain as 'not selected'
    - expect: Continue button should remain enabled (may allow proceeding with fewer slots)
  4. Select 2 more time slots for a total of 3
    - expect: All three slots in Selected slots section should show selected times
    - expect: Each slot should display in format: '06/25, 8 AM - 12 PM'
    - expect: Each slot should have a 'Remove' button with an X icon
  5. Click the Remove button on one of the selected slots
    - expect: Selected slot should be removed
    - expect: Corresponding checkbox should be unchecked
    - expect: Slot should show 'not selected' again in the Selected slots section
  6. Navigate through different months using Previous/Next month buttons
    - expect: Calendar should update to show previous/next month
    - expect: Month and year labels should update
    - expect: Available dates in new month should be highlighted if available
    - expect: Previously selected slots should remain selected
  7. Select time slots from different dates
    - expect: Should be able to select slots from different days
    - expect: All selections should be tracked in Selected slots section
    - expect: Each slot should show its corresponding date

#### 1.4. Payment Form - Credit Card Validation

**File:** `tests/sp-payment-validation.spec.ts`

**Steps:**
  1. Navigate to payment page
    - expect: Payment options should be displayed
  2. Click 'Add new credit card' button
    - expect: Credit card form should open
    - expect: 'Next' button should be disabled
  3. Leave all fields empty and verify validation
    - expect: Required field labels should be visible
    - expect: 'Next' button should remain disabled
  4. Enter invalid card number (e.g., '1234')
    - expect: Validation error may appear
    - expect: 'Next' button should remain disabled or show error
  5. Enter valid but incomplete information (missing CVV)
    - expect: 'Next' button should remain disabled
    - expect: CVV field should show as required
  6. Enter invalid expiration date (e.g., past date)
    - expect: Validation error should appear
    - expect: Form should not submit
  7. Enter all valid credit card information
    - expect: Card icon should appear showing detected card type
    - expect: All required fields should be filled
    - expect: 'Next' button should become enabled
    - expect: No validation errors should be shown
  8. Verify billing information can be edited
    - expect: Address fields should be editable
    - expect: State dropdown should be functional
    - expect: ZIP code should accept valid formats

#### 1.5. Payment Processing - Terms Acceptance

**File:** `tests/sp-payment-terms.spec.ts`

**Steps:**
  1. Complete credit card form and return to payment selection
    - expect: New card should be added and selected
    - expect: Summary should show Total $150.00
  2. Verify 'Pay now' button is disabled without accepting terms
    - expect: Button should have disabled attribute
    - expect: Terms and conditions checkbox should be unchecked
  3. Click on 'terms and conditions' link
    - expect: Terms modal or page should open
    - expect: Terms content should be displayed
  4. Check the Terms and Conditions checkbox
    - expect: Checkbox should show checkmark
    - expect: 'Pay now' button should become enabled
  5. Uncheck the checkbox
    - expect: Checkbox should be unchecked
    - expect: 'Pay now' button should become disabled again
  6. Check the checkbox again and click 'Pay now'
    - expect: Button should change to 'Submitting request' with spinner
    - expect: Button should be disabled during processing
    - expect: Payment should process

#### 1.6. Navigation and Data Persistence

**File:** `tests/sp-navigation-persistence.spec.ts`

**Steps:**
  1. Navigate to service request form and fill in all details
    - expect: Form should be completely filled
  2. Click Continue and proceed to appointment page
    - expect: Should navigate to appointment page
  3. Click the 'Back' button on appointment page
    - expect: Should return to service request form
    - expect: All previously entered data should be preserved
    - expect: Symptom, Location, Brand, Serial Number, and Model should still be filled
  4. Select different values and proceed to appointment page again
    - expect: New values should be saved
    - expect: Appointment page should load with updated item details
  5. Select time slots and click Continue to review page
    - expect: Review page should show all entered information
  6. Click 'Back' button on review page
    - expect: Should return to appointment page
    - expect: Previously selected time slots should still be selected
  7. Proceed to payment page and verify all details
    - expect: Payment page should load
    - expect: Summary should show correct total ($150.00)
    - expect: Item details should match what was entered
  8. Click 'Cancel' button on payment page
    - expect: Should navigate back or show confirmation dialog
    - expect: User should be able to cancel the service request
