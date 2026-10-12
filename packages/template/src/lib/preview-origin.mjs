export const PREVIEW_SUFFIX = '';
export function previewOriginFor(slug) {
  if (!/^portfolio-[a-z0-9-]+$/.test(slug)) throw new Error('Invalid synthetic slug');
  return 'https://' + slug + '.example.invalid';
}
