# C171749 - My Account Request Service Test Plan

## Application Overview

This test plan covers the complete end-to-end service request flow for the My Account application. It includes user authentication, item selection, issue reporting with detailed information (symptoms, location, brand, serial/model numbers), appointment scheduling with multiple time slots, review of service details, payment processing with credit card, and final confirmation. The application allows customers to request service for covered items under their Cinch Repair + Replace plan and pay the service deductible online.

## Test Scenarios

### 1. Service Request - Happy Path Flow

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 1.1. Complete service request for refrigerator with new credit card

**File:** `tests/service-request/complete-refrigerator-request.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com
    - expect: The login page should be displayed
    - expect: Email and Password input fields should be visible
    - expect: Log in button should be present
  2. Enter email '(from test-credentials.json or TEST_USER env var)' in the Email textbox
    - expect: Email field should accept the input
    - expect: The entered email should be displayed in the field
  3. Enter password '(from test-credentials.json or TEST_PASS env var)' in the Password textbox
    - expect: Password field should accept the input
    - expect: Password should be masked for security
  4. Click the 'Log in' button
    - expect: User should be authenticated successfully
    - expect: Dashboard page should load with welcome message
    - expect: Active plan information should be displayed
    - expect: Request service button should be visible
  5. Click the 'Request service' button
    - expect: Service request creation page should load
    - expect: Plan number 13087457 should be displayed
    - expect: Search box for finding covered items should be visible
    - expect: Top picked items including Refrigerator should be displayed
    - expect: Category browse options should be available
  6. Click on 'Refrigerator' from the top picked items section
    - expect: Navigation to 'What's the issue?' page should occur
    - expect: Refrigerator should be added as Item 1
    - expect: Form fields for Symptoms, Location, Brand, Serial Number, and Model should be displayed
    - expect: Symptoms and Brand fields should be marked as Required
    - expect: Location field should be pre-populated with 'Kitchen'
    - expect: Continue button should be disabled until required fields are filled
  7. Click on the Symptoms dropdown and select 'THE UNIT IS NOT COOLING'
    - expect: Symptoms dropdown should expand showing multiple options
    - expect: Selected symptom 'The unit is not cooling' should be displayed in the dropdown
    - expect: The symptom should be successfully saved
  8. Click on the Brand dropdown and select 'Samsung'
    - expect: Brand dropdown should expand showing all available brands
    - expect: Selected brand 'Samsung' should be displayed in the dropdown
    - expect: The brand should be successfully saved
  9. Enter 'SN123456789' in the Serial Number field
    - expect: Serial Number field should accept alphanumeric input
    - expect: The entered serial number should be visible in the field
  10. Enter 'RF28HMEDBSR' in the Model field
    - expect: Model field should accept alphanumeric input
    - expect: The entered model number should be visible in the field
    - expect: Continue button should now be enabled as all required fields are filled
  11. Click the 'Continue' button
    - expect: Navigation to appointment scheduling page should occur
    - expect: Page title 'Select appointment windows' should be displayed
    - expect: Calendar widget should be visible with current month
    - expect: Instruction to choose 3 time slots should be shown
    - expect: Available dates should be highlighted in the calendar
    - expect: Time slot options for available dates should be displayed
  12. Select the '8 AM - 12 PM' time slot for Wednesday, June 24
    - expect: Checkbox for Wednesday 8 AM - 12 PM should be checked
    - expect: Selected slot '06/24, 8 AM - 12 PM' should appear in the Selected slots section
    - expect: A remove button should be available for the selected slot
  13. Select the '8 AM - 12 PM' time slot for Thursday, June 25
    - expect: Checkbox for Thursday 8 AM - 12 PM should be checked
    - expect: Selected slot '06/25, 8 AM - 12 PM' should appear in the Selected slots section
    - expect: Two slots should now be visible in the Selected slots section
  14. Select the '8 AM - 12 PM' time slot for Friday, June 26
    - expect: Checkbox for Friday 8 AM - 12 PM should be checked
    - expect: Selected slot '06/26, 8 AM - 12 PM' should appear in the Selected slots section
    - expect: All three required slots should now be selected
    - expect: Continue button should remain enabled
  15. Click the 'Continue' button
    - expect: Navigation to Review page should occur
    - expect: Page heading 'Review' should be displayed
    - expect: Service summary section should show Refrigerator item details
    - expect: Symptom 'The unit is not cooling' should be displayed
    - expect: Service Window information should indicate provider will contact to schedule
    - expect: Deductible amount of $150 should be displayed
    - expect: Total amount of $150 should be shown
    - expect: Contact information section should display phone number and email
    - expect: Continue to payment button should be visible
    - expect: Note about deductible collection should be displayed
  16. Click the 'Continue to payment' button
    - expect: Navigation to payment page should occur
    - expect: Page heading 'Select a payment option' should be displayed
    - expect: Add new credit card button should be visible with card logos (Visa, Mastercard, Discover, Amex)
    - expect: Saved card option (if any) should be listed
    - expect: Paze payment option should be available
    - expect: Summary section showing Total $150.00 should be displayed
    - expect: Terms and conditions checkbox should be unchecked
    - expect: Pay now button should be disabled
  17. Click the 'Add new credit card' button
    - expect: Credit card form should be displayed
    - expect: Form heading 'Add Credit Card' should be visible
    - expect: Card information section with fields: First Name, Last Name, Card Number, Expiration Date, CVV should be shown
    - expect: All card information fields should be marked as Required
    - expect: Billing information section should be pre-populated with address: 5412 EDSALL RIDGE PL, ALEXANDRIA, VA, 22312
    - expect: Next button should be disabled until all required fields are filled
    - expect: Cancel button should be available
  18. Enter 'Rakesh' in the First Name field
    - expect: First Name field should accept the input
    - expect: Text 'Rakesh' should be visible in the field
  19. Enter 'Lenka' in the Last Name field
    - expect: Last Name field should accept the input
    - expect: Text 'Lenka' should be visible in the field
  20. Enter '(from test-credentials.json or TEST_CARD_NUMBER env var)' in the Card Number field
    - expect: Card Number field should accept the 16-digit number
    - expect: Card type icon (Visa logo) should be displayed next to the field
    - expect: Card number should be visible in the field
  21. Enter '03/29' in the Expiration Date field
    - expect: Expiration Date field should accept the date in MM/YY format
    - expect: Date '03/29' should be visible in the field
  22. Enter '351' in the CVV field
    - expect: CVV field should accept the 3-digit security code
    - expect: CVV '351' should be visible in the field
    - expect: Next button should now be enabled as all required fields are filled
  23. Click the 'Next' button
    - expect: Credit card information should be submitted
    - expect: Return to payment selection page should occur
    - expect: New card ending in '1111' should be listed as a payment option
    - expect: The new card should be automatically selected (radio button checked)
    - expect: Edit button should be available next to the new card
    - expect: Card type icon should be displayed
    - expect: Terms and conditions checkbox should still be unchecked
    - expect: Pay now button should still be disabled
  24. Check the 'Terms and Conditions' checkbox
    - expect: Terms and conditions checkbox should be checked
    - expect: Checkmark icon should be visible in the checkbox
    - expect: Pay now button should now be enabled
  25. Click the 'Pay now' button
    - expect: Payment processing should begin
    - expect: Button text should change to 'Submitting request' with loading indicator
    - expect: Pay now button should be disabled during processing
    - expect: After processing, navigation to confirmation page should occur
  26. Verify the order confirmation page is displayed
    - expect: Confirmation page should load successfully
    - expect: Page heading 'Confirmed!' should be displayed
    - expect: Success message should indicate verification email sent to wailohia@gmail.com
    - expect: What's next instructions should state provider will contact within one business day
    - expect: Service Item section should display Refrigerator with Item 1 label
    - expect: Symptom 'The unit is not cooling' should be shown
    - expect: Service order number (e.g., SCCV6XA9B9E3) should be generated and displayed
    - expect: Item details should include: Location (Kitchen), Brand (Samsung), Model (RF28HMEDBSR), Serial number (SN123456789)
    - expect: Payment summary section should show: Item (Refrigerator), Confirmation number (e.g., tst460), Total $150
    - expect: Payment date should be displayed as current date
    - expect: Print button should be available
    - expect: Home button should be visible
    - expect: Note about deductible collection should be displayed

### 2. Service Request - Field Validation

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 2.1. Verify required field validation on item details page

**File:** `tests/service-request/field-validation-item-details.spec.ts`

**Steps:**
  1. Complete login and navigate to service request page
    - expect: User should be logged in and on service request creation page
  2. Select Refrigerator from top picked items
    - expect: Item details form should be displayed
    - expect: Continue button should be disabled
  3. Attempt to click Continue button without filling required fields
    - expect: Continue button should remain disabled
    - expect: No navigation should occur
    - expect: Symptoms and Brand fields should show Required indicator
  4. Fill only the Symptoms dropdown and leave Brand empty
    - expect: Continue button should remain disabled
    - expect: Brand field should still be marked as Required
  5. Fill both Symptoms and Brand dropdowns
    - expect: Continue button should become enabled
    - expect: Form should be ready for submission even without Serial Number and Model (as they are optional)

#### 2.2. Verify optional fields can be skipped for Serial Number and Model

**File:** `tests/service-request/optional-fields-validation.spec.ts`

**Steps:**
  1. Complete login and select Refrigerator item
    - expect: Item details form should be displayed
  2. Fill only required fields: Symptoms and Brand (leave Serial Number and Model empty)
    - expect: Continue button should be enabled
    - expect: Safety note about accessing model/serial numbers should be visible
  3. Click Continue button
    - expect: Navigation to appointment scheduling should proceed successfully
    - expect: No validation errors should appear for empty Serial Number and Model fields

#### 2.3. Verify credit card field validation

**File:** `tests/service-request/credit-card-validation.spec.ts`

**Steps:**
  1. Navigate through service request flow to payment page
    - expect: Payment page should be displayed
  2. Click Add new credit card button
    - expect: Credit card form should be displayed
    - expect: Next button should be disabled
  3. Attempt to submit form with empty fields
    - expect: Next button should remain disabled
    - expect: All required fields should show Required indicator
  4. Enter invalid card number (e.g., '1234')
    - expect: Field should accept the input but Next button should remain disabled or show validation error
    - expect: Card type icon should not appear for invalid number
  5. Enter valid card number but leave other fields empty
    - expect: Next button should remain disabled
    - expect: Card type icon should appear for valid card number
  6. Fill all required fields with valid data
    - expect: Next button should become enabled
    - expect: Form should be ready for submission

### 3. Service Request - Appointment Scheduling

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 3.1. Verify user must select exactly 3 time slots

**File:** `tests/service-request/appointment-slot-validation.spec.ts`

**Steps:**
  1. Navigate to appointment scheduling page
    - expect: Calendar should be displayed
    - expect: Instruction to select 3 time slots should be shown
    - expect: Selected slots section should show 3 'not selected' placeholders
  2. Select only 1 time slot
    - expect: Selected slot should appear in the Selected slots section
    - expect: 2 'not selected' placeholders should remain
    - expect: Continue button should be disabled or require exactly 3 selections
  3. Select 2 more time slots to reach total of 3
    - expect: All 3 selected slots should be displayed in Selected slots section
    - expect: No 'not selected' placeholders should remain
    - expect: Continue button should be enabled
  4. Click Continue button with 3 slots selected
    - expect: Navigation to Review page should proceed successfully

#### 3.2. Verify ability to remove and re-select time slots

**File:** `tests/service-request/appointment-slot-management.spec.ts`

**Steps:**
  1. Navigate to appointment scheduling page and select 3 time slots
    - expect: 3 time slots should be selected and displayed
    - expect: Each selected slot should have a Remove button
  2. Click the Remove button for the second selected slot
    - expect: The slot should be removed from Selected slots section
    - expect: Only 2 slots should remain selected
    - expect: The checkbox for that time slot should be unchecked
    - expect: One 'not selected' placeholder should appear
  3. Select a different time slot to replace the removed one
    - expect: New slot should be added to Selected slots section
    - expect: Total of 3 slots should be selected again
    - expect: Continue button should remain enabled

#### 3.3. Verify calendar navigation and date availability

**File:** `tests/service-request/calendar-navigation.spec.ts`

**Steps:**
  1. Navigate to appointment scheduling page
    - expect: Current month (June 2026) should be displayed
    - expect: Available dates should be highlighted or clickable
    - expect: Unavailable dates should be greyed out or not selectable
  2. Click the Next month button
    - expect: Calendar should advance to July 2026
    - expect: Month/Year display should update to July 2026
    - expect: Available dates for July should be shown
  3. Click the Previous month button
    - expect: Calendar should go back to June 2026
    - expect: Month/Year display should update to June 2026
  4. Click on a date with availability
    - expect: Available time slots for that date should be displayed below the calendar
    - expect: Time slot options (e.g., 8 AM - 12 PM, 12 PM - 4 PM) should be shown

### 4. Service Request - Payment Processing

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 4.1. Verify payment with saved card

**File:** `tests/service-request/payment-saved-card.spec.ts`

**Steps:**
  1. Navigate to payment page after completing review
    - expect: Payment options should be displayed
    - expect: Saved card option should be visible and checked by default
    - expect: Card ending digits should be displayed
    - expect: Card type icon should be shown
  2. Keep saved card selected and check Terms and Conditions
    - expect: Terms and conditions checkbox should be checked
    - expect: Pay now button should be enabled
  3. Click Pay now button
    - expect: Payment should be processed using saved card
    - expect: Button should show 'Submitting request' with loading indicator
    - expect: Navigation to confirmation page should occur after successful payment

#### 4.2. Verify ability to edit newly added card before payment

**File:** `tests/service-request/edit-new-card.spec.ts`

**Steps:**
  1. Add new credit card on payment page
    - expect: New card should be listed with last 4 digits
    - expect: Edit button should be available next to the card
  2. Click the Edit button for the new card
    - expect: Credit card form should reopen
    - expect: Previously entered information should be pre-populated
    - expect: User should be able to modify any field
  3. Update card information and click Next
    - expect: Updated card information should be saved
    - expect: Return to payment selection page with updated card details

#### 4.3. Verify Paze payment option

**File:** `tests/service-request/paze-payment.spec.ts`

**Steps:**
  1. Navigate to payment page
    - expect: Paze payment option should be visible in payment options list
  2. Select Paze payment option radio button
    - expect: Paze radio button should be selected
    - expect: Other payment options should be deselected
    - expect: Paze-specific payment flow should be initiated (if applicable)

#### 4.4. Verify terms and conditions requirement

**File:** `tests/service-request/terms-conditions-validation.spec.ts`

**Steps:**
  1. Navigate to payment page with payment method selected
    - expect: Terms and conditions checkbox should be unchecked by default
    - expect: Pay now button should be disabled
  2. Attempt to click Pay now button without accepting terms
    - expect: Pay now button should remain disabled
    - expect: No payment processing should occur
  3. Click on 'terms and conditions' link
    - expect: Terms and conditions content should be displayed (in modal or new page)
    - expect: User should be able to review the terms
  4. Check the terms and conditions checkbox
    - expect: Checkbox should be checked
    - expect: Pay now button should become enabled

### 5. Service Request - Navigation and Data Persistence

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 5.1. Verify Back button functionality maintains entered data

**File:** `tests/service-request/back-button-data-persistence.spec.ts`

**Steps:**
  1. Complete item details form with Symptoms, Brand, Serial Number, and Model
    - expect: All fields should be filled
    - expect: Continue button should be enabled
  2. Click Continue to go to appointment scheduling
    - expect: Appointment scheduling page should load
  3. Click Back button
    - expect: Return to item details page
    - expect: Previously entered data should be preserved in all fields (Symptoms, Brand, Serial Number, Model)
    - expect: Location field should still show Kitchen
  4. Navigate forward to appointment scheduling again
    - expect: Appointment scheduling page should load with preserved data

#### 5.2. Verify Cancel button on payment page

**File:** `tests/service-request/payment-cancel.spec.ts`

**Steps:**
  1. Navigate to payment page
    - expect: Payment options should be displayed
    - expect: Cancel button should be visible
  2. Click Cancel button
    - expect: Confirmation dialog may appear asking to confirm cancellation
    - expect: If confirmed, user should be returned to previous page or dashboard
    - expect: Service request should not be submitted
    - expect: Payment should not be processed

#### 5.3. Verify navigation from confirmation page to dashboard

**File:** `tests/service-request/confirmation-to-dashboard.spec.ts`

**Steps:**
  1. Complete service request and reach confirmation page
    - expect: Confirmation page should display success message
    - expect: Home button should be visible
  2. Click Home button
    - expect: Navigation to dashboard should occur
    - expect: Dashboard should display the newly created service request in Recent activity section
    - expect: Service request status should be visible

### 6. Service Request - Edge Cases and Error Handling

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 6.1. Verify handling of payment processing failure

**File:** `tests/service-request/payment-failure-handling.spec.ts`

**Steps:**
  1. Enter credit card details that will trigger payment failure (e.g., specific test card number)
    - expect: Credit card form should accept the card details
  2. Complete payment submission
    - expect: Payment processing should fail
    - expect: Error message should be displayed indicating payment failure
    - expect: User should remain on payment page
    - expect: User should be able to try again with different payment method

#### 6.2. Verify session timeout handling during service request

**File:** `tests/service-request/session-timeout.spec.ts`

**Steps:**
  1. Log in and start service request process
    - expect: User should be logged in and on service request page
  2. Wait for session to timeout (or simulate timeout)
    - expect: Session should expire after timeout period
  3. Attempt to continue with service request
    - expect: User should be redirected to login page
    - expect: Message about session expiration should be displayed
    - expect: After re-login, user should be able to start new service request

#### 6.3. Verify multiple item service request (up to 3 items)

**File:** `tests/service-request/multiple-items.spec.ts`

**Steps:**
  1. Select first item (Refrigerator) and fill its details
    - expect: Refrigerator should be listed as Item 1
    - expect: Add Item button should be visible and enabled
    - expect: Message 'You can add up to three items per claim' should be displayed
  2. Click Add Item button
    - expect: New item selection should be available
    - expect: User should be able to search or browse for second item
  3. Add second item (e.g., Dishwasher) and fill its details
    - expect: Dishwasher should be listed as Item 2
    - expect: Both items should be displayed with their respective details
    - expect: Add Item button should still be enabled
  4. Add third item (e.g., Microwave) and fill its details
    - expect: Microwave should be listed as Item 3
    - expect: All three items should be displayed
    - expect: Add Item button should be disabled with message indicating maximum items reached
  5. Continue with multiple items through appointment scheduling
    - expect: Appointment scheduling should accommodate all three items
    - expect: Review page should display all three items with their individual details
    - expect: Total deductible should reflect charges for all items

#### 6.4. Verify removal of items before submission

**File:** `tests/service-request/remove-items.spec.ts`

**Steps:**
  1. Add 2 items to service request
    - expect: Both items should be displayed
    - expect: Each item should have a Remove item button
  2. Click Remove item button for the second item
    - expect: Second item should be removed from the list
    - expect: Only first item should remain
    - expect: Add Item button should be enabled again
  3. Attempt to remove the last remaining item
    - expect: Item should be removed
    - expect: User should be returned to item selection page or shown message that at least one item is required

#### 6.5. Verify print functionality on confirmation page

**File:** `tests/service-request/print-confirmation.spec.ts`

**Steps:**
  1. Complete service request and reach confirmation page
    - expect: Confirmation page should be displayed
    - expect: Print button should be visible
  2. Click Print button
    - expect: Browser print dialog should open
    - expect: Confirmation page content should be formatted for printing
    - expect: All service details, payment summary, and order number should be included in print preview

#### 6.6. Verify photo identification feature (Beta)

**File:** `tests/service-request/photo-identification.spec.ts`

**Steps:**
  1. Navigate to service request creation page
    - expect: Photo identification option should be visible with Beta label
    - expect: Safety warning about accessing item tags should be displayed
  2. Click on 'Try photo identification' option
    - expect: Photo upload interface should expand
    - expect: Instructions for taking clear photo of item label should be displayed
    - expect: Upload item tag button/area should be visible
  3. Upload a valid item tag photo
    - expect: Photo should be accepted and processed
    - expect: System should attempt to identify item details from photo
    - expect: If successful, item type, brand, model, and serial number fields should be auto-populated
    - expect: User should be able to verify and edit the extracted information

### 7. Service Request - UI and Accessibility

**Seed:** `.playwright-mcp/seed.spec.ts`

#### 7.1. Verify responsive design on mobile devices

**File:** `tests/service-request/responsive-mobile.spec.ts`

**Steps:**
  1. Set browser viewport to mobile size (e.g., 375x667)
    - expect: Application should adapt to mobile screen size
    - expect: All elements should be visible and accessible without horizontal scrolling
  2. Navigate through service request flow on mobile viewport
    - expect: Forms should be easily fillable on mobile
    - expect: Buttons should be appropriately sized for touch interaction
    - expect: Dropdowns and calendar should function properly on mobile
    - expect: Navigation should work smoothly without layout issues

#### 7.2. Verify keyboard navigation and accessibility

**File:** `tests/service-request/keyboard-navigation.spec.ts`

**Steps:**
  1. Navigate to service request page using only keyboard
    - expect: Tab key should move focus through interactive elements in logical order
    - expect: Focus indicators should be visible on all focused elements
  2. Use Enter/Space to interact with buttons and select options
    - expect: Buttons should be activatable with Enter or Space key
    - expect: Dropdowns should open with Enter/Space and allow arrow key navigation
    - expect: Checkboxes should be toggleable with Space key
  3. Complete entire service request flow using only keyboard
    - expect: All functionality should be accessible via keyboard
    - expect: No mouse interaction should be required

#### 7.3. Verify screen reader compatibility

**File:** `tests/service-request/screen-reader.spec.ts`

**Steps:**
  1. Enable screen reader and navigate to service request page
    - expect: Page structure should be announced properly
    - expect: Form labels should be associated with their input fields
    - expect: Required field indicators should be announced
  2. Navigate through form fields with screen reader
    - expect: Field labels, types, and values should be announced
    - expect: Error messages and validation feedback should be announced
    - expect: Button states (enabled/disabled) should be announced
  3. Complete service request using screen reader
    - expect: All steps should be completable using screen reader navigation
    - expect: Confirmation message should be announced clearly
