import { AboutPageContent } from '../models/about';

export const ABOUT_DATA: AboutPageContent = {
  hero: {
    eyebrow: 'About Us',
    title: 'Our Story of Excellence',
    subtitle: "Two decades of trust, expertise, and unwavering commitment to our clients' success.",
  },

  story: {
    heading: { eyebrow: 'Since 2004', title: 'Building Trust Through Expertise' },
    paragraphs: [
      'Founded in 2004, ACR & Company has grown from a single-office practice into a multi-professional firm with a network spanning India and the Middle East.',
      'Our journey has been defined by an unwavering commitment to professional excellence, ethical practice, and client-centric service. Over two decades, we have served 2,000+ clients across diverse industries.',
      'Today, ACR & Company stands as a trusted name in chartered accountancy, offering comprehensive services in audit, taxation, accounting, registrations, and business consulting.',
    ],
    stats: [
      { value: '20+', label: 'Years' },
      { value: '2000+', label: 'Clients' },
      { value: '500+', label: 'Registrations' },
      { value: '50+', label: 'Professionals' },
    ],
  },

  founder: {
    heading: { eyebrow: 'Leadership', title: 'Meet Our Founder' },
    name: 'Riju Chandrasekhar',
    role: 'Founder & Managing Partner',
    qualifications: 'FCA, DISA, B.Com',
    bio: 'With over 25 years of distinguished experience in chartered accountancy and law, Riju Chandrasekhar founded ACR & Company with a vision to deliver world-class financial services rooted in integrity and innovation. Under his leadership, the firm has grown into a multi-professional practice serving clients across India and the Middle East.',
    fallbackIcon: 'graduation-cap',
  },

  values: {
    heading: { eyebrow: 'Philosophy', title: 'Our Core Values' },
    items: [
      {
        icon: 'shield',
        title: 'Integrity',
        description: 'We uphold the highest standards of professional ethics in everything we do.',
      },
      {
        icon: 'award',
        title: 'Excellence',
        description: 'Delivering exceptional quality and value to every client, every time.',
      },
      {
        icon: 'lightbulb',
        title: 'Innovation',
        description: 'Embracing technology and modern practices to stay ahead of the curve.',
      },
    ],
  },

  network: {
    heading: {
      eyebrow: 'Network',
      title: 'Pan-India & Middle East Presence',
      subtitle:
        'Our extensive network across key Indian cities and the Middle East ensures seamless service delivery.',
    },
    locations: [
      'Calicut',
      'Kochi',
      'Bangalore',
      'Mumbai',
      'Delhi',
      'Chennai',
      'Dubai',
      'Abu Dhabi',
    ],
  },
};
