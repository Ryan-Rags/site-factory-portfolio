import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { probeSite, runChecks, NavigationBudget } from '../packages/audit/dist/index.js';

const slug = process.env['SITE_CLIENT'] || 'portfolio-ironvale-fabrication';
const builtRoot = fileURLToPath(new URL(`../packages/template/dist/${slug}/`, import.meta.url));
const output = fileURLToPath(new URL('../artifacts/ui/', import.meta.url));
mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.txt': 'text/plain' };
const server = createServer((req, res) => {
  if (req.url === '/synthetic-legacy/') {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Synthetic legacy fixture</title></head><body><h1>Synthetic Workshop</h1><div style="width:600px">A deliberately broken synthetic layout for audit testing.</div></body></html>');
    return;
  }
  let path;
  try { path = resolve(builtRoot, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400); res.end(); return; }
  if (!path.startsWith(resolve(builtRoot) + sep) && path !== resolve(builtRoot)) { res.writeHead(403); res.end(); return; }
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
  if (!existsSync(path)) { path = join(builtRoot, '404.html'); res.statusCode = 404; }
  res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
  res.end(readFileSync(path));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
context.setDefaultTimeout(15000);
const blocked = [];
const errors = [];
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.origin !== base) { blocked.push(url.host); return route.abort(); }
  return route.continue();
});
try {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/services/', '/about/', '/contact/']) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.ok((await page.locator('h1').count()) >= 1, `Missing heading at ${path}`);
    assert.match(await page.locator('body').innerText(), /demonstration|invented business/i);
    assert.ok(await page.title());
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(output, 'home-desktop.png'), fullPage: false });
  await page.screenshot({ path: join(output, 'home-fullpage.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2), false, 'Mobile horizontal overflow');
  await page.screenshot({ path: join(output, 'home-mobile.png'), fullPage: false });
  await page.goto(base + '/contact/', { waitUntil: 'networkidle' });
  assert.deepEqual(errors, [], 'Contact hydration JavaScript errors');
  assert.deepEqual(blocked, [], 'Contact external requests');
  const form = page.locator('form').first();
  await form.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('astro-island')].filter(element => element.getAttribute('component-url')?.includes('ContactForm')).every(element => !element.hasAttribute('ssr')));
  // Disable native validation to exercise the React validation branch.
  await form.evaluate(element => { element.noValidate = true; });
  await form.locator('button[type="submit"]').click();
  await form.locator('.form-error').first().waitFor();
  assert.ok(await form.locator('.form-error').count() > 0, 'Invalid fields should show feedback');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(output, 'form-invalid.png'), fullPage: true });
  async function fillSynthetic() {
    await page.locator('input[name="name"]').first().fill('Synthetic Reviewer');
    await page.locator('input[name="phone"]').first().fill('(202) 555-0119');
    await page.locator('input[name="email"]').first().fill('review@example.invalid');
    await page.locator('textarea[name="message"]').first().fill('This is synthetic input for a local portfolio demo.');
  }
  await fillSynthetic();
  await form.locator('button[type="submit"]').click();
  await page.getByText('Demo complete — nothing was sent.', { exact: true }).waitFor();
  assert.match(await page.locator('body').innerText(), /Nothing was transmitted or stored/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(output, 'form-success.png'), fullPage: true });
  await page.getByRole('button', { name: 'Send another' }).click();
  await fillSynthetic();
  await context.setOffline(true);
  await page.locator('form').first().locator('button[type="submit"]').click();
  await page.getByText('No signal right now.', { exact: true }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(output, 'form-offline.png'), fullPage: true });
  await context.setOffline(false);
  const response = await page.goto(base + '/missing-demo-route/', { waitUntil: 'networkidle' });
  assert.equal(response.status(), 404);
  await page.screenshot({ path: join(output, 'not-found.png'), fullPage: true });
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  assert.deepEqual(blocked, [], 'The sample should not attempt external requests');
  const probe = await probeSite({ browser, url: base + '/synthetic-legacy/', slug: 'synthetic-legacy', budget: new NavigationBudget(), outDir: join(output, 'audit') });
  assert.equal(probe.loaded, true);
  const measured = runChecks({ probe, lighthouse: { scores: undefined, error: 'Not run in local browser fixture test.' }, links: undefined, faviconFallback: undefined, now: new Date('2026-01-01T00:00:00.000Z') });
  assert.equal(measured.find(c => c.id === 'viewport-meta').status, 'pass');
  assert.equal(measured.find(c => c.id === 'no-horizontal-scroll').status, 'fail');
  assert.equal(measured.find(c => c.id === 'lh-performance').status, 'unavailable');
  console.log('UI passed: home/services/about/contact, 390px overflow, validation, local success, offline, 404, reduced-motion context, zero external requests or JS errors, and measured local browser audit fixture.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
