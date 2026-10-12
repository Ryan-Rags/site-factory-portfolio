import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const template = fileURLToPath(new URL('../packages/template/', import.meta.url));
const slug = process.env['SITE_CLIENT'] || 'portfolio-ironvale-fabrication';
const root = join(template, 'dist', slug);
for (const route of ['', 'services', 'about', 'contact']) {
  const file = join(root, route, 'index.html');
  assert.ok(existsSync(file), `Missing built route ${route || '/'}`);
  const html = readFileSync(file, 'utf8');
  assert.match(html, /demonstration/i, 'Every page must identify the synthetic demonstration');
  assert.match(html, /name="robots"[^>]+noindex/i, 'Synthetic sites must be noindex');
  assert.doesNotMatch(html, /https:\/\/[^"<>\s]+\.(?:pages|workers)\.dev/, 'No private deployment origins');
  assert.match(html, /<title>[^<]+<\/title>/, 'Each route needs a title');
}
const headers = readFileSync(join(root, '_headers'), 'utf8');
assert.match(headers, /Content-Security-Policy/);
assert.doesNotMatch(headers.match(/script-src[^;]+/)?.[0] || '', /unsafe-inline/);
assert.ok(readdirSync(join(root, '_astro')).length > 0, 'No client bundle emitted');
console.log('Built artifact verified: four routes, synthetic/noindex posture, local-only origins, and hashed script CSP.');
