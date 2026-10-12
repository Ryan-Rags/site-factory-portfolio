



























import type { SiteConfig } from '../../src/types/site';
import { parseDesign } from '../../src/lib/design';
import type { DesignConfig } from '../../src/types/design';

/**
 * The JSON half. Everything here is content the design layer adds and the
 * `SiteConfig` has no field for — plus the theme selection, which is the
 * whole point.
 */
export interface DesignBrief {
  theme: unknown;
  header: unknown;
  order?: unknown;
  sections: {
    hero: { variant: string; motion?: string; eyebrow?: string; badges?: string[] };
    stickyCta: unknown;
    services: { eyebrow?: string; heading: string; intro?: string; variant?: string };
    reviews: { eyebrow?: string; heading: string; intro?: string; sourceLabel: string; variant?: string; autoplayMs?: number };
    stats: unknown;
    faq: unknown;
    gallery: unknown;
    serviceArea: unknown;
    beforeAfter: unknown;
    openNow: unknown;
    footer: unknown;
  };
}

/**
 * Compose the brief with the client's confirmed content and validate the
 * result exactly as a hand-written payload would be validated.
 *
 * Nothing is invented here. Headlines, service copy, images and review text
 * all come from the `SiteConfig` the client already signed off; the brief
 * only decides how they are arranged and what the new sections say.
 */
export function deriveDesign(slug: string, site: SiteConfig, brief: DesignBrief): DesignConfig {
  const { hero, services, testimonials } = site;
  const b = brief.sections;

  const payload = {
    theme: brief.theme,
    header: brief.header,
    ...(brief.order !== undefined ? { order: brief.order } : {}),
    sections: {
      hero: {
        variant: b.hero.variant,
        ...(b.hero.motion !== undefined ? { motion: b.hero.motion } : {}),
        ...(b.hero.eyebrow !== undefined ? { eyebrow: b.hero.eyebrow } : {}),
        headline: hero.headline,
        subhead: hero.subhead,
        ctaPrimary: { text: hero.ctaPrimary.text, href: hero.ctaPrimary.href },
        ctaSecondary: { text: hero.ctaSecondary.text, href: hero.ctaSecondary.href },
        image: { src: hero.image, alt: hero.imageAlt, width: 1920, height: 1080 },
        ...(b.hero.badges !== undefined ? { badges: b.hero.badges } : {}),
        showPhone: true,
      },
      stickyCta: b.stickyCta,
      services: {
        enabled: true,
        ...(b.services.eyebrow !== undefined ? { eyebrow: b.services.eyebrow } : {}),
        heading: b.services.heading,
        ...(b.services.intro !== undefined ? { intro: b.services.intro } : {}),
        ...(b.services.variant !== undefined ? { variant: b.services.variant } : {}),
        // One card per confirmed service, in the config's own order. A shop
        // with two services gets two cards, not a three-column grid with a
        // hole in it.
        items: services.map((service) => ({
          title: service.title,
          body: service.oneLiner,
          icon: service.icon,
          image: { src: service.image, alt: service.imageAlt, width: 800, height: 600 },
          href: `/services#${service.slug}`,
        })),
      },
      reviews: {
        enabled: testimonials.length > 0,
        ...(b.reviews.eyebrow !== undefined ? { eyebrow: b.reviews.eyebrow } : {}),
        heading: b.reviews.heading,
        ...(b.reviews.intro !== undefined ? { intro: b.reviews.intro } : {}),
        sourceLabel: b.reviews.sourceLabel,
        ...(b.reviews.variant !== undefined ? { variant: b.reviews.variant } : {}),
        ...(b.reviews.autoplayMs !== undefined ? { autoplayMs: b.reviews.autoplayMs } : {}),
        // `status` and `sourceNote` travel across unchanged. A paraphrase
        // stays labelled a paraphrase in the new design, and the JSON-LD gate
        // in `Reviews.astro` keeps refusing to mark it up as a quotation.
        items: testimonials.map((t) => ({
          author: t.attribution,
          rating: t.rating,
          quote: t.quote,
          date: t.role,
          sourceNote: t.sourceNote,
          status: t.status,
        })),
      },
      stats: b.stats,
      faq: b.faq,
      gallery: b.gallery,
      // An empty `areas` list falls back to `business.serviceArea`, so the
      // section cannot contradict the business block.
      serviceArea: b.serviceArea,
      beforeAfter: b.beforeAfter,
      openNow: b.openNow,
      footer: b.footer,
    },
  };

  return parseDesign(slug, payload);
}
