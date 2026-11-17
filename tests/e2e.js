/**
 * SiteForge end-to-end checks.
 *
 * Runs against a live dev server. Covers the publishing pipeline (ZIP export),
 * the bilingual UI, and the template gallery + brand-logo upload.
 *
 *   npm run dev            # in one shell
 *   node tests/e2e.js      # in another
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:12000';
const results = [];
let page;

function check(name, ok, extra = '') {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
}

async function setLang(code) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate((c) => localStorage.setItem('siteforge.uiLang', c), code);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, acceptDownloads: true });
  page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  /* ---------------- bilingual UI ---------------- */
  await setLang('en');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  check('EN landing renders in English', (await page.getByText('Everything you need, nothing you don’t').count()) > 0);

  await page.getByTestId('ui-lang-ar').click();
  await page.waitForTimeout(700);
  check('AR toggle flips document direction', (await page.getAttribute('html', 'dir')) === 'rtl');
  check('AR toggle sets lang attribute', (await page.getAttribute('html', 'lang')) === 'ar');
  check('AR toggle translates landing copy', (await page.getByText('كل ما تحتاجه، دون أي تعقيد').count()) > 0);

  for (const p of ['/', '/builder', '/publish', '/super-admin']) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const o = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check(`no horizontal overflow in AR at ${p}`, o <= 0, `overflow=${o}`);
  }
  await setLang('en');

  /* ---------------- builder interactions ---------------- */
  await page.goto(`${BASE}/builder`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const elBefore = await page.locator('[data-el-id]').count();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(400);
  await page.getByText('Headings, paragraphs, any copy').first().click();
  await page.waitForTimeout(900);
  check('Add inserts a new element', (await page.locator('[data-el-id]').count()) === elBefore + 1);

  await page.locator('[data-el-id]').last().click();
  await page.waitForTimeout(800);
  check('selecting an element shows the floating toolbar', (await page.locator('select').count()) >= 1);

  await page.locator('[data-el-id]').last().click({ button: 'right' });
  await page.waitForTimeout(600);
  check('right-click opens the context menu', (await page.getByText('Duplicate').count()) > 0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(400);
  await page.getByText('Responsive photo & price grid').first().click();
  await page.waitForTimeout(1200);
  check('catalog grid can be added', (await page.locator('[data-el-id]').count()) > elBefore + 1);

  await page.getByRole('button', { name: /Languages/ }).click();
  await page.waitForTimeout(800);
  check('languages modal opens', await page.getByText('Website languages').first().isVisible());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  /* ---------------- template gallery ---------------- */
  await page.goto(`${BASE}/builder`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  check('builder shows Templates entry point', (await page.getByRole('button', { name: 'Templates' }).count()) > 0);
  await page.getByRole('button', { name: 'Templates' }).click();
  await page.waitForTimeout(700);
  check('template gallery opens', await page.getByText('Professional templates').first().isVisible());
  check('template gallery lists 7 designs', (await page.locator('button.group').count()) === 7);

  await page.getByText('Restaurant & Café').first().click();
  await page.waitForTimeout(2500);
  const afterTpl = await page.evaluate(async () => (await fetch('/api/site?id=default').then((r) => r.json())).site);
  check('applying a template replaces the document', afterTpl.name === 'Olive & Ember', afterTpl.name);
  check('template ships with EN + AR enabled', afterTpl.languages.enabled.join(',') === 'en,ar');
  check('template elements render on canvas', (await page.locator('[data-el-id]').count()) === afterTpl.elements.length);

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  check('landing showcases templates', (await page.locator('a[href*="template="]').count()) >= 6);
  await page.locator('a[href*="template=saas"]').first().click();
  await page.waitForTimeout(3000);
  const deep = await page.evaluate(async () => (await fetch('/api/site?id=default').then((r) => r.json())).site);
  check('landing card deep-links into the builder', deep.name === 'Flowdesk', deep.name);

  /* ---------------- export ---------------- */
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download' }).click(),
  ]);
  const zipPath = '/tmp/sf-test.zip';
  await dl.saveAs(zipPath);
  check('Download produces a ZIP', fs.statSync(zipPath).size > 5000, `${fs.statSync(zipPath).size} bytes`);

  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(fs.readFileSync(zipPath));
  const names = Object.keys(zip.files);
  check(
    'ZIP contains html/css/js',
    ['index.html', 'styles.css', 'script.js'].every((n) => names.includes(n)),
    names.join(',')
  );
  const html = await zip.file('index.html').async('string');
  check('exported HTML has a language switcher', html.includes('lang-bar') && html.includes('data-code="ar"'));
  check('exported HTML includes Arabic text', /[\u0600-\u06FF]/.test(html));

  /* ---------------- brand logo ---------------- */
  await page.goto(`${BASE}/super-admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('input[type=password]').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(2500);
  check('admin login succeeds', (await page.getByRole('tab').count()) === 4);
  check('admin exposes a logo uploader', (await page.locator('input[type=file]').count()) >= 1);

  await page.locator('input[type=file]').first().setInputFiles(path.join(__dirname, 'fixtures', 'logo.png'));
  await page.waitForTimeout(1200);
  check('uploaded logo previews in the picker', (await page.locator('img[alt]').count()) >= 1);
  await page.getByRole('button', { name: 'Save all changes' }).click();
  await page.waitForTimeout(2000);
  const settings = await page.evaluate(async () => (await fetch('/api/settings').then((r) => r.json())).settings);
  check('logo persists to settings', (settings.brandLogo || '').startsWith('data:image/'));
  check('logo is exposed on the public settings endpoint', typeof settings.brandLogo === 'string');

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  check('landing header uses the uploaded logo', (await page.locator('header img[alt]').count()) === 1);

  await page.goto(`${BASE}/super-admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Save all changes' }).click();
  await page.waitForTimeout(1500);
  const cleaned = await page.evaluate(async () => (await fetch('/api/settings').then((r) => r.json())).settings);
  check('logo can be removed again', !cleaned.brandLogo);

  check('no uncaught page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})();
