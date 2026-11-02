/** SEO data shapes (the JSON the NestJS API returns for /api/public/seo/*). */

export interface PageSeo {
  /** Route key, e.g. "home", "learning/<slug>", "careers/<slug>". Matches `data.seo` on the route. */
  key: string;
  /** URL path used for canonical + sitemap. */
  path: string;
  /** Short page name used to build "Page — Brand" when there is no custom meta title. */
  pageTitle: string;
  isHome?: boolean;
  /** Used exactly as typed when set. */
  metaTitle?: string;
  metaDescription?: string;
  ogType?: string;
  ogImage?: { src: string; alt: string };
  noindex?: boolean;
  /** Show the "Ready to grow your business?" band above the footer. Editable per page in the admin. */
  showCta?: boolean;
  /** Sitemap priority, 0-1. */
  priority?: number;
}

export interface OrganizationSeo {
  addressStreet: string;
  addressLocality: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
  sameAs?: string[];
}

export interface SiteSeo {
  siteName: string;
  /** Appended to non-home titles: "Page — suffix". */
  titleSuffix?: string;
  /** Origin without trailing slash. The website server overrides it with SITE_URL when set. */
  siteUrl: string;
  defaultDescription: string;
  keywords: string;
  author: string;
  themeColor: string;
  defaultOgImage: { src: string; alt: string };
  organization: OrganizationSeo;
}
