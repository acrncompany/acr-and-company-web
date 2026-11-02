/** Typed shapes for site-wide content (the JSON the NestJS API returns from /api/public/site and /nav). */

export interface ImageRef {
  src: string;
  alt: string;
}

export interface NavLink {
  label: string;
  path: string;
  /** Set on service links (the admin-managed slug of the service). */
  slug?: string;
}

/** One column of the Services mega-menu (also reused for the footer "Services" list). */
export interface ServiceCategory {
  title: string;
  slug: string;
  path: string;
  items: NavLink[];
}

export interface NavItem extends NavLink {
  /** Home is only active on an exact match. */
  exact?: boolean;
  /** Opens the Services mega-menu instead of just linking. */
  megaMenu?: boolean;
}

export interface NavConfig {
  items: NavItem[];
  cta: NavLink;
  serviceCategories: ServiceCategory[];
}

export interface ContactInfo {
  addressLines: string[];
  email: string;
  phone: string;
  /** International format with a leading +, used for tel: links and JSON-LD. */
  phoneRaw: string;
  /**
   * Raw WhatsApp settings from the admin. The ONLY place a WhatsApp link is built is whatsappUrl()
   * in core/utils/whatsapp.ts; never write a wa.me link anywhere else.
   */
  whatsappNumber: string;
  whatsappMessage: string;
}

export interface CtaContent {
  title: string;
  text: string;
  buttonLabel: string;
  path: string;
}

export interface FooterContent {
  about: string;
  quickLinks: NavLink[];
  /** Shown after the © year. */
  copyright: string;
  tagline: string[];
}

export interface SiteConfig {
  name: string;
  tagline: string;
  legalName: string;
  foundingYear: number;
  description: string;
  logo: ImageRef;
  contact: ContactInfo;
  businessHours: string[];
  mapQuery: string;
  socialLinks: { platform: string; url: string }[];
  cta: CtaContent;
  footer: FooterContent;
}
