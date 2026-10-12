import { CHECK_VERSION, runChecks, scoreSite } from '../packages/audit/dist/index.js';
import { loadFixture, placeToLead, slugify } from '../packages/discover/dist/index.js';

export const DEMO_TIME = '2026-01-01T00:00:00.000Z';
export function fixtureLeads() {
  return loadFixture().places.map(place => placeToLead(place, {
    niche: 'synthetic trades', city: 'Demo County', source: 'places-fixture', discoveredAt: DEMO_TIME,
  }));
}

// Explicitly simulated browser evidence. These values are test inputs, never
// measurements of a real business. The same pure audit rules process both.
export function fixtureEvidence(row, { healthy = false, loaded = true } = {}) {
  return {
    probe: {
      requestedUrl: row.url, finalUrl: row.url, host: new URL(row.url).host,
      loaded, loadError: loaded ? '' : 'Synthetic unreachable fixture', httpStatus: loaded ? 200 : undefined,
      redirectChain: [], isHttps: true, tlsError: '', hasViewportMeta: healthy,
      viewportContent: healthy ? 'width=device-width, initial-scale=1' : '',
      horizontalOverflowPx: healthy ? 0 : 80, transferBytes: 100000, requestCount: 3,
      phoneAboveFold: healthy, hasTelLink: healthy, hasContactForm: healthy,
      copyrightYears: [2026], generatorMeta: '', builderHints: [], sameHostLinks: [],
      socialLinks: [], jsonLdTypes: healthy ? ['LocalBusiness'] : [], hasFaviconTag: true,
      headings: [row.name, 'Structural welding', 'Custom fabrication', 'Contact us'], title: row.name,
      screenshotDesktop: '', screenshotMobile: '',
    },
    lighthouse: { scores: undefined, error: 'Not run in offline fixture mode; no score invented.' },
    links: undefined, faviconFallback: undefined, now: new Date(DEMO_TIME),
  };
}

export function fixtureAudit(row, options = {}) {
  const evidence = fixtureEvidence(row, options);
  const checks = runChecks(evidence);
  const score = scoreSite({ checks, rating: row.rating, reviewCount: row.review_count });
  return {
    slug: slugify(row.name), name: row.name, requestedUrl: row.url, finalUrl: row.url,
    niche: row.niche, city: row.city, phone: row.phone, rating: row.rating, reviewCount: row.review_count,
    checkVersion: CHECK_VERSION, auditedAt: DEMO_TIME, reachable: evidence.probe.loaded,
    unreachableReason: evidence.probe.loadError, checks, neglect: score.neglect,
    valueMultiplier: score.valueMultiplier, valueBasis: score.valueBasis, score: score.score,
    screenshotDesktop: '', screenshotMobile: '', services: evidence.probe.headings,
  };
}
