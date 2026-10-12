# Site Factory

Site Factory is a TypeScript workflow for discovering businesses through the official Google Places API, auditing website problems, generating evidence-backed outreach drafts, and building configurable Astro websites. This portfolio edition retains the original package boundaries and design system, with synthetic businesses and a local demo that needs no API keys. It never sends outreach or deploys a site.

![Synthetic Ironvale desktop example](docs/screenshots/home-desktop.png)

## Try it locally

Use Node **22** and pnpm **9.15.4**. No `.env` file is required for these commands.

```sh
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm demo
pnpm dev
```

Open the localhost URL printed by Astro. The default example is **Ironvale Welding & Fabrication**, an invented business. The contact form validates input and shows a local simulation result; it transmits and stores nothing. Use synthetic input only. Demo output appears under ignored `artifacts/demo/`: a CSV, an audit report, an outreach draft, skipped reasons, and a summary.

The offline audit uses explicitly simulated browser evidence to exercise the real check and scoring functions. Lighthouse is recorded as `unavailable`, with no invented performance score. Optional browser checks exercise actual rendered pages:

```sh
pnpm exec playwright install chromium
pnpm test:ui
pnpm scan:public
```

The UI suite starts a loopback-only static server, checks desktop/mobile pages, invalid and successful form submissions, an offline state, a 404 page, reduced motion, and external-request blocking. It saves synthetic screenshots under `artifacts/ui/`. Checked-in screenshots document the verified default UI.

## How the pieces fit

| Package | Responsibility |
| --- | --- |
| `discover` | Official Places adapter with injected fetch, bounded pagination, field masks, usage accounting, CSV schema and deduplication |
| `audit` | Browser evidence collection, optional Lighthouse, rate limits, pure checks, weighted scoring, versioned cache and readable reports |
| `outreach` | Draft generation from confirmed failures; refuses unreachable sites or fewer than two findings; no delivery integration |
| `copy` | Evidence-bearing facts, explicit unknowns, niche-aware content generation, and fabrication guards |
| `template` | Typed site config, validated design briefs, five design families, Astro pages, React form island and Tailwind styles |

Five fictional examples demonstrate the existing Forge, Meridian, Heritage, Precision and Apex design families. Choose a checked-in slug with `SITE_CLIENT` before `pnpm build` or `pnpm dev`. The list is in [the sample registry](packages/template/clients/index.ts). For example, on PowerShell:

```powershell
$env:SITE_CLIENT = 'portfolio-northmark-hvac'
pnpm build
pnpm dev
```

The static output is `packages/template/dist/<slug>/`. Configurations use reserved `.invalid` domains and fictional `202-555-01xx` numbers. Placeholder testimonials and synthetic business claims are visibly identified as demonstrations; they describe no real customer or business.

## Optional live adapters

The original read-only audit collector and official Places client remain available for architectural review. Live discovery requires an explicitly supplied key and may incur provider charges. `pnpm discover -- --help` and `pnpm audit-sites -- --help` describe their options. The verified demo does not call either live service. Real inputs and generated lead/audit/outreach files are ignored by Git; inspect them before sharing anything. No Google scraping is implemented.

A [Cloudflare Pages configuration example](deployment/cloudflare-pages.example.json) explains the static build target. No credentials, deployment identifiers, deployment scripts, workers that send mail, or automatic publication workflow are included. Publication requires the owner's separate review.

## Engineering choices

See [ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md), and [SECURITY.md](SECURITY.md). Strict TypeScript includes checked indexed access and exact optional properties for the pipeline. The template validates design payloads before rendering. Its build scans dangerous HTML sinks and measures inline scripts to generate a hash-based Content Security Policy rather than guessing hashes.

CI uses the same documented build, typecheck, lint, test, offline demo, scan, and browser checks. No production/user impact, customer deployments, revenue, or compliance outcome is claimed by this portfolio edition.

## Known limitations

- Offline audit findings are simulated inputs; they are not measurements of external websites.
- Google schema/pricing tables are snapshots used by the adapter. Review current provider documentation before live use.
- The weighted neglect score is a heuristic, not a validated estimate of conversion or revenue.
- Live audit navigation budgets limit page navigations and link probes; they do not cap every asset request initiated by a third-party page.
- Configs are trusted build-time source. This is not a hosted service that accepts arbitrary user-supplied templates or URLs.
- Static preview does not enforce Cloudflare `_headers`. Hosting-specific CSP delivery needs verification after an approved deployment.
- Live Places, Lighthouse/CDP integration, email delivery, Cloudflare account setup and deployed URLs were not exercised in this edition's offline verification.
- Contact details and testimonials are fictional. Form success means local simulation only.

## What I would build next

Add runtime schemas for provider responses, a URL admission policy for hosted audits, and explicit artifact retention. Connect generated copy to template configs through a versioned review contract. Calibrate score weights against observed results rather than implying business impact. Add keyboard/screen-reader testing and approved deployment checks for delivered security headers.

The [MIT license](LICENSE) covers this extraction's first-party code. Dependency and asset scope is described in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
