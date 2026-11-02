type IconName = string;
import { HeroStat, IconItem, SectionHeading } from './home';
import { ImageRef } from './site';

/** Typed shapes for the About Us page content. Later this is the JSON the NestJS API returns. */

export interface AboutHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface StorySection {
  heading: Pick<SectionHeading, 'eyebrow' | 'title'>;
  paragraphs: string[];
  stats: HeroStat[];
}

export interface FounderSection {
  heading: Pick<SectionHeading, 'eyebrow' | 'title'>;
  name: string;
  role: string;
  qualifications: string;
  bio: string;
  /** Shown in the round avatar when there is no photo. */
  fallbackIcon: IconName;
  photo?: ImageRef;
}

export interface ValuesSection {
  heading: Pick<SectionHeading, 'eyebrow' | 'title'>;
  items: IconItem[];
}

export interface NetworkSection {
  heading: SectionHeading;
  locations: string[];
}

export interface AboutPageContent {
  hero: AboutHeroContent;
  story: StorySection;
  founder: FounderSection;
  values: ValuesSection;
  network: NetworkSection;
}
