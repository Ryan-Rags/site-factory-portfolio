import { deriveDesign, type DesignBrief } from './derive';
import type { SiteConfig } from '../../src/types/site';
import type { DesignConfig } from '../../src/types/design';
import brief0 from './portfolio-ironvale-fabrication.brief.json';
import brief1 from './portfolio-northmark-hvac.brief.json';
import brief2 from './portfolio-elderbrook-masonry.brief.json';
import brief3 from './portfolio-halcott-dental.brief.json';
import brief4 from './portfolio-voltway-electric.brief.json';

const briefs: Record<string, DesignBrief> = {
  'portfolio-ironvale-fabrication': brief0 as unknown as DesignBrief,
  'portfolio-northmark-hvac': brief1 as unknown as DesignBrief,
  'portfolio-elderbrook-masonry': brief2 as unknown as DesignBrief,
  'portfolio-halcott-dental': brief3 as unknown as DesignBrief,
  'portfolio-voltway-electric': brief4 as unknown as DesignBrief,
};
export function designFor(slug: string, site: SiteConfig): DesignConfig {
  const brief = briefs[slug];
  if (!brief) throw new Error('Missing synthetic design brief: ' + slug);
  return deriveDesign(slug, site, brief);
}
