import { PageSeo, SiteSeo } from '../models/seo';
import { LEARNING_DATA } from './learning.data';

export const SITE_SEO_DATA: SiteSeo = {
  siteName: 'ACR & Company | Chartered Accountants & Business Consultants',
  titleSuffix: 'ACR & Company',
  siteUrl: 'https://acrandcompany.com',
  defaultDescription:
    "ACR & Company — India's leading Chartered Accountancy firm delivering audit, taxation, and advisory services across India and the Middle East since 2004.",
  keywords:
    'chartered accountants, audit, taxation, GST, company registration, accounting, payroll, business consultants, Calicut, Kerala',
  author: 'ACR & Company',
  themeColor: '#0a2342',
  defaultOgImage: { src: '/assets/images/hero-bg.jpg', alt: 'ACR & Company, Chartered Accountants' },
  organization: {
    addressStreet: '59/7706, ACR Bhawan, Annie Hall Cross Road, Chalappuram Post',
    addressLocality: 'Calicut',
    addressRegion: 'Kerala',
    addressPostalCode: '673002',
    addressCountry: 'IN',
  },
};

/** One entry per public route. `key` matches `data: { seo: '<key>' }` in app.routes.ts. */
export const PAGE_SEO_DATA: PageSeo[] = [
  {
    key: 'home',
    path: '/',
    pageTitle: 'Home',
    isHome: true,
    metaTitle: 'ACR & Company | Chartered Accountants & Business Consultants',
    priority: 1,
  },
  {
    key: 'about',
    path: '/about',
    pageTitle: 'About Us',
    metaTitle: 'About Us | ACR & Company Chartered Accountants',
    metaDescription:
      'Established in 2004, ACR & Company is a multi-professional CA firm with 20+ years of expertise serving clients across India and the Middle East.',
    showCta: false,
    priority: 0.8,
  },
  {
    key: 'services',
    path: '/services',
    pageTitle: 'Services',
    metaTitle: 'Services | ACR & Company Chartered Accountants',
    metaDescription:
      'Audit, taxation, accounting and payroll, registrations, consulting and advisory, and IP services from ACR & Company, Chartered Accountants.',
    showCta: false,
    priority: 0.9,
  },
  {
    key: 'learning',
    path: '/learning',
    pageTitle: 'Learning Centre',
    metaTitle: 'Learning Centre | ACR & Company Chartered Accountants',
    metaDescription:
      'Expert insights, regulatory updates, and practical guides on GST, income tax, audit, budget and business advisory from ACR & Company.',
    showCta: false,
    priority: 0.7,
  },
  // One entry per article, built from the Learning Centre content. Keys match `learning/<slug>` (see SeoService).
  ...LEARNING_DATA.articles.map(
    (a): PageSeo => ({
      key: `learning/${a.slug}`,
      path: `/learning/${a.slug}`,
      pageTitle: a.title,
      metaDescription: a.excerpt,
      ogType: 'article',
      ogImage: a.image,
      showCta: false,
      priority: 0.6,
    }),
  ),
  {
    key: 'careers',
    path: '/careers',
    pageTitle: 'Careers',
    metaTitle: 'Careers | ACR & Company Chartered Accountants',
    metaDescription:
      'Build your career with ACR & Company. Articleship, internship and accounting, audit and advisory openings in Calicut, Cochin and Bangalore.',
    showCta: false,
    priority: 0.7,
  },
  {
    key: 'contact',
    path: '/contact',
    pageTitle: 'Contact Us',
    metaTitle: 'Contact Us | ACR & Company Chartered Accountants',
    metaDescription:
      'Contact ACR & Company, Chartered Accountants in Calicut, Kerala. Send us a message, call +91 94471 57549 or visit our office at Chalappuram.',
    showCta: false,
    priority: 0.8,
  },
];
