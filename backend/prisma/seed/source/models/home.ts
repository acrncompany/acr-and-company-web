type IconName = string;
import { ImageRef, NavLink } from './site';

/** Typed shapes for the Home page content. Later this is the JSON the NestJS API returns. */

export interface SectionHeading {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  /** Plain part of the title, followed by the highlighted (gold) word(s). */
  title: string;
  highlight: string;
  subtitle: string;
  primaryCta: NavLink;
  secondaryCta: NavLink;
  stats: HeroStat[];
  background: ImageRef;
}

export interface IconItem {
  icon: IconName;
  title: string;
  description: string;
}

export interface ServiceCard extends IconItem {
  path: string;
}

export interface CoreServicesSection {
  heading: SectionHeading;
  items: ServiceCard[];
}

export interface WhyChooseSection {
  heading: SectionHeading;
  image: ImageRef;
  features: IconItem[];
}

export interface ApproachSection {
  heading: SectionHeading;
  image: ImageRef;
  steps: IconItem[];
}

export type IndustryTone =
  'blue' | 'amber' | 'green' | 'violet' | 'rose' | 'orange' | 'teal' | 'slate';

export interface Industry {
  icon: IconName;
  label: string;
  tone: IndustryTone;
}

export interface IndustriesSection {
  heading: SectionHeading;
  items: Industry[];
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt?: string;
  image: ImageRef;
  /** ISO date (yyyy-MM-dd). */
  publishedAt?: string;
  readMinutes?: number;
  path: string;
}

export interface InsightsSection {
  heading: Pick<SectionHeading, 'eyebrow' | 'title'>;
  viewAll: NavLink;
  featured: Article;
  articles: Article[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  heading: SectionHeading;
  aside: { icon: IconName; title: string; text: string };
  items: FaqItem[];
}

export interface HomePageContent {
  hero: HeroContent;
  coreServices: CoreServicesSection;
  whyChoose: WhyChooseSection;
  approach: ApproachSection;
  industries: IndustriesSection;
  insights: InsightsSection;
  faq: FaqSection;
}
