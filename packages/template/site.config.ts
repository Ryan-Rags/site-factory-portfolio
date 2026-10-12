import { resolveClient } from './clients';
import type { FormsMode } from './src/types/site';
const resolved = resolveClient();
export const clientSlug = resolved.slug;
export const site = resolved.site;
export const cardOrigin = site.seo.siteUrl;
export const demoFormEndpoint = '';
// Portfolio builds always use the local form simulation, never a live endpoint.
export function resolveForms(): { mode: FormsMode; endpoint: string } {
  return { mode: 'demo', endpoint: '' };
}
export default site;
