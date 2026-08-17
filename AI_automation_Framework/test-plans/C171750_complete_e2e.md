# C171750 Multi-Item Service Request E2E

## Application Overview

End-to-end test for the C171750 multi-item Warranty Repair service request flow on https://myaccount-ui.qa.cinchhs.com. The flow covers login, plan selection, service type selection, adding two appliance items (Refrigerator and Clothes Washer) with full details, reviewing the order, entering a new credit card, accepting terms and conditions, submitting payment, and verifying the confirmation page. Credentials are stored in test-credentials.json. The plan number used is 12937319 (Appliance Premium, 5841 Buena Tierra St, North Las Vegas, NV 89031).

## Test Scenarios

### 1. C171750 Multi-Item Service Request

**Seed:** `tests/seed.spec.ts`

#### 1.1. C171750 - Complete multi-item Warranty Repair service request flow @e2e @critical

**File:** `tests/C171750_multi_item_service_request.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com — the page redirects to /login
    - expect: URL is https://myaccount-ui.qa.cinchhs.com/login
    - expect: Page title is 'Cinch My Account'
    - expect: Locator: page.getByRole('textbox', { name: 'Email' }) is visible
  2. Close the cookie banner by clicking the 'X' button — locator: page.getByRole('button', { name: 'X' })
    - expect: Cookie banner is no longer visible on the page
  3. Enter email 'rlenka@cchs.com' into the Email field — locator: page.getByRole('textbox', { name: 'Email' })
    - expect: Email field contains 'rlenka@cchs.com'
  4. Enter password 'Accionlabs@2024' into the Password field — locator: page.getByRole('textbox', { name: 'Password' })
    - expect: Password field is populated
  5. Click the 'Log in' button — locator: page.getByRole('button', { name: 'Log in' })
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/dashboard
    - expect: Dashboard shows 'Welcome back Wesley!'
    - expect: My plans combobox is visible — locator: page.getByRole('combobox') is visible
  6. Click the plan dropdown trigger to open the plan list — locator: page.getByRole('button', { name: 'dropdown trigger' })
    - expect: Plan dropdown opens and shows listbox with multiple plans
    - expect: Option 'APPLIANCE PREMIUM' is visible in the list — locator: page.getByRole('option', { name: 'APPLIANCE PREMIUM' })
  7. Select 'APPLIANCE PREMIUM' from the dropdown — locator: page.getByRole('option', { name: 'APPLIANCE PREMIUM' })
    - expect: Combobox label changes to 'APPLIANCE PREMIUM'
    - expect: Plan card shows heading 'Appliance Premium' — locator: page.getByRole('heading', { name: 'Appliance Premium', level: 1 })
    - expect: Plan Number 12937319 shown
    - expect: Address shown as '5841 buena tierra st, North las vegas, NV 89031'
  8. Click the 'Request service' button on the Appliance Premium plan card — locator: page.getByRole('button', { name: 'Request service' })
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request
    - expect: Page shows heading 'Hi John, what type of service do you need?'
    - expect: Two service type options are visible: 'Warranty Repair' and 'Preventative Maintenance'
  9. Click on the 'Warranty Repair' service type card — locator: page.locator('div').filter({ hasText: 'Warranty RepairWe fix' }).nth(5)
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request/create-request
    - expect: Plan label shows 'Plan Number 12937319' and 'Appliance Premium'
    - expect: Item grid with 'Top picked items' is visible including Refrigerator, Clothes Washer, Dishwasher, Microwave
  10. Click on 'Refrigerator' in the Top picked items grid — locator: page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4)
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request/what-is-issue
    - expect: Page shows heading 'What's the issue?'
    - expect: Form section 'Details for Refrigerator' is visible — locator: page.getByRole('region', { name: 'Details for Refrigerator' }) (aria label)
    - expect: Symptom dropdown shows 'Select a symptom' — locator: page.getByRole('combobox', { name: 'Select a symptom' })
    - expect: Brand dropdown shows 'Select a brand' — locator: page.getByRole('combobox', { name: 'Select a brand' })
  11. Open the Symptom dropdown for Refrigerator by clicking the dropdown trigger — locator: page.locator('#pn_id_44').getByRole('button', { name: 'dropdown trigger' }). Then select the first symptom 'THE UNIT CAUSES THE FUSE TO BLOW' — locator: page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO' }).first()
    - expect: Symptom combobox shows 'THE UNIT CAUSES THE FUSE TO BLOW'
    - expect: Symptom dropdown is closed
  12. Open the Brand dropdown for Refrigerator by clicking the dropdown trigger — locator: page.locator('#pn_id_48').getByRole('button', { name: 'dropdown trigger' }). Then select 'Bosch' — locator: page.getByRole('option', { name: 'Bosch' })
    - expect: Brand combobox shows 'Bosch'
    - expect: Brand dropdown is closed
  13. Enter serial number 'SN12345' into the Serial Number field for Refrigerator — locator: page.getByRole('textbox', { name: 'Serial Number' })
    - expect: Serial Number field contains 'SN12345'
  14. Enter model 'MODEL123' into the Model field for Refrigerator — locator: page.getByRole('textbox', { name: 'Model' })
    - expect: Model field contains 'MODEL123'
    - expect: Both 'Continue' and 'Add Item' buttons are now enabled
  15. Click the 'Add Item' button to save Refrigerator and navigate to add a second item — locator: page.getByRole('button', { name: '  Add Item' })
    - expect: Button shows 'Saving information' while processing
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request/select-category
    - expect: Page shows heading 'Add Items'
    - expect: Alert shows deductible notice for multiple items
    - expect: Refrigerator is shown as Item 1 in the product panel with symptom 'The unit causes the fuse to blow', Brand 'Bosch', Serial 'SN12345'
    - expect: Top picked items grid is shown again to select Item 2
  16. Click on 'Clothes Washer' in the Top picked items grid — locator: page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4)
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request/what-is-issue
    - expect: Page shows both Item 1 (Refrigerator) and Item 2 (Clothes Washer) sections
    - expect: Item 1 (Refrigerator) shows read-only summary with 'The unit causes the fuse to blow'
    - expect: Item 2 (Clothes Washer) form is open with Symptom and Brand dropdowns showing 'Select a...' placeholders
  17. Open the Symptom dropdown for Clothes Washer by clicking the dropdown trigger — locator: page.locator('#pn_id_69').getByRole('button', { name: 'dropdown trigger' }). Then select the first symptom 'THE UNIT CAUSES THE FUSE TO BLOW' — locator: page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO' }).first()
    - expect: Clothes Washer symptom combobox shows 'THE UNIT CAUSES THE FUSE TO BLOW'
  18. Open the Brand dropdown for Clothes Washer by clicking the dropdown trigger — locator: page.locator('#pn_id_73').getByRole('button', { name: 'dropdown trigger' }). Then select the first available brand 'Admiral' — locator: page.getByRole('option', { name: 'Admiral' })
    - expect: Clothes Washer brand combobox shows 'Admiral'
  19. Enter serial number 'SN67890' into the Serial Number field for Clothes Washer — locator: page.getByRole('textbox', { name: 'Serial Number' }) (second occurrence or by context)
    - expect: Serial Number field for Clothes Washer contains 'SN67890'
  20. Enter model 'MODEL456' into the Model field for Clothes Washer — locator: page.getByRole('textbox', { name: 'Model' }) (second occurrence or by context)
    - expect: Model field for Clothes Washer contains 'MODEL456'
    - expect: 'Continue' button is now enabled — locator: page.getByRole('button', { name: 'Continue' })
  21. Click 'Continue' button — locator: page.getByRole('button', { name: 'Continue' })
    - expect: Button shows 'Finding the best technician' while processing
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request/review-request
    - expect: Page shows heading 'Review'
    - expect: Service summary shows Item 1 (Refrigerator) and Item 2 (Clothes Washer)
    - expect: Deductible shows $120 for Refrigerator, Total shows $120
    - expect: 'Continue to payment' button is visible — locator: page.getByRole('button', { name: 'Continue to payment' })
  22. Click 'Continue to payment' button on the Review page — locator: page.getByRole('button', { name: 'Continue to payment' })
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/make-payment
    - expect: Page shows heading 'Select a payment option'
    - expect: 'Add new credit card' button is visible — locator: page.getByRole('button', { name: ' Add new credit card visa' })
    - expect: Payment summary shows Total $120.00
  23. Click 'Add new credit card' button — locator: page.getByRole('button', { name: ' Add new credit card visa' })
    - expect: Credit card form opens with heading 'Add Credit Card'
    - expect: First Name, Last Name, Card Number, Expiration Date, CVV fields are all visible
    - expect: Billing address fields are pre-populated with the plan address
  24. Fill First Name as 'Rakesh' — locator: page.getByRole('textbox', { name: 'First Name' })
    - expect: First Name field contains 'Rakesh'
  25. Fill Last Name as 'Lenka' — locator: page.getByRole('textbox', { name: 'Last Name' })
    - expect: Last Name field contains 'Lenka'
  26. Fill Card Number as '4055011111111111' — locator: page.getByRole('textbox', { name: 'Card Number' })
    - expect: Card Number field contains '4055011111111111'
    - expect: Card icon appears indicating card type detected
  27. Fill Expiration Date as '12/28' — locator: page.getByRole('textbox', { name: 'Expiration Date (MM/YY)' })
    - expect: Expiration Date field contains '12/28'
  28. Fill CVV as '351' — locator: page.getByRole('textbox', { name: 'CVV' })
    - expect: CVV field contains '351'
    - expect: 'Next' button becomes enabled — locator: page.getByRole('button', { name: 'Next' })
  29. Click 'Next' button — locator: page.getByRole('button', { name: 'Next' })
    - expect: Credit card form closes
    - expect: New card appears in the payment options list as 'Payment option newCard' selected (checked)
    - expect: Card is shown as '************1111' with card logo
    - expect: Terms and Conditions checkbox is visible but unchecked
    - expect: 'Pay now' button is disabled until T&C is accepted
  30. Check the Terms and Conditions checkbox — locator: page.getByRole('checkbox', { name: 'Terms and Conditions Checkbox' })
    - expect: Checkbox is checked — confirmed by [checked] state
    - expect: 'Pay now' button becomes enabled — locator: page.getByRole('button', { name: 'Pay now' })
  31. Click 'Pay now' button — locator: page.getByRole('button', { name: 'Pay now' })
    - expect: Button changes to 'Submitting request' while processing
    - expect: URL navigates to https://myaccount-ui.qa.cinchhs.com/service-request/request-confirmation
    - expect: Page shows heading 'Confirmed!' — locator: page.getByRole('heading', { name: 'Confirmed!', level: 3 })
    - expect: Success message: 'Thank you! Your service request has been submitted and $120 has been billed to you.'
    - expect: Confirmation email notice is shown
    - expect: Item 1 (Refrigerator) shows Service order No. (e.g. SCCV6XA9CDDE)
    - expect: Item 2 (Clothes Washer) shows Service order No. (e.g. SCCV6XA9CDE0)
    - expect: Both items show Service provider 'DZ TEST SP 99040'
    - expect: Refrigerator item details: Location=Kitchen, Brand=Bosch, Model=MODEL123, Serial=SN12345
    - expect: Clothes Washer item details: Location=Laundry Room, Brand=Admiral, Model=MODEL456, Serial=SN67890
    - expect: Payment summary shows Refrigerator $120, Clothes Washer $0, Total $120
    - expect: Payment date shows today's date (06/26/2026)
    - expect: Confirmation # shown (e.g. tst400)
