import { HomePageContent } from '../models/home';

export const HOME_DATA: HomePageContent = {
  hero: {
    eyebrow: 'Established 2004',
    title: 'Expert Finance Solutions for',
    highlight: 'Businesses',
    subtitle:
      'Professional accounting, tax advisory, and CFO services combining regulatory expertise with intelligent automation.',
    primaryCta: { label: 'Explore Services', path: '/services' },
    secondaryCta: { label: 'Book a Consultation', path: '/contact' },
    stats: [
      { value: '20+', label: 'Years of Excellence' },
      { value: '2,000+', label: 'Clients Served' },
      { value: '500+', label: 'Registrations' },
    ],
    background: { src: '/assets/images/hero-bg.jpg', alt: '' },
  },

  coreServices: {
    heading: {
      eyebrow: 'What We Do',
      title: 'Our Core Services',
      subtitle:
        'From startup registration to enterprise-level audits — we deliver end-to-end financial solutions tailored to your business stage.',
    },
    items: [
      {
        icon: 'shield',
        title: 'Audit & Assurance',
        description: 'Statutory, internal & bank audits with thorough due diligence',
        path: '/services',
      },
      {
        icon: 'file-text',
        title: 'Taxation',
        description: 'Income tax, GST, international tax planning & litigation',
        path: '/services',
      },
      {
        icon: 'calculator',
        title: 'Accounting & Payroll',
        description: 'Bookkeeping, payroll, MIS reporting & virtual CFO',
        path: '/services',
      },
      {
        icon: 'building',
        title: 'Registrations',
        description: 'Company incorporation, GST, FSSAI, MSME & more',
        path: '/services',
      },
      {
        icon: 'briefcase',
        title: 'Consulting & Advisory',
        description: 'Business setup, project finance, M&A advisory',
        path: '/services',
      },
      {
        icon: 'award',
        title: 'IP & Others',
        description: 'Trademarks, patents, ISO certification & compliance',
        path: '/services',
      },
    ],
  },

  whyChoose: {
    heading: {
      eyebrow: 'Why ACR',
      title: 'Why Choose ACR & Company',
      subtitle:
        'We combine deep regulatory knowledge with modern technology to deliver financial clarity and peace of mind.',
    },
    image: {
      src: '/assets/images/why-choose.jpg',
      alt: 'Laptop with financial charts, a calculator and reports on a desk',
    },
    features: [
      {
        icon: 'clock',
        title: '20+ Years of Expertise',
        description:
          'Two decades of delivering trusted financial services across diverse industries.',
      },
      {
        icon: 'users',
        title: 'Multi-Professional Team',
        description:
          'CAs, lawyers, and business consultants working together for holistic solutions.',
      },
      {
        icon: 'globe',
        title: 'Pan-India & ME Network',
        description: 'Offices and partners across India and the Middle East for seamless service.',
      },
      {
        icon: 'cpu',
        title: 'Cutting-Edge Technology',
        description:
          'Modern tools and cloud platforms for efficient, real-time financial management.',
      },
      {
        icon: 'layers',
        title: 'End-to-End Solutions',
        description: 'From incorporation to IPO — we cover every stage of your business lifecycle.',
      },
      {
        icon: 'headphones',
        title: 'Dedicated Client Support',
        description: 'A named point of contact for every client, ensuring personalized attention.',
      },
    ],
  },

  approach: {
    heading: {
      eyebrow: 'Our Approach',
      title: 'How We Work With You',
      subtitle:
        'Every engagement follows a structured methodology designed to deliver measurable outcomes and lasting partnerships.',
    },
    image: {
      src: '/assets/images/approach.jpg',
      alt: 'A team meeting around a conference table with city skyline views',
    },
    steps: [
      {
        icon: 'target',
        title: 'Understand Your Goals',
        description:
          'We begin with a deep-dive consultation to understand your business, challenges, and growth ambitions.',
      },
      {
        icon: 'shield-check',
        title: 'Build Compliance & Confidence',
        description:
          'Our experts structure your finances for full regulatory compliance while minimising tax liabilities.',
      },
      {
        icon: 'trending-up',
        title: 'Drive Sustainable Growth',
        description:
          'With clear reporting and strategic advisory, we help you scale with clarity and confidence.',
      },
    ],
  },

  industries: {
    heading: {
      eyebrow: 'Industries',
      title: 'Industries We Serve',
      subtitle:
        'Trusted by businesses across sectors — from early-stage startups to established enterprises.',
    },
    items: [
      { icon: 'factory', label: 'Manufacturing', tone: 'blue' },
      { icon: 'building-2', label: 'Real Estate', tone: 'amber' },
      { icon: 'shopping-bag', label: 'FMCG', tone: 'green' },
      { icon: 'monitor', label: 'IT & Software', tone: 'violet' },
      { icon: 'heart', label: 'Healthcare', tone: 'rose' },
      { icon: 'rocket', label: 'Startups', tone: 'orange' },
      { icon: 'handshake', label: 'NGOs', tone: 'teal' },
      { icon: 'landmark', label: 'Government', tone: 'slate' },
    ],
  },

  // Article images are stand-ins (only three photos exist in the reference assets); swap the paths when real images arrive.
  insights: {
    heading: { eyebrow: 'Insights & Updates', title: 'Latest from Our Experts' },
    viewAll: { label: 'View All Articles', path: '/learning' },
    featured: {
      slug: 'gst-compliance-2026-key-changes',
      category: 'GST Updates',
      title: 'GST Compliance 2026: Key Changes Every Business Must Know',
      excerpt:
        "The GST Council has introduced sweeping reforms for FY 2025-26. From revised e-invoicing thresholds to new HSN code requirements, here's what your business needs to prepare for.",
      image: {
        src: '/assets/images/why-choose.jpg',
        alt: 'Tax documents, a calculator and cash on a desk',
      },
      path: '/learning/gst-compliance-2026-key-changes',
    },
    articles: [
      {
        slug: 'union-budget-2026-27-msmes-startups',
        category: 'Budget Analysis',
        title: 'Union Budget 2026-27: Impact on MSMEs and Startups',
        excerpt:
          "The Finance Minister's latest budget brings significant tax relief for startups and MSMEs. A detailed analysis of provisions that could reshape India's entrepreneurial ecosystem.",
        image: { src: '/assets/images/hero-bg.jpg', alt: 'City financial district' },
        publishedAt: '2026-02-10',
        readMinutes: 7,
        path: '/learning/union-budget-2026-27-msmes-startups',
      },
      {
        slug: 'statutory-audit-checklist-2026',
        category: 'Audit & Compliance',
        title: 'Statutory Audit Checklist 2026: Preparing Your Books Right',
        excerpt:
          'With audit season approaching, companies must ensure their financial records are in order. This comprehensive checklist covers everything from documentation to digital compliance.',
        image: { src: '/assets/images/approach.jpg', alt: 'Team reviewing financial reports' },
        publishedAt: '2026-02-05',
        readMinutes: 8,
        path: '/learning/statutory-audit-checklist-2026',
      },
      {
        slug: 'msme-registration-benefits-guide-2026',
        category: 'Business Advisory',
        title: 'MSME Registration and Benefits: A Complete 2026 Guide',
        image: {
          src: '/assets/images/approach.jpg',
          alt: 'Colleagues working together in an office',
        },
        path: '/learning/msme-registration-benefits-guide-2026',
      },
    ],
  },

  faq: {
    heading: {
      eyebrow: 'FAQ',
      title: 'Frequently Asked Questions',
      subtitle:
        'Answers to the questions our clients ask most — before we even begin working together.',
    },
    aside: {
      icon: 'help-circle',
      title: 'Still have questions?',
      text: "We're happy to walk you through your specific situation. Reach out and a member of our team will get back to you within one business day.",
    },
    items: [
      {
        question: 'What services does ACR & Company offer?',
        answer:
          'We provide end-to-end financial solutions including statutory and internal audit, income tax and GST advisory, bookkeeping and payroll, company and GST registration, business setup and project finance, and intellectual property services such as trademarks and ISO certification.',
      },
      {
        question: 'Can you work with businesses outside Calicut?',
        answer:
          'Yes. While headquartered in Calicut, Kerala, we serve clients across India and the Middle East. Our pan-India network and digital collaboration tools allow us to manage engagements seamlessly regardless of location.',
      },
      {
        question: 'How do you price your services?',
        answer:
          'Our engagements are tailored to your business stage and needs. After an initial consultation we provide a transparent, fixed-fee proposal with no hidden charges. Most compliance and accounting services are offered on a predictable monthly retainer.',
      },
      {
        question: 'How quickly can you get my business registered?',
        answer:
          'Company incorporation typically takes 7–15 working days once documents are submitted, subject to MCA processing times. GST and other statutory registrations are usually completed within 3–7 working days.',
      },
      {
        question: 'Do you offer ongoing accounting and CFO support?',
        answer:
          'Absolutely. We provide monthly bookkeeping, MIS reporting, payroll, and virtual CFO services designed to give you real-time financial visibility and strategic guidance as you scale.',
      },
      {
        question: 'How do I get started?',
        answer:
          "Book a free consultation through the form on this page or contact us directly. We'll understand your requirements and recommend the right engagement — no obligation.",
      },
    ],
  },
};
