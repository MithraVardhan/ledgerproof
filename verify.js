// Browser-driven checks for the LedgerProof prototype.
// Run with: npm install && npm run verify
// Starts a local server on :4173 if one isn't already running.

const playwright = require('playwright');
const { spawn } = require('child_process');

// BROWSER=webkit or BROWSER=firefox runs the same suite cross-browser.
const ENGINE = playwright[process.env.BROWSER || 'chromium'];
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:4173';
const SHOTS = path.join(__dirname, 'verify-shots');
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
  ok ? pass++ : fail++;
};

async function ensureServer() {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    return null;
  } catch {
    const server = spawn('python3', ['-m', 'http.server', '4173'], { cwd: __dirname, stdio: 'ignore' });
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 300));
      try {
        await fetch(BASE, { signal: AbortSignal.timeout(1000) });
        return server;
      } catch {
        // keep waiting
      }
    }
    server.kill();
    throw new Error('Could not start or reach a server on :4173');
  }
}

async function launchBrowser() {
  if (process.env.BROWSER && process.env.BROWSER !== 'chromium') {
    return await ENGINE.launch({ headless: true });
  }
  try {
    return await ENGINE.launch({ channel: 'chrome', headless: true });
  } catch {
    return await ENGINE.launch({ headless: true });
  }
}

(async () => {
  const server = await ensureServer();
  const browser = await launchBrowser();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text());
  });
  const shot = (n) => page.screenshot({ path: path.join(SHOTS, n + '.png') });

  await page.goto(BASE);
  await page.waitForSelector('.work-row');

  // 1. Doc search keeps focus and full text
  await page.click('[data-nav="documents"]');
  await page.click('[data-doc-search]');
  await page.keyboard.type('invoice', { delay: 60 });
  let r = await page.evaluate(() => ({
    focused: document.activeElement?.matches('[data-doc-search]'),
    value: document.querySelector('[data-doc-search]')?.value,
  }));
  check('Doc search keeps focus across keystrokes', r.focused && r.value === 'invoice', JSON.stringify(r));

  // 2. Command palette: full typing, arrows, Enter
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
  await page.waitForSelector('[data-command-query]');
  await page.keyboard.type('juniper', { delay: 60 });
  r = await page.evaluate(() => ({
    value: document.querySelector('[data-command-query]')?.value,
    results: [...document.querySelectorAll('.command-item strong')].map((e) => e.textContent).slice(0, 3),
  }));
  check('Palette captures full query', r.value === 'juniper', JSON.stringify(r));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const h1 = await page.locator('.content h1').first().textContent();
  check('Palette Enter navigates', (await page.locator('.command-overlay').count()) === 0 && h1.includes('Juniper'), `h1="${h1}"`);
  await shot('01-generated-return');

  // 3. Generated return opens its own review (not the seeded demo client)
  r = await page.evaluate(() => document.querySelector('.context-title')?.textContent);
  check('Generated return shows own client in topbar', r.includes('Juniper'), r);
  const fieldCount = await page.locator('[data-select-field]').count();
  check('Generated return has its own fields', fieldCount >= 3, `${fieldCount} fields`);

  // 4. Dashboard: why-first matches top item under review filter
  await page.click('[data-nav="dashboard"]');
  await page.click('[data-filter="review"]');
  r = await page.evaluate(() => ({
    top: document.querySelector('.work-row .row-title')?.textContent,
    panelClient: document.querySelector('.next-up .next-title')?.textContent,
    reasons: [...document.querySelectorAll('.reason-list li span:nth-child(2)')].map((e) => e.textContent),
  }));
  check('Why-first names actual top item', r.top === r.panelClient, JSON.stringify({ top: r.top, panel: r.panelClient }));
  check('Why-first has no client-blocker claim for review filter', !r.reasons.some((t) => t.includes('Client-owned blocker')), JSON.stringify(r.reasons));
  await shot('02-review-filter');

  // 5. Officer comp doc preview matches payroll doc
  await page.click('[data-filter="mine"]');
  await page.locator('.work-row').first().click();
  await page.click('[data-select-field="field-officer-comp"]');
  r = await page.evaluate(() => ({
    title: document.querySelector('.doc-preview .invoice-title')?.textContent,
    firstRow: document.querySelector('.doc-preview .invoice-table tbody tr')?.textContent,
    highlighted: document.querySelector('.doc-preview .source-highlight')?.textContent,
  }));
  check('Officer comp preview shows payroll content', r.title.includes('Payroll') && r.firstRow.includes('Officer'), JSON.stringify(r));
  check('Officer comp row highlighted', (r.highlighted || '').includes('180,000'), r.highlighted);

  // 6. Override validation + correct-return mutation on the second seeded client
  await page.click('[data-open-return="ret-priya"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => [...document.querySelectorAll('.form-grid .micro-label')].map((e) => e.textContent));
  check('Priya wages shows value input, not COGS allocation', r.some((t) => t.includes('Corrected value')) && !r.some((t) => t.includes('COGS')), JSON.stringify(r));
  await page.fill('[data-override-value]', '150000');
  await page.fill('[data-override-reason]', 'Client provided final paystub.');
  await page.click('[data-action="save-override"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => document.querySelector('[data-select-field="field-wages"]')?.textContent.replace(/\s+/g, ' '));
  check('Wages override saved with dollar value', r.includes('150,000') && r.includes('Human override'), r);
  await page.click('[data-nav="dashboard"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => [...document.querySelectorAll('.work-row')].find((w) => w.textContent.includes('Verdant'))?.textContent.replace(/\s+/g, ' '));
  check('Verdant untouched by Priya override', r.includes('Waiting on Client'), r);

  // 7. Ask client from a Priya field opens a Priya-anchored thread
  await page.click('[data-open-return="ret-priya"]');
  await page.waitForTimeout(150);
  await page.click('[data-select-field="field-interest"]');
  await page.click('[data-action="ask-client"]');
  await page.waitForTimeout(200);
  r = await page.evaluate(() => ({
    url: location.hash,
    header: [...document.querySelectorAll('.requests-layout .panel-header h2')].map((e) => e.textContent),
  }));
  check('Ask-client opens field-specific thread', r.header.some((t) => t.toLowerCase().includes('taxable interest')), JSON.stringify(r.header));
  check('Ask-client URL synced to requests view', r.url.startsWith('#requests'), r.url);

  // 8. Client role scoping
  await page.selectOption('[data-role-select]', 'client');
  await page.waitForTimeout(200);
  r = await page.evaluate(() => ({
    topbar: document.querySelector('.context-title')?.textContent,
    nav: [...document.querySelectorAll('.nav-button')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
  }));
  check('Client topbar shows own return', r.topbar.includes('Verdant'), r.topbar);
  check('Client nav has no staff open items', !r.nav.some((t) => t.includes('W-2 conflict') || t.includes('280E')), JSON.stringify(r.nav));
  await page.click('[data-nav="documents"]');
  await page.waitForTimeout(150);
  await page.fill('[data-doc-search]', 'Blue Harbor');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => ({
    rows: document.querySelectorAll('.doc-row').length,
    badge: document.querySelector('.page-head .badge')?.textContent,
  }));
  check("Client cannot see other clients' W-2s", r.rows === 0, JSON.stringify(r));
  await page.fill('[data-doc-search]', '');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => document.querySelector('.page-head .badge')?.textContent);
  check('Client doc badge scoped to own docs', !r.includes('429 of'), r);
  await page.click('[data-nav="requests"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => [...document.querySelectorAll('.thread-row .row-title')].map((e) => e.textContent));
  check('Client sees only own threads', r.every((t) => !t.includes('K-1') && !t.includes('W-2')), JSON.stringify(r));
  r = await page.evaluate(() => [...document.querySelectorAll('.message')].length && [...document.querySelectorAll('.message')].every((m) => !m.textContent.includes('Internal note:')));
  check('Client sees no internal messages', Boolean(r));
  await page.click('[data-nav="status"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => document.querySelector('.context-title')?.textContent);
  check('Client status shows own return', r.includes('Verdant'), r);
  await shot('03-client-scoped');

  // 9. Admin is read-only
  await page.selectOption('[data-role-select]', 'admin');
  await page.waitForTimeout(200);
  await page.click('[data-nav="return"]');
  await page.waitForTimeout(150);
  await page.click('[data-select-field="field-supplies"]');
  r = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('.provenance button.button')].map((b) => ({ text: b.textContent.trim(), disabled: b.disabled })),
  }));
  check('Admin action buttons disabled', r.buttons.length > 0 && r.buttons.every((b) => b.disabled), JSON.stringify(r));

  // 10. Back/forward + hashchange navigation
  await page.selectOption('[data-role-select]', 'preparer');
  await page.waitForTimeout(200);
  await page.click('[data-nav="dashboard"]');
  await page.click('[data-nav="documents"]');
  await page.goBack();
  await page.waitForTimeout(250);
  r = await page.evaluate(() => ({ hash: location.hash, h1: document.querySelector('.content h1')?.textContent }));
  check('Browser back stays in app', r.h1 && !r.hash.includes('documents'), JSON.stringify(r));
  await page.goForward();
  await page.waitForTimeout(250);
  r = await page.evaluate(() => document.querySelector('.content h1')?.textContent);
  check('Browser forward works', r.includes('Document library'), r);
  await page.evaluate(() => {
    location.hash = '#return/ret-priya/field-wages';
  });
  await page.waitForTimeout(250);
  r = await page.evaluate(() => document.querySelector('.content h1')?.textContent);
  check('In-page hash change re-renders', r.includes('Priya'), r);

  // 11. COGS stability: re-saving same split does not change total
  await page.evaluate(() => {
    location.hash = '#return/ret-verdant/field-security';
  });
  await page.waitForTimeout(250);
  const totalBefore = await page.evaluate(() => document.querySelector('[data-select-field="field-total-cogs"]')?.textContent.match(/\$[\d,]+/)?.[0]);
  const currentSplit = await page.evaluate(() => document.querySelector('[data-override-cogs]')?.value);
  await page.fill('[data-override-reason]', 'Re-confirming existing split.');
  await page.click('[data-action="save-override"]');
  await page.waitForTimeout(150);
  const totalAfter = await page.evaluate(() => document.querySelector('[data-select-field="field-total-cogs"]')?.textContent.match(/\$[\d,]+/)?.[0]);
  check('Re-saving same split keeps total stable', totalBefore === totalAfter, `${currentSplit}% | ${totalBefore} -> ${totalAfter}`);

  // 12. Multi role personal flow
  await page.selectOption('[data-role-select]', 'multi');
  await page.waitForTimeout(200);
  await page.click('[data-nav="clientHome"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => ({ h1: document.querySelector('.client-hero h1')?.textContent, topbar: document.querySelector('.context-title')?.textContent }));
  check('Multi personal home shows K-1 story', r.h1.includes('document'), JSON.stringify(r));
  await page.click('[data-action="upload-k1"]');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => document.querySelector('.client-hero h1')?.textContent);
  check('K-1 upload completes personal task', r.includes('K-1 is in'), r);
  await shot('04-personal-flow');

  // 13. Keyboard: focus a field row + Enter selects
  await page.selectOption('[data-role-select]', 'preparer');
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    location.hash = '#return/ret-verdant/field-security';
  });
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector('[data-select-field="field-officer-comp"]')?.focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => document.querySelector('[data-select-field="field-officer-comp"]')?.className);
  check('Enter on focused field row selects it', r.includes('active'), r);

  // 14. Client full flow: answer request
  await page.selectOption('[data-role-select]', 'client');
  await page.waitForTimeout(200);
  const answerBtn = await page.locator('[data-action="complete-client-task"]').count();
  if (answerBtn) {
    await page.click('[data-action="complete-client-task"]');
    await page.waitForTimeout(150);
  }
  r = await page.evaluate(() => document.querySelector('.client-hero h1')?.textContent);
  check('Client answer flow completes', r.includes('sent to your tax team'), r);

  // 15. Internal note from reviewer
  await page.selectOption('[data-role-select]', 'reviewer');
  await page.waitForTimeout(200);
  await page.click('[data-nav="requests"]');
  await page.waitForTimeout(150);
  await page.fill('[data-message-draft]', 'Internal: verify allocation before signoff.');
  const hasInternalBtn = await page.locator('[data-action="send-internal"]').count();
  check('Staff sees internal-note option', hasInternalBtn > 0);
  if (hasInternalBtn) {
    await page.click('[data-action="send-internal"]');
    await page.waitForTimeout(150);
    r = await page.evaluate(() => {
      const msgs = [...document.querySelectorAll('.message')];
      return msgs[msgs.length - 1]?.className;
    });
    check('Internal note styled internal', (r || '').includes('internal'), r);
  }

  // 16. Empty filter empty-state (no crash)
  await page.click('[data-nav="documents"]');
  await page.waitForTimeout(150);
  await page.fill('[data-doc-search]', 'zzzznothing');
  await page.waitForTimeout(150);
  r = await page.evaluate(() => document.querySelector('.doc-list')?.textContent);
  check('Empty doc search shows empty state', r.includes('No documents match'), '');

  // 17. Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/#dashboard`);
  await page.waitForSelector('.work-row');
  await shot('05-mobile');
  check('Mobile dashboard renders', true);

  check('Zero JS errors across all flows', errors.length === 0, errors.join(' ;; ') || 'clean');
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  await browser.close();
  if (server) server.kill();
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error('DRIVER FAILED:', e.message);
  process.exit(2);
});
