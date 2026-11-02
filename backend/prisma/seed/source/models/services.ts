type IconName = string;
import { CtaContent } from './site';

/** Typed shapes for the Services page content. Later this is the JSON the NestJS API returns. */

export interface ServicesHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface ServiceOffering {
  title: string;
  description: string;
  /** "Get Started" destination. */
  path: string;
}

export interface ServiceGroup {
  /** Used as the filter-tab label and the section heading. */
  title: string;
  icon: IconName;
  items: ServiceOffering[];
}

export interface ServicesPageContent {
  hero: ServicesHeroContent;
  /** Label of the filter tab that shows every group. */
  allLabel: string;
  groups: ServiceGroup[];
  cta: CtaContent;
}
