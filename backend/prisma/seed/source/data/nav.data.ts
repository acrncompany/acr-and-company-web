import { NavConfig, NavLink, ServiceCategory } from '../models/site';

/** Service pages do not exist yet, so every item points at /services for now. */
const SERVICES_PATH = '/services';

function category(title: string, items: string[]): ServiceCategory {
  return {
    title,
    path: SERVICES_PATH,
    items: items.map((label): NavLink => ({ label, path: SERVICES_PATH })),
  };
}

export const NAV_DATA: NavConfig = {
  items: [
    { label: 'Home', path: '/', exact: true },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services', megaMenu: true },
    { label: 'Learning Centre', path: '/learning' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact Us', path: '/contact' },
  ],
  cta: { label: 'Book Consultation', path: '/contact' },
  serviceCategories: [
    category('Audit & Assurance', [
      'Statutory Audit',
      'Internal Audit',
      'Tax Audit',
      'Stock Audit',
      'Concurrent Audit',
      'Bank Audit',
      'Revenue Audit',
      'Management Audit',
      'Due Diligence',
    ]),
    category('Taxation', [
      'Income Tax Returns (Individuals)',
      'Income Tax Returns (Business)',
      'TDS Filing & Compliance',
      'GST Returns & Filing',
      'GST Audit',
      'International Taxation',
      'Transfer Pricing',
      'Tax Planning & Advisory',
      'Tax Notices & Litigation',
    ]),
    category('Accounting & Payroll', [
      'Bookkeeping Services',
      'Outsourced Accounting',
      'Payroll Processing',
      'MIS Reporting',
      'Financial Statement Preparation',
      'Virtual CFO Services',
    ]),
    category('Registrations', [
      'Company Incorporation (Pvt Ltd)',
      'LLP Registration',
      'One Person Company',
      'Public Limited Company',
      'Partnership Firm',
      'Proprietorship',
      'GST Registration',
      'GST for Foreigners',
      'TAN Registration',
      'PF Registration',
      'Professional Tax Registration',
      'FSSAI Registration',
      'Import-Export Code',
      'Trade License',
      'MSME/Udyam Registration',
      'Startup India Registration',
      '12A & 80G Registration (NGO)',
      'FCRA Registration',
    ]),
    category('Consulting & Advisory', [
      'Business Setup Advisory',
      'Project Financing',
      'Bank Loan Assistance',
      'Financial Due Diligence',
      'Business Valuation',
      'FEMA & RBI Compliance',
      'Company Law Advisory',
      'Mergers & Acquisitions',
    ]),
    category('IP & Others', [
      'Trademark Registration',
      'Copyright Registration',
      'Patent Filing',
      'ISO Certification',
      'ROC Filings & Compliance',
      'Labour Law Compliance',
      'RERA Advisory',
    ]),
  ],
};
