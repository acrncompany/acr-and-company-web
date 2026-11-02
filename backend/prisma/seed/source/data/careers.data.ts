import { CareersPageContent } from '../models/careers';

// Read off the live site's screenshots. Three details were not visible there and are placeholders to confirm:
// the "Articleship/Internship" opening's department, location and posted date.
export const CAREERS_DATA: CareersPageContent = {
  hero: {
    eyebrow: 'Careers',
    title: 'Build Your Career with ACR',
    subtitle: 'Join a team of dedicated professionals committed to excellence in financial services.',
  },
  perksTitle: 'Why Work With Us',
  perks: [
    {
      icon: 'graduation-cap',
      title: 'Learning Culture',
      text: 'Continuous professional development and ICAI-approved training programs.',
    },
    {
      icon: 'users',
      title: 'Expert Mentors',
      text: 'Work alongside industry veterans with decades of experience.',
    },
    {
      icon: 'briefcase',
      title: 'Growth Path',
      text: 'Clear career progression from associate to partner track.',
    },
    {
      icon: 'monitor',
      title: 'Modern Workplace',
      text: 'Cutting-edge tools, flexible arrangements, and a collaborative environment.',
    },
  ],
  openingsTitle: 'Open Positions',
  allLabel: 'All',
  applyLabel: 'Apply Now',
  applyEmail: 'job4acr@gmail.com',
  departments: [
    'Audit & Accounts, Corporate Consulting & Taxation',
    'Business Development',
    'Accounts, Audit & Consulting',
    'Finance & Accounts',
    'Accounting',
    'Audit',
  ],
  openings: [
    {
      id: 'ca-articleship-limited-vacancies',
      title: 'CA Articleship Limited Vacancies',
      description: 'Please reach directly @ Phone: 9447157549 email: job4acr@gmail.com',
      location: 'Calicut, Cochin & Bangalore',
      type: 'Full-Time',
      department: 'Audit & Accounts, Corporate Consulting & Taxation',
      postedAt: '2026-04-05',
    },
    {
      id: 'digital-social-media-expert',
      title: 'Digital & Social Media Expert',
      description:
        'Digital, Web and Social Media Marketing Expert who can independently comprehend the requirements of the organization and to assist the organization in business development and to be a faculty in its academic division. Content creation and writing skills also essential.',
      location: 'Calicut, Cochin, Bangalore',
      type: 'Full-time',
      department: 'Business Development',
      postedAt: '2026-04-05',
    },
    {
      id: 'ca-cs-cma-articleship-internship',
      title: 'CA, CS,CMA Articleship/ Internship',
      description:
        'We are an audit firm having versatile expertise in Accounting, Audit, Finance, Taxation and Corporate Consulting and Practices and looking for brilliant, young and energetic candidates for Articleship or Internship. Higher stipend and other benefits including food and accommodation shall be provided to performing candidates. Please reach out to us immediately at Phone: 9447157549 or E-mail: job4acr@gmail.com for the limited positions available now. We will reserve the vacancies after the interview for eligible candidates for their convenient time for joining.',
      location: 'Calicut, Cochin, Bangalore',
      type: 'Full-time',
      department: 'Accounts, Audit & Consulting',
      postedAt: '2026-04-05',
    },
    {
      id: 'managers-accountants-team-leaders',
      title: 'Managers, Senior & Junior Accountants and Team Leaders',
      description:
        'To handle Accounts, Finance, Taxation, Regulatory compliance etc and assist in other corporate practices.',
      location: 'Calicut, Cochin, Bangalore',
      type: 'Full-time',
      department: 'Finance & Accounts',
      postedAt: '2026-02-01',
    },
    {
      id: 'accounts-executive',
      title: 'Accounts Executive',
      description:
        'Manage bookkeeping, ledger maintenance, and financial statement preparation for clients in the UAE. Familiarity with VAT compliance preferred.',
      location: 'Calicut, Cochin, Bangalore',
      type: 'Full-time',
      department: 'Accounting',
      postedAt: '2026-01-28',
    },
    {
      id: 'ca-cs-cma-final-qualified-llb-mba',
      title: 'CA, CS, CMA Final or Qualified, LLB and MBAs for Key Positions',
      description: 'for Key Technical, Departmental and Management Positions or for Freelance/Advisory Positions',
      location: 'Calicut, Cochin, Bangalore',
      type: 'Full-Time and Part-Time',
      department: 'Audit',
      postedAt: '2026-01-15',
    },
  ],
  contact: {
    title: 'Get In Touch',
    text: "Can't find the right role? Send your CV and we'll keep you in mind for future openings.",
    emails: ['job4acr@gmail.com', 'acrandcompany@gmail.com'],
    phone: '+91 94471 57549',
    phoneRaw: '919447157549',
  },
};
