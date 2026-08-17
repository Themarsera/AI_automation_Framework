# C171750 MyAccount Multi-Item Service Request (2 Items, 1 Category)

## Application Overview

MyAccount (https://myaccount-ui.qa.cinchhs.com) service-request flow for a warranty repair request covering two appliance items in a single claim using the APPLIANCE PREMIUM plan. The application is an Angular SPA using PrimeNG components throughout.

KEY ARCHITECTURAL FACTS (discovered via live browser exploration on 2026-06-26):

PAGE NAVIGATION SEQUENCE
  /login → /dashboard → /service-request → /service-request/create-request → /service-request/what-is-issue → /service-request/select-category → /service-request/what-is-issue → /service-request/review-request → /make-payment → /service-request/request-confirmation

DROPDOWN COMPONENT FACTS
  All dropdowns are PrimeNG p-select components rendered as:
    p-select[id="pn_id_N"] (IDs are dynamic, NOT stable across runs)
      span[role="combobox"][aria-label="<current value or placeholder>"]
      div[role="button"][aria-label="dropdown trigger"][aria-haspopup="listbox"]
      p-overlay (inline, NOT teleported to body)
        ul[role="listbox"][aria-label="Option List"]
          li[role="option"][aria-label="OPTION_VALUE_IN_ALL_CAPS"]
            span (display text in mixed case)

  CRITICAL: The dropdown trigger is a DIV with role="button", not a native BUTTON element.
  Playwright getByRole('button', { name: 'dropdown trigger' }) correctly matches it.
  The listbox renders INSIDE the panel element (confirmed: isInsidePanel = true).

ITEM PANEL STRUCTURE
  Each item gets a p-panel[aria-label="Details for {ItemName}"] containing:
    - button "Toggle details for {ItemName}" (PrimeNG accordion toggle)
    - region "Toggle details for {ItemName}" (the panel content)
      - p-select for Symptom  (aria-label on combobox: "Select a symptom" → changes to SELECTED_VALUE after selection)
      - p-select for Location (aria-label on combobox: pre-filled e.g. "Kitchen", "Laundry Room")
      - p-select for Brand    (aria-label on combobox: "Select a brand" → changes to SELECTED_VALUE after selection)
      - textbox "Serial Number"
      - textbox "Model"
    - button "Remove item"

  CRITICAL SCOPING BUG IN CURRENT POM: page.locator('[aria-label="Details for {ItemName}"]') targets
  the p-panel element. The p-panel element has 0 native <button> children with aria-label="dropdown trigger"
  but has 3 DIV[role="button"] children with that label. Playwright's getByRole traversal DOES find them,
  so the scoped locator page.locator('[aria-label="Details for ..."]').getByRole('button', { name: 'dropdown trigger' })
  WORKS correctly. The nth(0)=Symptom, nth(1)=Location, nth(2)=Brand (last()).

SYMPTOM OPTION VALUES (Refrigerator) — accessible names are ALL_CAPS:
  "THE UNIT CAUSES THE FUSE TO BLOW", "THE UNIT IS PRODUCING A BURNING SMELL",
  "THE UNIT IS LEAKING WATER", "THE UNIT IS NOT COOLING", "THE UNIT IS MAKING UNUSUAL NOISE(S)",
  "THE LIGHT DOES NOT WORK", "THE UNIT IS NOT WORKING AT ALL", "Reported Surge Event",
  "THE UNIT CAUSES THE BREAKER TO TRIP"
  Recommended: use exact string "THE UNIT IS NOT COOLING" (not regex) to avoid ambiguity.

SYMPTOM OPTION VALUES (Clothes Washer) — accessible names are ALL_CAPS:
  "THE UNIT CAUSES THE FUSE TO BLOW", "THE UNIT IS PRODUCING A BURNING SMELL",
  "THE UNIT IS LEAKING WATER", "THE AGITATOR IS NOT TURNING DURING OPERATION",
  "THE UNIT IS NOT CLEANING PROPERLY / AT ALL", "THE UNIT DOES NOT DRAIN WATER",
  "THE UNIT DOES NOT FILL WITH WATER", "THE UNIT IS MAKING UNUSUAL NOISE(S)",
  "THE UNIT IS NOT WORKING AT ALL", "Reported Surge Event",
  "THE UNIT SHAKES / VIBRATES WHILE IN OPERATION", "THE UNIT IS CAUSING DAMAGE TO THE CLOTHES",
  "THE UNIT CAUSES THE BREAKER TO TRIP"

LOCATION PRE-FILLED VALUES:
  Refrigerator → "Kitchen" (options: Basement, Bedroom, Garage, Kitchen, Laundry Room, Other Living Area)
  Clothes Washer → "Laundry Room" (same option list)

BRAND OPTIONS (same list for both items):
  Admiral, Amana, Asko, Bosch, Broan, Dacor, Electrolux, Estate, Fisher & Paykel, Frigidaire,
  Gaggenau, GE, GE Monogram Series, Haier, Hotpoint, Jenn-Air, Kenmore, Kitchenaid, LG,
  Magic Chef, Maytag, Miele, Roper, Samsung, Subzero, Tappan, Thermador, Viking, Whirlpool, Wolf, Other

SPINNER / LOADING STATES (required wait anchors):
  After clicking Continue on what-is-issue page:
    Step 1: button text changes to "Saving information" (button[name="Saving information"] disabled)
    Step 2: button text changes to "Finding the best technician" (button[name="Finding the best technician"] disabled)
    Step 3: page navigates to /service-request/review-request with progressbar "loading"
    Step 4: button "Continue to payment" appears when review page is fully loaded

  After clicking Add Item (1st item complete):
    Page navigates to /service-request/select-category (NOT staying on what-is-issue)
    Wait anchor: heading "Add Items" visible on select-category page
    CRITICAL: The select-category page has the same "Top picked items" card grid as create-request

ITEM CARD SELECTORS (reliable alternative to brittle nth(4)):
  On /service-request/create-request and /service-request/select-category:
    Refrigerator card: page.locator('generic', { has: page.locator('img[alt="Refrigerator"]') })
      OR: page.locator('[cursor=pointer]').filter({ hasText: /^Refrigerator$/ }) — but nth(4) is brittle
    Recommended: page.getByText('Refrigerator', { exact: true }).first() after waiting for "Top picked items"
    Better: page.locator('div.item-card').filter({ hasText: /^Refrigerator$/ }) — inspect actual CSS class

BUTTON ENABLE CONDITIONS:
  Continue button: enabled only after BOTH Symptom AND Brand are selected for ALL items on page
  Add Item button: enabled only after BOTH Symptom AND Brand are selected for the CURRENT item
  Pay now button: disabled until Terms and Conditions checkbox is checked

PAYMENT PAGE (/make-payment):
  - Has existing saved card (radio "Payment option savedCard" checked by default)
  - "Add new credit card" button opens a form with:
      textbox "First Name", textbox "Last Name", textbox "Card Number",
      textbox "Expiration Date (MM/YY)", textbox "CVV"
      Billing: Address (pre-filled), Address Line 2, City, State dropdown, ZIP Code (pre-filled)
      button "Next" (disabled until required fields filled)
  - After Next: returns to payment selection with new card selected
  - checkbox "Terms and Conditions Checkbox" must be checked before Pay now is enabled
  - button "Pay now" — submits payment

REVIEW PAGE (/service-request/review-request):
  - Shows both items with symptom summaries
  - Shows deductible per item and total ($120 for this plan)
  - button "Continue to payment"

ROOT CAUSES OF CURRENT TEST FAILURE (c171750-multi-item-service-request.spec.ts):
  1. selectWarrantyRepair() uses div.filter({ hasText: /Warranty RepairWe fix/ }).nth(5) — the Warranty Repair
     selection card on /service-request page is a generic (not div) with no cursor=pointer attribute.
     The correct selector: page.locator('generic').filter({ hasText: /^Warranty Repair/ }) or
     wait for heading "Hi John, what type of service do you need?" then click the card.
     
  2. selectItem() uses page.locator('div').filter({ hasText: /^{itemName}$/ }).nth(4) — nth(4) is extremely
     brittle. Use: page.locator('[cursor=pointer]').filter({ has: page.getByText(itemName, { exact: true }) })
     scoped to the items grid container.
  
  3. fillItemDetails() symptom regex: new RegExp(symptomText, 'i') with 'not cooling' should match
     "THE UNIT IS NOT COOLING" but is fragile. Use exact option name: "THE UNIT IS NOT COOLING".
  
  4. fillItemDetails() brand panel scoping: page.locator('[aria-label="Details for {itemName}"]').getByRole('button', { name: 'dropdown trigger' }).first()
     — This DOES work per DOM inspection. The panel p-panel element contains 3 DIV[role="button"] dropdown triggers.
     Order: first()=Symptom, nth(1)=Location, last()=Brand. The test correctly uses first() for symptom and last() for brand.
  
  5. CRITICAL TIMING: After clickAddItem() the page navigates to /service-request/select-category.
     The test's clickAddItem() only calls waitForLoadState('domcontentloaded') but does NOT wait for
     the "Add Items" heading or the item grid to be ready before selectItem('Clothes Washer') is called.
     
  6. The symptom for Clothes Washer in the test is empty string '' which causes new RegExp('', 'i') to
     match any option. While this technically works, it should be 'THE UNIT IS NOT WORKING AT ALL' for reliability.

  7. MISSING WAIT in clickContinue(): After the page navigates to review-request, the page shows a
     progressbar "loading" before the review content appears. The test must wait for
     button "Continue to payment" to be visible before proceeding.

## Test Scenarios

### 1. C171750 Multi-Item Service Request (2 Items, 1 Category)

**Seed:** `tests/seed.spec.ts`

#### 1.1. @critical @e2e Complete Service Request Flow - 2 Items Same Category

**File:** `tests/c171750-multi-item-service-request.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com/login
    - expect: URL is https://myaccount-ui.qa.cinchhs.com/login
    - expect: textbox 'Email' is visible
  2. If cookie banner is present (button 'X' visible), click it to dismiss
    - expect: Cookie consent banner disappears
  3. Fill textbox 'Email' with rlenka@cchs.com and textbox 'Password' with credentials from test-credentials.json, then click button 'Log in'
    - expect: URL changes to /dashboard
    - expect: button 'Request service' is eventually visible (wait up to 30s)
    - expect: Dashboard heading 'Welcome back Wesley!' is visible
  4. Click button 'dropdown trigger' (the plan selector combobox trigger) to open the plan list. Wait for listbox 'Option List' to appear. Click option 'APPLIANCE PREMIUM'.
    - expect: Listbox closes
    - expect: combobox label updates to 'APPLIANCE PREMIUM'
    - expect: heading 'Appliance Premium' appears on dashboard
    - expect: button 'Request service' for Appliance Premium plan is visible
  5. Click button 'Request service' for the Appliance Premium plan
    - expect: URL changes to /service-request
    - expect: heading 'Hi John, what type of service do you need?' is visible
    - expect: Two service type cards visible: 'Warranty Repair' and 'Preventative Maintenance'
  6. Click the Warranty Repair service type card (the entire card area including img and text). Wait for URL to change.
    - expect: URL changes to /service-request/create-request
    - expect: heading 'Find a covered item' section is visible
    - expect: Section 'Top picked items' with Refrigerator, Clothes Washer, Dishwasher, Microwave cards is visible
  7. Click the 'Refrigerator' item card from the 'Top picked items' section (the generic card element with cursor=pointer containing img and text 'Refrigerator')
    - expect: URL changes to /service-request/what-is-issue
    - expect: heading 'What's the issue?' is visible
    - expect: generic 'Details for Refrigerator' panel is visible and expanded
    - expect: combobox 'Select a symptom' is visible inside the Refrigerator panel
    - expect: combobox 'Kitchen' (Location, pre-filled) is visible
    - expect: combobox 'Select a brand' is visible
    - expect: button 'Continue' is disabled
    - expect: button 'Add Item' is disabled
  8. Scope to generic 'Details for Refrigerator'. Click button 'dropdown trigger' (first, which is the Symptoms dropdown trigger). Wait for listbox 'Option List' to appear inside the panel.
    - expect: combobox 'Select a symptom' is now [expanded]
    - expect: listbox 'Option List' is visible inside the Refrigerator panel with 9 options including 'THE UNIT IS NOT COOLING'
  9. Click option 'THE UNIT IS NOT COOLING' from the open listbox
    - expect: Listbox closes
    - expect: combobox aria-label changes to 'THE UNIT IS NOT COOLING'
    - expect: Visible text inside combobox shows 'The unit is not cooling'
    - expect: 'Required' validation label next to Symptoms disappears
  10. Within generic 'Details for Refrigerator', click button 'dropdown trigger' (last, which is the Brand dropdown — 3rd trigger). Wait for listbox 'Option List' to appear.
    - expect: combobox 'Select a brand' is now [expanded]
    - expect: listbox 'Option List' is visible with brands including Admiral, Amana, Bosch, etc.
  11. Click option 'Bosch' from the open brand listbox
    - expect: Listbox closes
    - expect: combobox aria-label changes to 'Bosch'
    - expect: 'Required' validation label next to Brand disappears
    - expect: button 'Continue' becomes enabled (no [disabled] attribute)
    - expect: button 'Add Item' becomes enabled
  12. Within generic 'Details for Refrigerator', fill textbox 'Serial Number' with 'SN12345'
    - expect: Serial Number field contains 'SN12345'
  13. Within generic 'Details for Refrigerator', fill textbox 'Model' with 'MODEL123'
    - expect: Model field contains 'MODEL123'
  14. Click button 'Add Item' (now enabled). Wait for navigation.
    - expect: URL changes to /service-request/select-category
    - expect: heading 'Add Items' is visible
    - expect: A 'Product information panel' showing Refrigerator Item 1 summary is visible
    - expect: Below it, a new item selection area with 'Top picked items' showing Refrigerator, Clothes Washer, Dishwasher, Microwave is visible
    - expect: Alert about deductible per item is visible
  15. Click the 'Clothes Washer' item card from the 'Top picked items' section on the select-category page
    - expect: URL changes to /service-request/what-is-issue
    - expect: heading 'What's the issue?' is visible
    - expect: generic 'Details for Refrigerator' panel is visible in SUMMARY/READ-ONLY mode (shows Symptom/Location/Brand values as text paragraphs, has 'Edit' button)
    - expect: generic 'Details for Clothes Washer' panel is visible and expanded with editable dropdowns
    - expect: combobox 'Select a symptom' inside Clothes Washer panel is visible
    - expect: combobox 'Laundry Room' (Location pre-filled) is visible inside Clothes Washer panel
    - expect: combobox 'Select a brand' inside Clothes Washer panel is visible
    - expect: button 'Continue' is disabled
    - expect: button 'Add Item' is disabled
  16. Scope to generic 'Details for Clothes Washer'. Click button 'dropdown trigger' (first, which is the Symptoms dropdown trigger). Wait for listbox 'Option List' to appear.
    - expect: combobox 'Select a symptom' inside Clothes Washer panel is [expanded]
    - expect: listbox 'Option List' shows 13 Clothes Washer-specific symptoms including 'THE UNIT IS NOT WORKING AT ALL'
  17. Click option 'THE UNIT IS NOT WORKING AT ALL' from the open listbox
    - expect: Listbox closes
    - expect: combobox aria-label inside Clothes Washer panel changes to 'THE UNIT IS NOT WORKING AT ALL'
    - expect: 'Required' validation label for Symptoms disappears from Clothes Washer panel
  18. Within generic 'Details for Clothes Washer', click button 'dropdown trigger' (last, which is the Brand dropdown — 3rd trigger). Wait for listbox 'Option List' to appear.
    - expect: combobox 'Select a brand' inside Clothes Washer panel is [expanded]
    - expect: listbox shows same brand list as Refrigerator
  19. Click option 'Admiral' (or any valid brand) from the brand listbox for Clothes Washer
    - expect: Listbox closes
    - expect: Brand combobox inside Clothes Washer panel shows 'Admiral'
    - expect: 'Required' validation label for Brand disappears
    - expect: button 'Continue' becomes enabled
    - expect: button 'Add Item' becomes enabled
  20. Within generic 'Details for Clothes Washer', fill textbox 'Serial Number' with 'SN67890'
    - expect: Serial Number field inside Clothes Washer panel contains 'SN67890'
  21. Within generic 'Details for Clothes Washer', fill textbox 'Model' with 'MODEL456'
    - expect: Model field inside Clothes Washer panel contains 'MODEL456'
  22. Click button 'Continue' (now enabled)
    - expect: Button text changes to 'Saving information' with spinner (button is [disabled])
    - expect: URL stays on /service-request/what-is-issue during saving
    - expect: After saving completes, button text changes to 'Finding the best technician' with spinner (still [disabled])
    - expect: After technician matching completes, page navigates to /service-request/review-request
    - expect: progressbar 'loading' appears briefly on review page
  23. Wait for button 'Continue to payment' to become visible on the review page
    - expect: URL is /service-request/review-request
    - expect: heading 'Review' is visible
    - expect: heading 'Service summary' is visible
    - expect: Item 1: Refrigerator with 'The unit is not cooling' summary is visible
    - expect: Item 2: Clothes Washer with 'The unit is not working at all' summary is visible
    - expect: Deductible $120 per item and total $120 are visible
    - expect: button 'Continue to payment' is visible and enabled
  24. Click button 'Continue to payment'
    - expect: URL changes to /make-payment
    - expect: heading 'Select a payment option' is visible
    - expect: button ' Add new credit card visa card master card discover card amex card' is visible
    - expect: radio 'Payment option savedCard' may already be checked (saved card exists)
    - expect: checkbox 'Terms and Conditions Checkbox' is visible
    - expect: button 'Pay now' is [disabled]
  25. Click button ' Add new credit card visa card master card discover card amex card' to open the card entry form
    - expect: Card entry form appears with heading 'Add Credit Card'
    - expect: textbox 'First Name' is visible
    - expect: textbox 'Last Name' is visible
    - expect: textbox 'Card Number' is visible
    - expect: textbox 'Expiration Date (MM/YY)' is visible
    - expect: textbox 'CVV' is visible
    - expect: Billing address fields are pre-filled from plan address
    - expect: button 'Next' is [disabled]
  26. Fill textbox 'First Name' with 'Rakesh', textbox 'Last Name' with 'Lenka', textbox 'Card Number' with '4055011111111111', textbox 'Expiration Date (MM/YY)' with '12/28', textbox 'CVV' with '351'
    - expect: All required fields are filled
    - expect: button 'Next' becomes enabled
  27. Click button 'Next'
    - expect: Card form closes or proceeds
    - expect: Returns to payment selection page with new card details
    - expect: checkbox 'Terms and Conditions Checkbox' is visible
    - expect: button 'Pay now' is still [disabled] (until terms accepted)
  28. Check checkbox 'Terms and Conditions Checkbox'
    - expect: Checkbox is checked
    - expect: button 'Pay now' becomes enabled (no [disabled] attribute)
  29. Click button 'Pay now'
    - expect: Payment is submitted
    - expect: URL eventually changes to /service-request/request-confirmation
    - expect: heading 'Confirmed!' is visible
  30. Verify the confirmation page shows both items confirmed. Scroll down to see full confirmation.
    - expect: URL matches /request-confirmation
    - expect: heading 'Confirmed!' is visible
    - expect: At least two 'Service order No.' entries are visible (one per item)
    - expect: Deductible amount $120 is visible
    - expect: Both Refrigerator and Clothes Washer are referenced in the confirmation
