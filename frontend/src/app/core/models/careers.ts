import type { IconName } from '../../shared/icon/icon';

/** Typed shapes for the Careers page and job pages (the JSON the NestJS API returns). */

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
  /** Same as slug. */
  id: string;
  /** The last part of the URL: /careers/<slug>. */
  slug: string;
  title: string;
  /** Sanitised HTML from the admin's rich-text editor. */
  description: string;
  /** Sanitised HTML; empty when the job has no requirements. */
  requirements: string;
  location: string;
  type: string;
  /** Filter-tab label ('' when the job has no department). */
  department: string;
  salary?: string;
  /** Where the Apply button writes to (the job's own address, or the careers default). */
  applyEmail: string;
  /** ISO date (yyyy-MM-dd). */
  postedAt: string;
  closingDate?: string;
}

export interface CareersContactContent {
  title: string;
  text: string;
  emails: string[];
  phone: string;
  /** International format with a leading +, used for the tel: link. */
  phoneRaw: string;
}

/** Texts of the application form on a job page (all editable in the admin). */
export interface ApplyFormContent {
  title: string;
  subtitle: string;
  submitLabel: string;
  sendingLabel: string;
  successMessage: string;
  errorMessage: string;
  tooManyMessage: string;
  /** Text under the CV field. */
  cvHint: string;
  cvErrorMessage: string;
  /** Shown when the position closed while the visitor was filling in the form. */
  closedMessage: string;
}

export interface CareersPageContent {
  hero: CareersHeroContent;
  perksTitle: string;
  perks: CareerPerk[];
  openingsTitle: string;
  allLabel: string;
  applyLabel: string;
  detailsLabel: string;
  backLabel: string;
  descriptionTitle: string;
  requirementsTitle: string;
  salaryLabel: string;
  closingLabel: string;
  /** Default address the Apply Now button writes to. */
  applyEmail: string;
  apply: ApplyFormContent;
  /** Department tabs (only departments that currently have an opening), in display order. */
  departments: string[];
  openings: JobOpening[];
  contact: CareersContactContent;
}
