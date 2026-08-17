const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const user = process.env.TEST_USER;
  const pass = process.env.TEST_PASS;
  if (!user || !pass) {
    console.error('ERROR: TEST_USER and TEST_PASS environment variables must be set.');
    process.exit(1);
  }
  const outDir = 'artifacts';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/myplan_full.png`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto('https://myaccount-ui.qa.cinchhs.com/login', { waitUntil: 'networkidle' });
    // Fill login fields (best-effort selectors)
    const emailSel = '#login-email, input[type="email"], input[name="email"]';
    const passSel = '#login-password, input[type="password"], input[name="password"]';
    await page.waitForTimeout(1000);
    const emailLocator = page.locator(emailSel).first();
    try {
      await emailLocator.fill(user);
    } catch (e) {
      const innerEmail = emailLocator.locator('input').first();
      if (await innerEmail.count() > 0) await innerEmail.fill(user).catch(()=>{});
      else await page.evaluate((sel, val)=>{ const el = document.querySelector(sel); if(el){ const inp = el.querySelector('input'); if(inp) inp.value = val; } }, emailSel, user);
    }
    const passLocator = page.locator(passSel).first();
    try {
      await passLocator.fill(pass);
    } catch (e) {
      const innerPass = passLocator.locator('input').first();
      if (await innerPass.count() > 0) await innerPass.fill(pass).catch(()=>{});
      else await page.evaluate((sel, val)=>{ const el = document.querySelector(sel); if(el){ const inp = el.querySelector('input'); if(inp) inp.value = val; } }, passSel, pass);
    }

    // Click a submit/login button
    const btn = await page.locator('button:has-text("Sign in"), button:has-text("Sign In"), button:has-text("Log in"), button[type="submit"]').first();
    if (await btn.count() > 0) {
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(()=>{}), btn.click().catch(()=>{})]);
    } else {
      // try Enter
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(()=>{});
    }

    // Wait a bit for app to stabilize
    await page.waitForTimeout(2000);

    // Find visible buttons and prefer a candidate on the left half of viewport
    const buttons = await page.$$('button');
    let chosen = null;
    const vp = page.viewportSize() || { width: 1280, height: 800 };
    for (const b of buttons) {
      try {
        const box = await b.boundingBox();
        if (!box) continue;
        // prefer left half
        if (box.x + box.width/2 < vp.width/2) {
          chosen = b;
          break;
        }
      } catch (e) { /* ignore */ }
    }
    if (!chosen && buttons.length) chosen = buttons[0];
    if (chosen) {
      await chosen.click().catch(()=>{});
      await page.waitForTimeout(1000);
    }

    // Click "My Plan" menu item
    const myPlan = page.locator('text="My Plan"').first();
    if (await myPlan.count() > 0) {
      await myPlan.click().catch(()=>{});
    } else {
      // fallback: click by partial text
      const candidate = page.locator('text=My').first();
      if (await candidate.count() > 0) await candidate.click().catch(()=>{});
    }

    // Wait for My Plan heading
    await page.waitForTimeout(2000);
    // attempt to wait for a heading containing "My Plan"
    await page.locator('h1:has-text("My Plan"), text=My Plan').first().waitFor({ timeout: 8000 }).catch(()=>{});

    // Save full-page screenshot
    await page.screenshot({ path: outPath, fullPage: true });
    console.log('Saved screenshot to', outPath);
  } catch (err) {
    console.error('Error during extraction:', err);
    await page.screenshot({ path: outPath.replace('.png', '-error.png'), fullPage: true }).catch(()=>{});
  } finally {
    await browser.close();
  }
})();