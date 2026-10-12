/**
 * One props projection for contact-page and compact quote form mounts.
 * Field rules and upload limits share one contract. Portfolio builds resolve
 * to local demo mode and never send prospect identifiers or form submissions.
 * Server-side only: the browser shares the field-rule helpers, not the registry.
 */

import { clientSlug, demoFormEndpoint, resolveForms, site } from '../../site.config';
import { quickFields, quickQuoteAt, resolveFields, type ResolvedFields } from './form-fields';
import type { QuickQuote } from '../types/site';

export interface FormIslandProps {
  mode: 'demo' | 'worker' | 'mailto';
  mailto: string;
  services: { slug: string; title: string }[];
  endpoint: string;
  prospectId: string;
  prospectName: string;
  phone: string;
  maxUploadMB: number;
  acceptedFileTypes: string[];
  turnstileSiteKey: string;
  fields: ResolvedFields;
}

/**
 * Resolve one effective forms block for all mounts. The portfolio resolver
 * always chooses local demo mode; no environment endpoint activates delivery.
 */
export function buildForms() {
  const resolved = resolveForms();
  return { ...site.forms, mode: resolved.mode, workerEndpoint: resolved.endpoint };
}

function islandProps(fields: ResolvedFields): FormIslandProps {
  const forms = buildForms();
  return {
    // Callers only reach this after checking the mode is not `disabled`.
    mode: forms.mode === 'demo' ? 'demo' : forms.mode === 'mailto' ? 'mailto' : 'worker',
    mailto: site.business.email ?? '',
    services: site.services.map((service) => ({ slug: service.slug, title: service.title })),
    endpoint: forms.workerEndpoint,
    prospectId: demoFormEndpoint ? clientSlug : '',
    prospectName: demoFormEndpoint ? site.business.name : '',
    phone: site.business.phone,
    maxUploadMB: forms.maxUploadMB,
    acceptedFileTypes: forms.acceptedFileTypes,
    turnstileSiteKey: forms.turnstileSiteKey,
    fields,
  };
}

/** The full contact-page form. Throws if this client's rules are illegal. */
export function contactFormProps(): FormIslandProps {
  return islandProps(resolveFields(site.forms, clientSlug));
}

/** The compact block: same component, narrower field set. */
export function quickFormProps(): FormIslandProps {
  return islandProps(quickFields(resolveFields(site.forms, clientSlug)));
}

/**
 * The quick block's copy for one placement, or `null` when it does not render
 * there.
 *
 * `disabled` forms return null wherever they are asked. A block that posts to
 * nothing is worse than no block: it is a promise of a reply from a shop that
 * will never see the message.
 */
export function quickQuoteFor(placement: 'home' | 'cta'): QuickQuote | null {
  if (buildForms().mode === 'disabled') return null;
  return quickQuoteAt(site.forms, placement) ? (site.forms.quickQuote as QuickQuote) : null;
}
