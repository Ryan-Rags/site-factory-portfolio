# Security and privacy

This is a portfolio/reference workflow with synthetic data. It has no hosted backend or production security assurance. Do not place real customer, lead or contact data in checked-in configs, fixtures, screenshots or docs.

## Default safety boundaries

- `pnpm demo` performs no network requests and generates drafts only.
- The template resolver always returns local form simulation mode. No contact submission is transmitted or stored.
- No mail worker, credentials, account/project IDs, deployment command or publication workflow is included.
- Fixtures use reserved `.invalid` domains and fictional `202-555-01xx` phone numbers.
- Build-time configs are trusted source, not arbitrary remote input. Synthetic samples are `noindex`.
- Dangerous HTML sinks are scanned; reviewed interpolation sites are pinned. Script CSP is generated from actual output hashes.
- Browser QA serves loopback and blocks requests to every other host.
- `scan:public` checks repository files for common secrets, private deployment origins and local paths. It is a guard, not proof that no sensitive data can exist.

## Optional live adapters

The official Places adapter can incur charges only when explicitly invoked with a key. Keep secrets outside version control; use restricted provider credentials. Its errors redact the supplied key, requests have call ceilings, and pagination is bounded. Provider field/SKU tables are snapshots, so verify current billing rules before live use.

The audit adapter loads external websites through a browser and probes links. Use only authorized public URLs. Its navigation budget is not a complete egress or SSRF policy: pages may redirect, load external assets, or resolve differently. A hosted version must add admission checks, DNS/IP validation at connection time, redirect controls, browser isolation and egress restrictions before accepting untrusted URLs. Do not expose this CLI as an unauthenticated service.

Outreach is Markdown generation only. Human review must confirm each finding and every company claim before any separate communication. Generated files may contain real inputs if operators choose live mode, so they remain ignored. Ignore rules alone do not prevent accidental sharing.

## Reporting a problem

Before a public repository exists, contact the project owner through the existing review channel. After publication, prefer a private GitHub security advisory. Do not publish credentials or third-party personal data in an issue. Rotate any exposed credentials in the issuing system; deleting a file does not revoke a secret.
