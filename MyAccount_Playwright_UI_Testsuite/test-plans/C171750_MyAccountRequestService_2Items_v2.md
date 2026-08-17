# C171750 Multi-Item Service Request Flow (2 Items)

## Application Overview

End-to-end test plan for the C171750 multi-item Warranty Repair service request flow on https://myaccount-ui.qa.cinchhs.com. The flow covers logging in, selecting the APPLIANCE PREMIUM plan, requesting Warranty Repair service, adding a Refrigerator (Item 1) with full symptom/brand/serial/model details, clicking Add Item to save it, then adding a Clothes Washer (Item 2) with its own details, and clicking Continue to reach the Review page. Every locator, spinner state, URL transition, and exact option text has been verified by live browser exploration.

## Test Scenarios

### 1. C171750 Multi-Item Service Request – Warranty Repair (Refrigerator + Clothes Washer)

**Seed:** `tests/seed.spec.ts`

#### 1.1. C171750 – Full multi-item Warranty Repair flow for APPLIANCE PREMIUM plan @e2e @critical

**File:** `tests/service-request/C171750_multi_item_service_request.spec.ts`

**Steps:**
  1. STEP 1 – LOGIN. Navigate to https://myaccount-ui.qa.cinchhs.com/. The app redirects to /login automatically. Wait for the Email textbox to be visible. Locators: `page.getByRole('textbox', { name: 'Email' })` and `page.getByRole('textbox', { name: 'Password' })` and `page.getByRole('button', { name: 'Log in' })`. Fill Email with 'rlenka@cchs.com', fill Password with the credential from test-credentials.json, then click 'Log in'.
    - expect: Page URL changes to https://myaccount-ui.qa.cinchhs.com/dashboard (with auth tokens in the hash fragment).
    - expect: The heading 'Welcome back Wesley!' (paragraph) is visible on the dashboard.
    - expect: The plan combobox defaults to 'CINCH REPAIR + REPLACE'.
  2. STEP 2 – SELECT APPLIANCE PREMIUM PLAN. On the dashboard click the 'dropdown trigger' button next to the plan combobox. Locator: `page.getByRole('button', { name: 'dropdown trigger' })`. Wait for the listbox 'Option List' to be visible. Then click the option 'APPLIANCE PREMIUM'. Locator: `page.getByRole('option', { name: 'APPLIANCE PREMIUM' })`. The option inner text is: 'Appliance Premium | 5841 Buena Tierra St, North Las Vegas, NV, 89031 | 12937319'.
    - expect: The plan combobox label changes to 'APPLIANCE PREMIUM'.
    - expect: The page heading (h1) changes to 'Appliance Premium'.
    - expect: Plan Number shown is '12937319' and address is '5841 buena tierra st, North las vegas, NV 89031'.
    - expect: Recent activity section now shows Dishwasher warranty repair entries (not Refrigerator ones).
  3. STEP 3 – CLICK REQUEST SERVICE. Click the 'Request service' button inside the Appliance Premium plan card. Locator: `page.getByRole('button', { name: 'Request service' })`. (There is only one 'Request service' button visible after the plan is selected.)
    - expect: Page navigates to https://myaccount-ui.qa.cinchhs.com/service-request.
    - expect: The heading 'Hi John, what type of service do you need?' is visible.
    - expect: Two service type tiles are visible: 'Warranty Repair' and 'Preventative Maintenance'.
  4. STEP 4 – SELECT WARRANTY REPAIR. Click the 'Warranty Repair' tile. The tile is a generic container (not a button) with an image labelled 'Warranty Repair' inside it. Locator (most stable): `page.getByRole('img', { name: 'Warranty Repair' }).locator('..')` or using the containing generic: the element with text 'Warranty RepairWe fix appliances...'. Recommended locator: `page.locator('div').filter({ hasText: /^Warranty RepairWe fix appliances/ }).first()`. Alternative: click on `page.getByRole('img', { name: 'Warranty Repair' })`.
    - expect: Page navigates to https://myaccount-ui.qa.cinchhs.com/service-request/create-request.
    - expect: The plan indicator shows 'Plan Number 12937319' and 'Appliance Premium'.
    - expect: A search box with placeholder 'Find covered items, refrigerators, clothes washer, ceiling fan, etc...' is visible.
    - expect: A 'Top picked items' grid is visible with four tiles: Refrigerator, Clothes Washer, Dishwasher, Microwave.
  5. STEP 5 – SELECT REFRIGERATOR. In the 'Top picked items' grid, click the 'Refrigerator' tile. Locator: `page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4)`. Alternative: locate by the image then its parent: `page.getByRole('img').filter({ hasText: '' })` is not reliable; instead use `page.locator('[class*="item"]').filter({ hasText: 'Refrigerator' })`. The safest generic locator observed in the live snapshot is `page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4)` (the 4th div that contains only the text 'Refrigerator').
    - expect: Page navigates to https://myaccount-ui.qa.cinchhs.com/service-request/what-is-issue.
    - expect: Heading 'What's the issue?' is visible.
    - expect: A region labelled 'Details for Refrigerator' is present and expanded, showing fields: Symptoms (required), Location (pre-filled 'Kitchen'), Brand (required), Serial Number, Model.
    - expect: Both 'Continue' and 'Add Item' buttons are disabled initially.
  6. STEP 6 – WAIT FOR REFRIGERATOR DETAILS PANEL. After clicking Refrigerator, wait for the details region to appear. Locator for the panel: `page.getByRole('region', { name: 'Toggle details for Refrigerator' })`. Wait assertion: `await page.getByRole('region', { name: 'Toggle details for Refrigerator' }).waitFor({ state: 'visible' })`.
    - expect: The region 'Toggle details for Refrigerator' is visible.
    - expect: Inside: combobox 'Select a symptom', combobox defaulting to 'Kitchen' (Location), combobox 'Select a brand', textbox 'Serial Number', textbox 'Model'.
  7. STEP 7 – OPEN REFRIGERATOR SYMPTOM DROPDOWN. Click the 'dropdown trigger' button inside the Symptoms row for the Refrigerator panel. The trigger button is scoped to a PrimeNG panel with id 'pn_id_44' (runtime id; may vary). Recommended locator using accessibility tree: `page.getByRole('combobox', { name: 'Select a symptom' }).locator('..').getByRole('button', { name: 'dropdown trigger' })`. After opening, the listbox 'Option List' appears. The full list of symptom options available for Refrigerator (in order) is:
  1. 'THE UNIT CAUSES THE FUSE TO BLOW' (visible text: The unit causes the fuse to blow)
  2. 'THE UNIT IS PRODUCING A BURNING SMELL'
  3. 'THE UNIT IS LEAKING WATER'
  4. 'THE UNIT IS NOT COOLING'
  5. 'THE UNIT IS MAKING UNUSUAL NOISE(S)'
  6. 'THE LIGHT DOES NOT WORK'
  7. 'THE UNIT IS NOT WORKING AT ALL'
  8. 'Reported Surge Event'
  9. 'THE UNIT CAUSES THE BREAKER TO TRIP'
    - expect: The symptom combobox shows [expanded] state.
    - expect: A listbox 'Option List' is visible with 9 options listed above.
    - expect: First option is 'THE UNIT CAUSES THE FUSE TO BLOW'.
  8. STEP 8 – SELECT REFRIGERATOR SYMPTOM. Click the first symptom option 'THE UNIT CAUSES THE FUSE TO BLOW'. Locator: `page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO BLOW' })`. Note: the getByRole name match may need partial string 'THE UNIT CAUSES THE FUSE TO' if the full string is truncated in matching.
    - expect: The symptom combobox closes and now shows 'THE UNIT CAUSES THE FUSE TO BLOW' as selected value.
    - expect: Inner visible text shows 'The unit causes the fuse to blow'.
  9. STEP 9 – OPEN REFRIGERATOR BRAND DROPDOWN. Click the 'dropdown trigger' button for the Brand field inside the Refrigerator panel. Recommended locator: `page.getByRole('combobox', { name: 'Select a brand' }).locator('..').getByRole('button', { name: 'dropdown trigger' })`. Full list of brand options available (in order): Admiral, Amana, Asko, Bosch, Broan, Dacor, Electrolux, Estate, Fisher & Paykel, Frigidaire, Gaggenau, GE, GE Monogram Series, Haier, Hotpoint, Jenn-Air, Kenmore, Kitchenaid, LG, Magic Chef, Maytag, Miele, Roper, Samsung, Subzero, Tappan, Thermador, Viking, Whirlpool, Wolf, Other.
    - expect: Brand combobox shows [expanded] state.
    - expect: Listbox 'Option List' visible with 31 brand options.
    - expect: 'Bosch' option is present at position 4 in the list.
  10. STEP 10 – SELECT BOSCH BRAND FOR REFRIGERATOR. Click the 'Bosch' option. Locator: `page.getByRole('option', { name: 'Bosch' })`.
    - expect: Brand combobox closes and displays 'Bosch' as the selected value.
    - expect: The 'Required' label disappears from the Brand field.
  11. STEP 11 – FILL SERIAL NUMBER FOR REFRIGERATOR. Click the 'Serial Number' textbox and type a value. Locator: `page.getByRole('textbox', { name: 'Serial Number' })`. Type value: 'SN123456789'.
    - expect: Textbox contains 'SN123456789'.
  12. STEP 12 – FILL MODEL FOR REFRIGERATOR. Click the 'Model' textbox and type a value. Locator: `page.getByRole('textbox', { name: 'Model' })`. Type value: 'MODEL123456'.
    - expect: Textbox contains 'MODEL123456'.
    - expect: Both 'Continue' and 'Add Item' buttons become enabled (no longer have [disabled] attribute).
  13. STEP 13 – CLICK ADD ITEM. Click the 'Add Item' button. Locator: `page.getByRole('button', { name: /Add Item/ })`. Note: the button label includes a leading space and icon, so use a regex or getByText with partial match. Exact accessible name observed: ' Add Item' (space + text). Use: `page.getByRole('button', { name: '  Add Item' })` or `page.locator('button').filter({ hasText: 'Add Item' })`.
    - expect: The 'Add Item' button immediately changes label to 'Saving information' (disabled spinner state). The button accessible name is 'Saving information' and it is disabled.
    - expect: After save completes (spinner disappears), the page navigates to https://myaccount-ui.qa.cinchhs.com/service-request/select-category.
    - expect: The 'Add Items' heading (h3) is visible.
    - expect: An alert panel is visible: 'Please note that a deductible will be due for each separate item you request service for...'
    - expect: The Refrigerator (Item 1) appears as a saved 'Product information panel' showing: Symptom=The unit causes the fuse to blow, Location=Kitchen, Brand=Bosch, Serial Number=SN123456789.
    - expect: The 'Top picked items' grid is visible again with all four tiles.
    - expect: 'Clothes Washer' tile is visible and clickable.
  14. STEP 14 – SELECT CLOTHES WASHER. In the 'Top picked items' grid on the /select-category page, click the 'Clothes Washer' tile. Locator: `page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4)`.
    - expect: Page navigates to https://myaccount-ui.qa.cinchhs.com/service-request/what-is-issue.
    - expect: Heading 'What's the issue?' is visible.
    - expect: TWO item panels are shown: 'Details for Refrigerator' (Item 1, collapsed/summary view with symptom summary visible) and 'Details for Clothes Washer' (Item 2, expanded and ready for input).
    - expect: The Clothes Washer details region is identified by: `page.getByRole('region', { name: 'Toggle details for Clothes Washer' })`.
    - expect: Clothes Washer fields: Symptoms (required), Location (pre-filled 'Laundry Room'), Brand (required), Serial Number, Model.
    - expect: Clothes Washer details panel locator: `page.getByRole('generic', { name: 'Details for Clothes Washer' })` or `page.locator('[aria-label="Details for Clothes Washer"]')`.
  15. STEP 15 – OPEN CLOTHES WASHER SYMPTOM DROPDOWN. Click the symptom dropdown trigger inside the 'Details for Clothes Washer' panel. The trigger button is scoped to PrimeNG id 'pn_id_69' at runtime (may vary). Recommended approach: locate the Clothes Washer panel first, then find the symptom trigger within it. Locator: `page.getByRole('region', { name: 'Toggle details for Clothes Washer' }).getByRole('button', { name: 'dropdown trigger' }).first()`. Full list of symptom options available for Clothes Washer (in order): 1. THE UNIT CAUSES THE FUSE TO BLOW, 2. THE UNIT IS PRODUCING A BURNING SMELL, 3. THE UNIT IS LEAKING WATER, 4. THE AGITATOR IS NOT TURNING DURING OPERATION, 5. THE UNIT IS NOT CLEANING PROPERLY / AT ALL, 6. THE UNIT DOES NOT DRAIN WATER, 7. THE UNIT DOES NOT FILL WITH WATER, 8. THE UNIT IS MAKING UNUSUAL NOISE(S), 9. THE UNIT IS NOT WORKING AT ALL, 10. Reported Surge Event, 11. THE UNIT SHAKES / VIBRATES WHILE IN OPERATION, 12. THE UNIT IS CAUSING DAMAGE TO THE CLOTHES, 13. THE UNIT CAUSES THE BREAKER TO TRIP.
    - expect: The symptom combobox for Clothes Washer shows [expanded] state.
    - expect: Listbox 'Option List' appears with 13 symptom options.
    - expect: First option is 'THE UNIT CAUSES THE FUSE TO BLOW'.
  16. STEP 16 – SELECT CLOTHES WASHER SYMPTOM. Click the first symptom 'THE UNIT CAUSES THE FUSE TO BLOW'. Locator: `page.getByRole('option', { name: 'THE UNIT CAUSES THE FUSE TO BLOW' })`. Use partial name match if needed: `page.getByRole('option', { name: /THE UNIT CAUSES THE FUSE TO/ })`.
    - expect: The symptom combobox closes showing 'THE UNIT CAUSES THE FUSE TO BLOW' as selected.
    - expect: Inner visible text is 'The unit causes the fuse to blow'.
  17. STEP 17 – OPEN CLOTHES WASHER BRAND DROPDOWN. Click the brand dropdown trigger inside the 'Details for Clothes Washer' panel. The trigger button is scoped to PrimeNG id 'pn_id_73' at runtime. Locator: `page.getByRole('region', { name: 'Toggle details for Clothes Washer' }).getByRole('button', { name: 'dropdown trigger' })`. Brand list is identical to the Refrigerator list: Admiral, Amana, Asko, Bosch, Broan, Dacor, Electrolux, Estate, Fisher & Paykel, Frigidaire, Gaggenau, GE, GE Monogram Series, Haier, Hotpoint, Jenn-Air, Kenmore, Kitchenaid, LG, Magic Chef, Maytag, Miele, Roper, Samsung, Subzero, Tappan, Thermador, Viking, Whirlpool, Wolf, Other.
    - expect: Brand combobox for Clothes Washer shows [expanded] state.
    - expect: Listbox 'Option List' with 31 brand options is visible.
    - expect: First option is 'Admiral'.
  18. STEP 18 – SELECT FIRST AVAILABLE BRAND FOR CLOTHES WASHER. Click 'Admiral' (the first available brand option). Locator: `page.getByRole('option', { name: 'Admiral' })`.
    - expect: Brand combobox closes showing 'Admiral' as the selected value.
    - expect: The 'Required' label disappears from the Brand field.
  19. STEP 19 – FILL SERIAL NUMBER FOR CLOTHES WASHER. Fill the Serial Number textbox for Clothes Washer. Since two Serial Number textboxes are now present on the page (one for Refrigerator in read-only summary, one for Clothes Washer), scope to the Clothes Washer region. Locator: `page.getByRole('region', { name: 'Toggle details for Clothes Washer' }).getByRole('textbox', { name: 'Serial Number' })`. Type value: 'SN987654321'.
    - expect: Serial Number textbox inside the Clothes Washer panel contains 'SN987654321'.
  20. STEP 20 – FILL MODEL FOR CLOTHES WASHER. Fill the Model textbox for Clothes Washer. Locator: `page.getByRole('region', { name: 'Toggle details for Clothes Washer' }).getByRole('textbox', { name: 'Model' })`. Type value: 'MODELWASH01'.
    - expect: Model textbox inside the Clothes Washer panel contains 'MODELWASH01'.
    - expect: Both 'Continue' and 'Add Item' buttons become enabled again.
  21. STEP 21 – CLICK CONTINUE. Click the 'Continue' button. Locator: `page.getByRole('button', { name: 'Continue' })`. This triggers an API save + technician search.
    - expect: The 'Continue' button immediately changes its label to 'Finding the best technician' (disabled spinner state). The button accessible name is 'Finding the best technician' and is disabled.
    - expect: Both 'Remove item' and 'Edit' buttons on both item panels become disabled.
    - expect: After the spinner completes, the page navigates to https://myaccount-ui.qa.cinchhs.com/service-request/review-request.
    - expect: On the review-request page, a progressbar with label 'loading' appears while the page fetches final data.
    - expect: After the loading progressbar disappears, the 'Review' page is fully rendered with: heading 'Review' (h2), heading 'Service summary' (h2), both items listed (Refrigerator Item 1 with $120 deductible, Clothes Washer Item 2 with $120 total), Contact information section, and a 'Continue to payment' button.
  22. STEP 22 – VERIFY REVIEW PAGE IS STABLE. After the progressbar disappears, assert the stable landmark element. Locator: `page.getByRole('heading', { name: 'Service summary', level: 2 })`. Also assert: `page.getByRole('button', { name: 'Continue to payment' })` is visible and enabled.
    - expect: URL is https://myaccount-ui.qa.cinchhs.com/service-request/review-request.
    - expect: Heading 'Review' (h2) is visible.
    - expect: Heading 'Service summary' (h2) is visible.
    - expect: Refrigerator (Item 1) is shown with symptom 'The unit causes the fuse to blow' and deductible '$120'.
    - expect: Clothes Washer (Item 2) is shown with symptom 'The unit causes the fuse to blow'.
    - expect: Total shown is '$120'.
    - expect: Contact information section is present.
    - expect: 'Continue to payment' button is visible and enabled.
    - expect: Service window text reads: 'After submitting service request, your assigned service provider will contact you directly to set up the appointment.'
