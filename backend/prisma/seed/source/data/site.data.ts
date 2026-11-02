import { SiteConfig } from '../models/site';

export const SITE_DATA: SiteConfig = {
  name: 'ACR & Company',
  tagline: 'Chartered Accountants',
  legalName: 'ACR & Company, Chartered Accountants',
  foundingYear: 2004,
  description:
    "ACR & Company — India's leading Chartered Accountancy firm delivering audit, taxation, and advisory services across India and the Middle East since 2004.",
  logo: { src: '/assets/images/logo.png', alt: 'ACR & Company logo' },
  contact: {
    addressLines: [
      '59/7706, ACR Bhawan, Annie Hall',
      'Cross Road, Chalappuram Post,',
      'Calicut, Kerala – 673002',
    ],
    email: 'acrandcompany@gmail.com',
    phone: '+91 94471 57549',
    phoneRaw: '919447157549',
    whatsappUrl:
      'https://wa.me/919447157549?text=Hello%20ACR%20%26%20Company%2C%20I%20would%20like%20to%20enquire%20about%20your%20services.',
  },
  cta: {
    title: 'Ready to grow your business?',
    text: 'Let our team of experts help you navigate the complexities of finance, tax, and compliance.',
    buttonLabel: "Let's Talk",
    path: '/contact',
  },
  footer: {
    about:
      'A prestigious multi-professional firm established in 2004, delivering excellence in audit, taxation, and business consulting across India and the Middle East.',
    quickLinks: [
      { label: 'Home', path: '/' },
      { label: 'About Us', path: '/about' },
      { label: 'Services', path: '/services' },
      { label: 'Learning Centre', path: '/learning' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact Us', path: '/contact' },
    ],
    copyright: 'ACR & Company. All Rights Reserved.',
    tagline: ['Chartered Accountants', 'Business Consultants', 'Tax Advisors'],
  },
};
