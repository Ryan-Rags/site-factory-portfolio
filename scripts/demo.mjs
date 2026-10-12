import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { renderReport } from '../packages/audit/dist/index.js';
import { serializeLeads } from '../packages/discover/dist/index.js';
import { pitchBlocker, renderPitch, renderSkipped } from '../packages/outreach/dist/index.js';
import { DEMO_TIME, fixtureLeads, fixtureAudit } from './fixture-evidence.mjs';

// A key in the caller's environment cannot activate a live integration here.
globalThis.fetch = async () => { throw new Error('Network access is forbidden in sample/demo mode.'); };
const output = fileURLToPath(new URL('../artifacts/demo/', import.meta.url));
mkdirSync(output, { recursive: true });
const leads = fixtureLeads();
const results = leads.filter(row => row.url).map((row, index) => fixtureAudit(row, { healthy: index > 0 }));
writeFileSync(join(output, 'businesses.csv'), serializeLeads(leads));
const warning = '> SYNTHETIC DEMO: browser evidence is simulated test input. No business was contacted or measured.\n\n';
writeFileSync(join(output, 'audit-report.md'), warning + renderReport({ results, noWebsite: leads.filter(row => !row.url), generatedAt: DEMO_TIME }));
const skips = [];
let pitches = 0;
for (const result of results) {
  const reason = pitchBlocker(result);
  if (reason) skips.push({ slug: result.slug, name: result.name, reason });
  else {
    writeFileSync(join(output, result.slug + '-draft.md'), warning + renderPitch(result).markdown);
    pitches += 1;
  }
}
writeFileSync(join(output, 'skipped.md'), warning + renderSkipped(skips, DEMO_TIME));
writeFileSync(join(output, 'summary.json'), JSON.stringify({ mode: 'synthetic-offline', leads: leads.length, sites: results.length, draftCount: pitches, skippedCount: skips.length, transmitted: false, deployed: false }, null, 2) + '\n');
console.log(`Offline demo: ${leads.length} synthetic businesses, ${results.length} audit fixtures, ${pitches} reviewable draft, ${skips.length} skipped. See artifacts/demo/. Nothing was transmitted or deployed.`);
