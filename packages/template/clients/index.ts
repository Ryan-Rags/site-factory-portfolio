import type { SiteConfig } from '../src/types/site';
import sample0 from './portfolio-ironvale-fabrication.config';
import sample1 from './portfolio-northmark-hvac.config';
import sample2 from './portfolio-elderbrook-masonry.config';
import sample3 from './portfolio-halcott-dental.config';
import sample4 from './portfolio-voltway-electric.config';

export const clients = {
  'portfolio-ironvale-fabrication': sample0,
  'portfolio-northmark-hvac': sample1,
  'portfolio-elderbrook-masonry': sample2,
  'portfolio-halcott-dental': sample3,
  'portfolio-voltway-electric': sample4,
} satisfies Record<string, SiteConfig>;
export type ClientSlug = keyof typeof clients;
export const DEFAULT_CLIENT: ClientSlug = 'portfolio-ironvale-fabrication';
export const CLIENT_SLUGS = Object.keys(clients) as ClientSlug[];
export function isClientSlug(value: string): value is ClientSlug {
  return Object.prototype.hasOwnProperty.call(clients, value);
}
export function resolveClient(slug: string | undefined = process.env['SITE_CLIENT']): { slug: ClientSlug; site: SiteConfig } {
  if (!slug) return { slug: DEFAULT_CLIENT, site: clients[DEFAULT_CLIENT] };
  if (!isClientSlug(slug)) throw new Error('Unknown sample business. Valid choices: ' + CLIENT_SLUGS.join(', '));
  return { slug, site: clients[slug] };
}
