import { ContactPageContent } from '../models/contact';
import { SERVICES_DATA } from './services.data';

export const CONTACT_DATA: ContactPageContent = {
  hero: {
    eyebrow: 'Get in Touch',
    title: 'Contact Us',
    subtitle: "Let's discuss how we can help your business grow. Reach out today.",
  },
  form: {
    title: 'Send Us a Message',
    submitLabel: 'Send Message',
    sendingLabel: 'Sending…',
    successMessage: 'Thank you for reaching out. Our team will get back to you within one business day.',
  },
  addressTitle: 'Office Address',
  address: [
    {
      icon: 'map-pin',
      text: '59/7706, ACR Bhawan, Annie Hall Cross Road, Chalappuram Post, Calicut, Kerala – 673002, India',
    },
    { icon: 'mail', text: 'acrandcompany@gmail.com', href: 'mailto:acrandcompany@gmail.com' },
    { icon: 'phone', text: '+91 94471 57549', href: 'tel:+919447157549' },
    { icon: 'phone', text: 'WhatsApp: +91 95447 10055', href: 'https://wa.me/919544710055' },
  ],
  hoursTitle: 'Business Hours',
  hours: [
    { icon: 'clock', text: 'Mon–Sat: 9:30 AM – 6:00 PM' },
    { icon: 'clock', text: 'Sun: Closed' },
  ],
  map: {
    query: 'ACR and Company Chartered Accountants, Chalappuram, Kozhikode',
    title: 'Map showing the ACR & Company office in Kozhikode',
    openLabel: 'Open in Maps',
  },
  // The same service list as the Services page.
  services: SERVICES_DATA.groups.map((g) => g.title),
  consultation: {
    title: 'Book a Consultation',
    subtitle: 'Fill in your details and our team will reach out within 24 hours.',
    submitLabel: 'Submit Request',
    sendingLabel: 'Submitting…',
    successMessage: 'Thank you. Our team will reach out to you within 24 hours.',
    closeLabel: 'Close',
  },
};
