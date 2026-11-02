type IconName = string;

/** Typed shapes for the Contact page and the Book Consultation modal. Later this is the JSON the NestJS API returns. */

export interface ContactHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface ContactDetail {
  icon: IconName;
  text: string;
  /** Makes the line a link (mailto:, tel:, https://wa.me/...). */
  href?: string;
}

export interface ContactFormContent {
  title: string;
  submitLabel: string;
  sendingLabel: string;
  successMessage: string;
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
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

/** What a visitor sends from the Book Consultation modal. */
export interface ConsultationRequest {
  name: string;
  phone: string;
  service: string;
  preferredTime: string;
}
