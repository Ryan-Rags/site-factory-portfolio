import test from 'node:test';
import assert from 'node:assert/strict';
import { runChecks, scoreSite } from '../packages/audit/dist/index.js';
import { CallBudget, searchTextDetailed, serializeLeads, parseCsv } from '../packages/discover/dist/index.js';
import { pitchBlocker, renderPitch, servicesFrom } from '../packages/outreach/dist/index.js';
import { fact, unconfirmed, isFact } from '../packages/copy/dist/index.js';
import { fixtureLeads, fixtureAudit, fixtureEvidence } from '../scripts/fixture-evidence.mjs';

test('CSV preserves commas, quotes and newlines in sourced rows', () => {
  const row = { ...fixtureLeads()[0], notes: 'Synthetic "quote", with\na newline' };
  const parsed = parseCsv(serializeLeads([row]));
  assert.equal(parsed[1][6], row.notes);
});
test('unavailable evidence never becomes a failure or a fabricated score', () => {
  const checks = runChecks(fixtureEvidence(fixtureLeads()[0], { loaded: false }));
  assert.ok(checks.every(check => check.status === 'unavailable'));
  const score = scoreSite({ checks, rating: '', reviewCount: '' });
  assert.equal(score.neglect, undefined);
  assert.equal(score.score, 0);
});
test('unmeasured Lighthouse remains unavailable while observed layout failures count', () => {
  const result = fixtureAudit(fixtureLeads()[0]);
  assert.equal(result.checks.find(c => c.id === 'lh-performance').status, 'unavailable');
  assert.equal(result.checks.find(c => c.id === 'no-horizontal-scroll').status, 'fail');
  assert.ok(result.score > 0);
});
test('outreach uses confirmed findings and excludes navigation from services', () => {
  const result = fixtureAudit(fixtureLeads()[0]);
  assert.equal(pitchBlocker(result), undefined);
  const pitch = renderPitch(result);
  assert.equal(pitch.findingsUsed.length, 2);
  for (const check of pitch.findingsUsed) assert.ok(pitch.markdown.includes(check.evidence));
  assert.deepEqual(servicesFrom(result), ['Structural welding', 'Custom fabrication']);
});
test('insufficient findings and unreachable sites block outreach drafts', () => {
  const good = fixtureAudit(fixtureLeads()[0], { healthy: true });
  assert.match(pitchBlocker(good), /Only 0/);
  assert.throws(() => renderPitch(good), /check pitchBlocker first/);
  assert.match(pitchBlocker(fixtureAudit(fixtureLeads()[0], { loaded: false })), /could not be loaded/);
});
test('call budget refuses an extra billable request before fetch', async () => {
  let calls = 0;
  const budget = new CallBudget(0);
  await assert.rejects(searchTextDetailed({ niche: 'synthetic', max: 1, apiKey: 'fake-demo-key', budget,
    fetchImpl: async () => { calls++; return new Response('{}'); }
  }), /budget exhausted/);
  assert.equal(calls, 0);
});
test('paging cap stops a token-producing response and the mask is auditable', async () => {
  let calls = 0;
  const result = await searchTextDetailed({ niche: 'synthetic', max: 20, maxCalls: 1, apiKey: 'fake-demo-key', budget: new CallBudget(2),
    fetchImpl: async () => { calls++; return Response.json({ places: [{ id: 'fixture-single' }], nextPageToken: 'fixture-next' }); }
  });
  assert.equal(calls, 1);
  assert.equal(result.calls, 1);
  assert.ok(result.emittedFieldMask.includes('places.websiteUri'));
});
test('HTTP error never exposes the supplied provider key', async () => {
  await assert.rejects(searchTextDetailed({ niche: 'synthetic', max: 1, apiKey: 'fake-demo-key', budget: new CallBudget(),
    fetchImpl: async () => new Response('fake-demo-key provider denied request', { status: 403 })
  }), error => !error.message.includes('fake-demo-key') && error.message.includes('[REDACTED]'));
});
test('copy facts require provenance and unknowns stay explicit', () => {
  assert.throws(() => fact('invented credential', ' '), /no evidence/);
  assert.ok(isFact(fact('Synthetic name', 'Synthetic fixture authored for demo')));
  assert.equal(isFact(unconfirmed('services', 'What services are verified?')), false);
});
