import { ServicesPageContent } from '../models/services';

/** Every "Get Started" link goes to the contact page until per-service pages exist. */
const P = '/contact';

export const SERVICES_DATA: ServicesPageContent = {
  hero: {
    eyebrow: 'Services',
    title: 'What We Offer',
    subtitle: 'Comprehensive financial, legal, and business services tailored to your needs.',
  },

  allLabel: 'All Services',

  groups: [
    {
      title: 'Audit & Assurance',
      icon: 'shield',
      items: [
        {
          title: 'Statutory Audit',
          description:
            'Comprehensive statutory audit services ensuring compliance with applicable laws and regulations.',
          path: P,
        },
        {
          title: 'Internal Audit',
          description: 'Systematic evaluation of internal controls and risk management processes.',
          path: P,
        },
        {
          title: 'Tax Audit',
          description: 'Expert tax audit services under Section 44AB of the Income Tax Act.',
          path: P,
        },
        {
          title: 'Stock Audit',
          description:
            'Thorough verification of inventory and stock records for financial accuracy.',
          path: P,
        },
        {
          title: 'Concurrent Audit',
          description: 'Real-time audit of banking transactions to ensure ongoing compliance.',
          path: P,
        },
        {
          title: 'Bank Audit',
          description: 'Specialized audit services for banking and financial institutions.',
          path: P,
        },
        {
          title: 'Revenue Audit',
          description: 'Assessment of revenue recognition practices and controls.',
          path: P,
        },
        {
          title: 'Management Audit',
          description: 'Evaluation of management effectiveness and organizational performance.',
          path: P,
        },
        {
          title: 'Due Diligence',
          description:
            'Comprehensive due diligence reviews for mergers, acquisitions, and investments.',
          path: P,
        },
      ],
    },
    {
      title: 'Taxation',
      icon: 'file-text',
      items: [
        {
          title: 'Income Tax Returns (Individuals)',
          description:
            'Professional ITR filing services for salaried and non-salaried individuals.',
          path: P,
        },
        {
          title: 'Income Tax Returns (Business)',
          description: 'Expert business tax return preparation and filing services.',
          path: P,
        },
        {
          title: 'TDS Filing & Compliance',
          description: 'End-to-end TDS deduction, filing, and compliance management.',
          path: P,
        },
        {
          title: 'GST Returns & Filing',
          description: 'Complete GST return filing including GSTR-1, GSTR-3B, and annual returns.',
          path: P,
        },
        {
          title: 'GST Audit',
          description: 'Thorough GST audit services ensuring compliance with GST regulations.',
          path: P,
        },
        {
          title: 'International Taxation',
          description: 'Cross-border tax planning and compliance for international businesses.',
          path: P,
        },
        {
          title: 'Transfer Pricing',
          description: 'Transfer pricing documentation, analysis, and compliance services.',
          path: P,
        },
        {
          title: 'Tax Planning & Advisory',
          description: 'Strategic tax planning to optimize your tax liability legally.',
          path: P,
        },
        {
          title: 'Tax Notices & Litigation',
          description: 'Expert representation in tax disputes and litigation matters.',
          path: P,
        },
      ],
    },
    {
      title: 'Accounting & Payroll',
      icon: 'calculator',
      items: [
        {
          title: 'Bookkeeping Services',
          description: 'Accurate and timely bookkeeping to keep your financials in order.',
          path: P,
        },
        {
          title: 'Outsourced Accounting',
          description: 'Complete accounting function outsourcing for growing businesses.',
          path: P,
        },
        {
          title: 'Payroll Processing',
          description: 'End-to-end payroll management including compliance and reporting.',
          path: P,
        },
        {
          title: 'MIS Reporting',
          description: 'Custom management information system reports for better decision-making.',
          path: P,
        },
        {
          title: 'Financial Statement Preparation',
          description: 'Professional preparation of balance sheets, P&L, and cash flow statements.',
          path: P,
        },
        {
          title: 'Virtual CFO Services',
          description: 'Strategic financial leadership without the cost of a full-time CFO.',
          path: P,
        },
      ],
    },
    {
      title: 'Registrations',
      icon: 'building',
      items: [
        {
          title: 'Company Incorporation (Pvt Ltd)',
          description: 'End-to-end private limited company registration with MCA.',
          path: P,
        },
        {
          title: 'LLP Registration',
          description: 'Quick and compliant Limited Liability Partnership registration.',
          path: P,
        },
        {
          title: 'One Person Company',
          description: 'Register your One Person Company with complete compliance.',
          path: P,
        },
        {
          title: 'Public Limited Company',
          description: 'Full support for public limited company incorporation.',
          path: P,
        },
        {
          title: 'Partnership Firm',
          description: 'Partnership firm registration and deed preparation services.',
          path: P,
        },
        {
          title: 'Proprietorship',
          description: 'Simple and quick proprietorship setup and registration.',
          path: P,
        },
        {
          title: 'GST Registration',
          description: 'Hassle-free GST registration for businesses of all sizes.',
          path: P,
        },
        {
          title: 'GST for Foreigners',
          description: 'GST registration and compliance services for foreign businesses in India.',
          path: P,
        },
        {
          title: 'TAN Registration',
          description: 'Quick TAN registration for tax deduction purposes.',
          path: P,
        },
        {
          title: 'PF Registration',
          description: 'Employee Provident Fund registration and compliance.',
          path: P,
        },
        {
          title: 'Professional Tax Registration',
          description: 'State-wise professional tax registration services.',
          path: P,
        },
        {
          title: 'FSSAI Registration',
          description: 'Food safety license and registration with FSSAI.',
          path: P,
        },
        {
          title: 'Import-Export Code',
          description: 'IEC registration for businesses involved in international trade.',
          path: P,
        },
        {
          title: 'Trade License',
          description: 'Municipal trade license procurement for your business.',
          path: P,
        },
        {
          title: 'MSME/Udyam Registration',
          description: 'MSME/Udyam registration to unlock government benefits.',
          path: P,
        },
        {
          title: 'Startup India Registration',
          description: 'DPIIT recognition and Startup India registration.',
          path: P,
        },
        {
          title: '12A & 80G Registration (NGO)',
          description: 'Tax exemption registration for trusts and NGOs.',
          path: P,
        },
        {
          title: 'FCRA Registration',
          description: 'Foreign Contribution Regulation Act registration for NGOs.',
          path: P,
        },
      ],
    },
    {
      title: 'Consulting & Advisory',
      icon: 'briefcase',
      items: [
        {
          title: 'Business Setup Advisory',
          description: 'Expert guidance on setting up your business in India or the Middle East.',
          path: P,
        },
        {
          title: 'Project Financing',
          description: 'Assistance in securing project finance from banks and institutions.',
          path: P,
        },
        {
          title: 'Bank Loan Assistance',
          description: 'End-to-end support for bank loan applications and approvals.',
          path: P,
        },
        {
          title: 'Financial Due Diligence',
          description: 'In-depth financial analysis for investment decisions.',
          path: P,
        },
        {
          title: 'Business Valuation',
          description: 'Accurate business valuation for M&A, fundraising, and compliance.',
          path: P,
        },
        {
          title: 'FEMA & RBI Compliance',
          description: 'Expert guidance on foreign exchange regulations and RBI compliance.',
          path: P,
        },
        {
          title: 'Company Law Advisory',
          description: 'Comprehensive advisory on Companies Act and corporate governance.',
          path: P,
        },
        {
          title: 'Mergers & Acquisitions',
          description: 'Strategic M&A advisory including due diligence and structuring.',
          path: P,
        },
      ],
    },
    {
      title: 'IP & Others',
      icon: 'award',
      items: [
        {
          title: 'Trademark Registration',
          description: 'Protect your brand with comprehensive trademark registration.',
          path: P,
        },
        {
          title: 'Copyright Registration',
          description: 'Secure your creative works with copyright registration.',
          path: P,
        },
        {
          title: 'Patent Filing',
          description: 'Professional patent filing and prosecution services.',
          path: P,
        },
        {
          title: 'ISO Certification',
          description: 'ISO certification consulting for quality management systems.',
          path: P,
        },
        {
          title: 'ROC Filings & Compliance',
          description: 'Annual ROC filing and corporate compliance management.',
          path: P,
        },
        {
          title: 'Labour Law Compliance',
          description: 'Complete labour law compliance and advisory services.',
          path: P,
        },
        {
          title: 'RERA Advisory',
          description: 'RERA registration and compliance for real estate developers.',
          path: P,
        },
      ],
    },
  ],

  cta: {
    title: "Can't find what you need?",
    text: "Our team can help with custom requirements. Let's discuss your needs.",
    buttonLabel: 'Book a Consultation',
    path: '/contact',
  },
};
