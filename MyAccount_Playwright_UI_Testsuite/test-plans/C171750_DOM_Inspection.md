# C171750 DOM Inspection Findings

## Application Overview

DOM inspection findings for test case C171750 - My Account Request Service with 2 items. This document records exact locators, element attributes, page flow, and key findings discovered by navigating the live application at https://myaccount-ui.qa.cinchhs.com. The app is a PrimeNG/Angular SPA. Critical findings: no Contact Info page appears; Washer card is labelled "Clothes Washer"; P-SELECT IDs are dynamic; the My Plan dropdown trigger uses accessible name "dropdown trigger"; Add Item navigates to a separate category page rather than adding inline.

## Test Scenarios

### 1. DOM Inspection — Login

**Seed:** `tests/seed.spec.ts`

#### 1.1. Login page locators

**File:** `tests/dom-inspection/login.spec.ts`

**Steps:**
  1. Navigate to https://myaccount-ui.qa.cinchhs.com
    - expect: Login page renders at /login
  2. Dismiss cookie banner: page.getByRole('button', { name: 'X' })
    - expect: Banner dismissed
  3. Fill Email: page.getByRole('textbox', { name: 'Email' })
    - expect: Email field accepts input
  4. Fill Password: page.getByRole('textbox', { name: 'Password' })
    - expect: Password field accepts input
  5. Click Log in: page.getByRole('button', { name: 'Log in' })
    - expect: Redirect to /dashboard

### 2. DOM Inspection — Dashboard My Plan Dropdown

**Seed:** `tests/seed.spec.ts`

#### 2.1. My Plan dropdown trigger and second option selection

**File:** `tests/dom-inspection/dashboard.spec.ts`

**Steps:**
  1. Locate dropdown trigger button: page.getByRole('button', { name: 'dropdown trigger' }). Tag=BUTTON, no data-testid, aria-label='dropdown trigger'. Combobox initial name='CINCH REPAIR + REPLACE'.
    - expect: Dropdown trigger button is visible
  2. Click dropdown trigger to open listbox (role=listbox, name='Option List'). 31 options total.
    - expect: Listbox opens showing 31 plan options
  3. Verify option list contents: index 0='CINCH REPAIR + REPLACE' (selected), index 1='APPLIANCE PREMIUM', index 2='TXUE SURGE PROTECT MAX', etc.
    - expect: All options visible in listbox
  4. Click second option: page.getByRole('option', { name: 'APPLIANCE PREMIUM' }). Full text: 'Appliance Premium | 5841 Buena Tierra St, North Las Vegas, NV, 89031 | 12937319'
    - expect: Combobox updates to show 'APPLIANCE PREMIUM'
    - expect: Dashboard heading changes to 'Appliance Premium'
    - expect: Plan Number displayed: 12937319
    - expect: Address displayed: 5841 buena tierra st, North las vegas, NV 89031

### 3. DOM Inspection — Service Request Button

**Seed:** `tests/seed.spec.ts`

#### 3.1. Request service button locator

**File:** `tests/dom-inspection/dashboard.spec.ts`

**Steps:**
  1. Locate: page.getByRole('button', { name: 'Request service' }). Tag=BUTTON, no data-testid.
    - expect: Button is visible on the dashboard plan card

### 4. DOM Inspection — Contact Info Page

**Seed:** `tests/seed.spec.ts`

#### 4.1. Verify Contact Info page does NOT appear

**File:** `tests/dom-inspection/service-request.spec.ts`

**Steps:**
  1. Click 'Request service' — navigate to /service-request. This page shows service TYPE selection (Warranty Repair / Preventative Maintenance), NOT Contact Info.
    - expect: Page heading: 'Hi John, what type of service do you need?'
    - expect: Contact Info page does NOT appear in this flow
    - expect: No 'Next' button on this page — choices are service type cards
  2. Click Warranty Repair card to proceed to /service-request/create-request
    - expect: Navigated to item category/selection page directly (no Contact Info step)

### 5. DOM Inspection — Item Category Selection Page

**Seed:** `tests/seed.spec.ts`

#### 5.1. Refrigerator and Clothes Washer card locators

**File:** `tests/dom-inspection/item-selection.spec.ts`

**Steps:**
  1. Verify Refrigerator card. Tag=P-CARD, CSS class includes 'item-card', no data-testid, no aria-label. Locator: page.locator('.item-card').filter({ hasText: 'Refrigerator' }) OR page.locator('div').filter({ hasText: /^Refrigerator$/ }).nth(4)
    - expect: Refrigerator card is visible
  2. Verify Clothes Washer card. EXACT LABEL TEXT: 'Clothes Washer' (NOT 'Cloth Washer'). Tag=P-CARD, CSS class includes 'item-card'. Locator: page.locator('.item-card').filter({ hasText: 'Clothes Washer' }) OR page.locator('div').filter({ hasText: /^Clothes Washer$/ }).nth(4)
    - expect: Clothes Washer card is visible with exact label 'Clothes Washer'

### 6. DOM Inspection — Item 1 Form (Refrigerator)

**Seed:** `tests/seed.spec.ts`

#### 6.1. Item 1 form field locators and symptom/brand dropdowns

**File:** `tests/dom-inspection/item-form.spec.ts`

**Steps:**
  1. Click Refrigerator card -> navigates to /service-request/what-is-issue. Form is inside P-PANEL with aria-label='Details for Refrigerator'.
    - expect: Item 1 form rendered with Refrigerator header
  2. Symptom dropdown: Tag=P-SELECT (id=pn_id_XX, DYNAMIC - do not use). Combobox initial aria-label='Select a symptom'. Trigger button: page.getByRole('button', { name: 'dropdown trigger' }) (first occurrence). WARNING: P-SELECT IDs are dynamically generated by PrimeNG and change between sessions.
    - expect: Symptom dropdown visible and clickable
  3. Symptom options available: THE UNIT CAUSES THE FUSE TO BLOW, THE UNIT IS PRODUCING A BURNING SMELL, THE UNIT IS LEAKING WATER, THE UNIT IS NOT COOLING, THE UNIT IS MAKING UNUSUAL NOISE(S), THE LIGHT DOES NOT WORK, THE UNIT IS NOT WORKING AT ALL, Reported Surge Event, THE UNIT CAUSES THE BREAKER TO TRIP. Select via: page.getByRole('option', { name: 'THE UNIT IS NOT COOLING' }).click()
    - expect: 'THE UNIT IS NOT COOLING' selected
  4. Brand dropdown: Tag=P-SELECT (id=pn_id_YY, DYNAMIC). Combobox initial aria-label='Select a brand'. Trigger: scoped to brand field. Brands: Admiral, Amana, Asko, Bosch, Broan, Dacor, Electrolux, Estate, Fisher & Paykel, Frigidaire, Gaggenau, GE, GE Monogram Series, Haier, Hotpoint, Jenn-Air, Kenmore, Kitchenaid, LG, Magic Chef, Maytag, Miele, Roper, Samsung, Subzero, Tappan, Thermador, Viking, Whirlpool, Wolf, Other. Select: page.getByRole('option', { name: 'Bosch' }).click()
    - expect: Brand 'Bosch' selected
  5. Serial Number field: Tag=INPUT, aria-label='Serial Number'. Locator: page.getByRole('textbox', { name: 'Serial Number' }). Fill: SN12345
    - expect: Serial Number filled
  6. Model field: Tag=INPUT, aria-label='Model'. Locator: page.getByRole('textbox', { name: 'Model' }). Fill: MODEL123
    - expect: Model filled

### 7. DOM Inspection — Add Item Button

**Seed:** `tests/seed.spec.ts`

#### 7.1. Add Item button locator and behaviour

**File:** `tests/dom-inspection/item-form.spec.ts`

**Steps:**
  1. After filling Item 1 required fields (Symptom + Brand), verify Add Item button becomes enabled. Tag=BUTTON, CSS class='p-button-secondary p-button-rounded p-button-outlined', no data-testid, no aria-label. Text content (trimmed)='Add Item' (has leading whitespace from icon in raw DOM). Locator: page.getByRole('button', { name: /Add Item/ })
    - expect: Add Item button is enabled (not disabled) after filling required fields
  2. Click Add Item: page.getByRole('button', { name: /Add Item/ }).click(). NOTE: This navigates to /service-request/select-category (a separate page to pick the 2nd item). It does NOT add an inline form on the same page.
    - expect: Navigation to /service-request/select-category
    - expect: Item 1 summary shown at top of new page

### 8. DOM Inspection — Item 2 Form (Clothes Washer)

**Seed:** `tests/seed.spec.ts`

#### 8.1. Item 2 (Clothes Washer) form locators and differences from Item 1

**File:** `tests/dom-inspection/item-form.spec.ts`

**Steps:**
  1. On /service-request/select-category, click Clothes Washer card: page.locator('.item-card').filter({ hasText: 'Clothes Washer' }).click(). Returns to /service-request/what-is-issue.
    - expect: Both items shown: Item 1 (Refrigerator) and Item 2 (Clothes Washer)
  2. Item 2 panel: Tag=P-PANEL, aria-label='Details for Clothes Washer'. Item badge shows 'Item 2'. Default Location='Laundry Room' (vs 'Kitchen' for Item 1). Item 1 is COLLAPSED (shows summary). Item 2 is EXPANDED (editable). Scoping locator: page.locator('p-panel[aria-label="Details for Clothes Washer"]')
    - expect: Item 2 form is expanded and editable
    - expect: Item 1 is collapsed showing summary (symptom, location, brand, serial)
  3. Item 2 symptom dropdown trigger (scoped): page.locator('p-panel[aria-label="Details for Clothes Washer"]').getByRole('button', { name: 'dropdown trigger' }).first(). First available symptom: 'THE UNIT CAUSES THE FUSE TO BLOW'
    - expect: Clothes Washer symptom options visible: 13 options total
  4. Item 2 brand dropdown trigger (scoped): page.locator('p-panel[aria-label="Details for Clothes Washer"]').getByRole('button', { name: 'dropdown trigger' }).nth(2). First brand: 'Admiral'. Same brand list as Item 1.
    - expect: Brand list shows same options as Item 1
