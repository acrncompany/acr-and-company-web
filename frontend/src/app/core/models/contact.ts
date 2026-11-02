import type { IconName } from '../../shared/icon/icon';

/** Typed shapes for the Contact page and the Book Consultation modal. Later this is the JSON the NestJS API returns. */

export interface ContactHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface ContactDetail {
  icon: IconName;
  text: string;
  /** Makes the line a link (mailto:, tel:, or the WhatsApp link built by whatsappUrl()). */
  href?: string;
}

export interface ContactFormContent {
  title: string;
  submitLabel: string;
  sendingLabel: string;
  successMessage: string;
  /** Shown when sending fails. */
  errorMessage: string;
  /** Shown when the visitor hit the rate limit. */
  tooManyMessage: string;
}

export interface ContactMapContent {
  /** Google Maps search text, used for the embed and the "Open in Maps" link. */
  query: string;
  title: string;
  openLabel: string;
}

export interface ConsultationContent {
  title: string;
  subtitle: string;
  submitLabel: string;
  sendingLabel: string;
  successMessage: string;
  errorMessage: string;
  tooManyMessage: string;
  closeLabel: string;
}

export interface ContactPageContent {
  hero: ContactHeroContent;
  form: ContactFormContent;
  addressTitle: string;
  address: ContactDetail[];
  hoursTitle: string;
  hours: ContactDetail[];
  map: ContactMapContent;
  /** "Service interested in" options. */
  services: string[];
  consultation: ConsultationContent;
}

/** What a visitor sends from the Contact page form. */
export interface EnquiryRequest {
  /** Honeypot: stays empty for people (the field is invisible). */
  website?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

/** What a visitor sends from the Book Consultation modal. */
export interface ConsultationRequest {
  website?: string;
  name: string;
  phone: string;
  service: string;
  preferredTime: string;
}
