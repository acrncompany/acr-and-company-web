type IconName = string;

/** Typed shapes for the Careers page. Later this is the JSON the NestJS API returns. */

export interface CareersHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface CareerPerk {
  icon: IconName;
  title: string;
  text: string;
}

export interface JobOpening {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  /** Filter-tab label. */
  department: string;
  /** ISO date (yyyy-MM-dd). */
  postedAt: string;
}

export interface CareersContactContent {
  title: string;
  text: string;
  emails: string[];
  phone: string;
  /** Digits only with country code, used for the tel: link. */
  phoneRaw: string;
}

export interface CareersPageContent {
  hero: CareersHeroContent;
  perksTitle: string;
  perks: CareerPerk[];
  openingsTitle: string;
  allLabel: string;
  applyLabel: string;
  /** Address the Apply Now button writes to. */
  applyEmail: string;
  /** Department tabs, in display order. */
  departments: string[];
  openings: JobOpening[];
  contact: CareersContactContent;
}
