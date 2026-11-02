import { SiteConfig } from '../models/site';
import { SiteSeo } from '../models/seo';

/** Serialise for a <script type="application/ld+json"> block ("<" escaped so content can't close the tag). */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Organization (+ its postal address) for the home page. Everything comes from the data files. */
export function organizationJsonLd(siteUrl: string, site: SiteConfig, seo: SiteSeo) {
  const o = seo.organization;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: site.legalName,
    url: siteUrl,
    logo: `${siteUrl}${site.logo.src}`,
    email: site.contact.email,
    telephone: site.contact.phoneRaw,
    foundingDate: String(site.foundingYear),
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.addressStreet,
      addressLocality: o.addressLocality,
      addressRegion: o.addressRegion,
      postalCode: o.addressPostalCode,
      addressCountry: o.addressCountry,
    },
    ...(o.sameAs?.length ? { sameAs: o.sameAs } : {}),
  };
}
