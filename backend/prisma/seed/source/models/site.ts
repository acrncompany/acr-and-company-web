/** Typed shapes for site-wide content. Later these are the JSON the NestJS API returns. */

export interface ImageRef {
  src: string;
  alt: string;
}

export interface NavLink {
  label: string;
  path: string;
}

/** One column of the Services mega-menu (also reused for the footer "Services" list). */
export interface ServiceCategory {
  title: string;
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
  /** Digits only with country code, used for tel: and wa.me links. */
  phoneRaw: string;
  whatsappUrl: string;
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
  cta: CtaContent;
  footer: FooterContent;
}
