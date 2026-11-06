import type { IconName } from '../../shared/icon/icon';
import { CtaContent } from './site';

/** Typed shapes for the Services page content. Later this is the JSON the NestJS API returns. */

export interface ServicesHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface ServiceOffering {
  title: string;
  /** Admin-managed slug of the service. */
  slug: string;
  description: string;
}

export interface ServiceGroup {
  slug: string;
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
  cta: Omit<CtaContent, 'path'>;
}
