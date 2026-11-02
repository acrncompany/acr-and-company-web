import { LearningPageContent } from '../models/learning';

// The GST article is the live site's text. The other five follow the same shape (intro, headed sections, action
// items, closing line) and need a CA review before going live. Article images are stand-ins (only three photos
// exist in the reference assets); swap the paths when real images arrive.
export const LEARNING_DATA: LearningPageContent = {
  hero: {
    eyebrow: 'Insights',
    title: 'Learning Centre',
    subtitle: 'Expert insights, regulatory updates, and practical guides for businesses and professionals.',
  },
  allLabel: 'All',
  categories: ['GST Updates', 'Budget Analysis', 'Audit & Compliance', 'Business Advisory', 'Tax Updates'],
  readLabel: 'Read',
  backToCentreLabel: 'Back to Learning Centre',
  backToArticlesLabel: 'Back to all articles',
  articles: [
    {
      slug: 'gst-compliance-2026-key-changes',
      category: 'GST Updates',
      title: 'GST Compliance 2026: Key Changes Every Business Must Know',
      excerpt:
        "The GST Council has introduced sweeping reforms for FY 2025-26. From revised e-invoicing thresholds to new HSN code requirements, here's what your business needs to prepare for.",
      image: { src: '/assets/images/why-choose.jpg', alt: 'Tax documents, a calculator and cash on a desk' },
      publishedAt: '2026-02-15',
      readMinutes: 6,
      body: [
        {
          type: 'paragraph',
          text: 'The Goods and Services Tax (GST) landscape in India continues to evolve rapidly. As we enter FY 2025-26, several critical changes demand immediate attention from businesses of all sizes.',
        },
        { type: 'heading', text: 'E-Invoicing Threshold Reduced' },
        {
          type: 'paragraph',
          text: 'The government has lowered the e-invoicing threshold to ₹5 crore turnover, bringing thousands of additional businesses under the mandate. Companies must ensure their billing systems are compliant before the deadline.',
        },
        { type: 'heading', text: 'New HSN Code Requirements' },
        {
          type: 'paragraph',
          text: 'Starting April 2026, all businesses with turnover above ₹5 crore must report 6-digit HSN codes on invoices. Smaller businesses need 4-digit codes. Non-compliance attracts penalties up to ₹50,000.',
        },
        { type: 'heading', text: 'Input Tax Credit (ITC) Reconciliation' },
        {
          type: 'paragraph',
          text: 'The automated ITC matching system has been tightened. Businesses must reconcile their GSTR-2B with purchase registers monthly to avoid credit reversals. The tolerance limit for mismatches has been reduced to 5%.',
        },
        { type: 'heading', text: 'Quarterly Return Monthly Payment (QRMP)' },
        {
          type: 'paragraph',
          text: 'Small taxpayers with turnover up to ₹5 crore can continue using the QRMP scheme, but must now file monthly returns if their inter-state supplies exceed ₹1 crore.',
        },
        { type: 'heading', text: 'Action Items for Businesses:' },
        {
          type: 'list',
          items: [
            'Update ERP/billing software for new HSN code requirements',
            'Register for e-invoicing if turnover exceeds ₹5 crore',
            'Implement monthly ITC reconciliation processes',
            'Review QRMP eligibility criteria',
          ],
        },
        {
          type: 'paragraph',
          text: 'Our team at ACR & Company can help you navigate these changes seamlessly. Contact us for a compliance health check.',
        },
      ],
    },
    {
      slug: 'union-budget-2026-27-msmes-startups',
      category: 'Budget Analysis',
      title: 'Union Budget 2026-27: Impact on MSMEs and Startups',
      excerpt:
        "The Finance Minister's latest budget brings significant tax relief for startups and MSMEs. A detailed analysis of provisions that could reshape India's entrepreneurial ecosystem.",
      image: { src: '/assets/images/hero-bg.jpg', alt: 'City financial district' },
      publishedAt: '2026-02-10',
      readMinutes: 7,
      body: [
        {
          type: 'paragraph',
          text: 'Every Union Budget changes the cost of doing business, and for MSMEs and startups the details matter more than the headlines. Here is how we read the 2026-27 provisions, and what owners and finance teams should act on first.',
        },
        { type: 'heading', text: 'Tax Relief and Cash Flow' },
        {
          type: 'paragraph',
          text: "Smaller businesses feel tax changes through cash flow before they feel them through profit. Revised slab rates, presumptive taxation limits and the timing of deductions all affect how much working capital stays in the business. Review your advance tax plan for the year against the new provisions rather than last year's numbers.",
        },
        { type: 'heading', text: 'Access to Credit' },
        {
          type: 'paragraph',
          text: "Credit guarantee support and cheaper formal credit remain the budget's main levers for small enterprises. A business with clean books, filed returns and a registered Udyam profile is in a far better position to use these schemes than one that has to prepare its paperwork at the time of applying.",
        },
        { type: 'heading', text: 'Startup Incentives' },
        {
          type: 'paragraph',
          text: 'Startups should confirm that their DPIIT recognition is current and that they still meet the eligibility conditions for the tax and compliance benefits they claim. Conditions on turnover, age of the company and nature of the business are tested every year, not once.',
        },
        { type: 'heading', text: 'Compliance Simplification' },
        {
          type: 'paragraph',
          text: 'Lighter compliance only helps if your systems are ready to use it. Check which filings, thresholds and due dates have moved, and update your compliance calendar before the new rules take effect.',
        },
        { type: 'heading', text: 'What to Do Now:' },
        {
          type: 'list',
          items: [
            'Re-run your tax and advance tax projections under the new provisions',
            'Confirm Udyam and DPIIT registrations are valid and up to date',
            'Prepare a credit-ready set of financials and returns',
            'Update your compliance calendar for changed due dates and thresholds',
          ],
        },
        {
          type: 'paragraph',
          text: "ACR & Company can model the Budget's impact on your business and plan the next twelve months with you. Get in touch to book a consultation.",
        },
      ],
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
      body: [
        {
          type: 'paragraph',
          text: 'A smooth audit is decided long before the auditors arrive. Companies that close their books cleanly, reconcile every control account and keep supporting documents ready finish faster, pay less in audit time and face fewer qualifications in the report.',
        },
        { type: 'heading', text: 'Books of Account and Reconciliations' },
        {
          type: 'list',
          items: [
            'Bank reconciliation statements for every account, with old unreconciled items explained',
            'Debtor and creditor balance confirmations, and ageing schedules',
            'Reconciliation of GST returns, TDS returns and Form 26AS with the books',
            'Cash, stock and fixed asset verification, with the fixed asset register updated',
          ],
        },
        { type: 'heading', text: 'Statutory Records and Governance' },
        {
          type: 'list',
          items: [
            'Board and shareholder minutes, and statutory registers kept up to date',
            'Related party transactions identified, approved and disclosed',
            'Loans, guarantees and investments checked against Companies Act limits',
            'Director KYC and annual filings with the Registrar of Companies on time',
          ],
        },
        { type: 'heading', text: 'Digital Compliance' },
        {
          type: 'paragraph',
          text: 'Companies using accounting software must use a system with an audit trail (edit log) that cannot be switched off, and the auditor reports on it. Confirm with your software vendor that the feature is active for the whole year, and keep backups of the records.',
        },
        { type: 'heading', text: 'Tax Audit Readiness' },
        {
          type: 'paragraph',
          text: 'If your turnover crosses the limits under Section 44AB of the Income Tax Act, a tax audit is also due. Clause-wise data for Form 3CD, such as payments to related parties, loans taken in cash and TDS defaults, is easier to collect through the year than at the deadline.',
        },
        { type: 'heading', text: 'Action Items for Businesses:' },
        {
          type: 'list',
          items: [
            'Close the books and finalise provisions at least two weeks before audit starts',
            'Share a document request list with your accounts team early',
            'Resolve open reconciliation differences and old balances',
            'Confirm the audit trail feature is enabled in your accounting software',
          ],
        },
        {
          type: 'paragraph',
          text: 'ACR & Company provides statutory audit, tax audit and pre-audit health checks. Contact us to get your books audit-ready.',
        },
      ],
    },
    {
      slug: 'msme-registration-benefits-guide-2026',
      category: 'Business Advisory',
      title: 'MSME Registration and Benefits: A Complete 2026 Guide',
      excerpt:
        'Udyam registration has been simplified further. Learn about the new classification criteria, exclusive government schemes, and how to leverage MSME status for maximum advantage.',
      image: { src: '/assets/images/approach.jpg', alt: 'Colleagues working together in an office' },
      publishedAt: '2026-01-28',
      readMinutes: 5,
      body: [
        {
          type: 'paragraph',
          text: 'Udyam registration is free, online and linked to your PAN and Aadhaar. Once registered, a business is recognised as an MSME and can use a range of benefits that are not available to other businesses.',
        },
        { type: 'heading', text: 'Classification Criteria' },
        {
          type: 'paragraph',
          text: 'Classification depends on both investment in plant and machinery or equipment and annual turnover. Under the revised limits, a micro enterprise has investment up to ₹2.5 crore and turnover up to ₹10 crore, a small enterprise up to ₹25 crore and ₹100 crore, and a medium enterprise up to ₹125 crore and ₹500 crore.',
        },
        { type: 'heading', text: 'Key Benefits' },
        {
          type: 'list',
          items: [
            'Collateral-free loans under the Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
            'Priority sector lending and, often, lower interest rates from banks',
            'Protection on delayed payments: buyers must pay MSME suppliers within 45 days',
            'Preference in government tenders and exemption from some earnest money requirements',
            'Subsidies on patent and trademark registration and on quality certifications',
          ],
        },
        { type: 'heading', text: 'The 45-Day Payment Rule' },
        {
          type: 'paragraph',
          text: 'Under Section 43B(h) of the Income Tax Act, amounts owed to micro and small suppliers that remain unpaid beyond the agreed period (45 days at most) are allowed as a deduction only when paid. Buyers should check the Udyam status of their suppliers, and MSME suppliers should share their registration with customers.',
        },
        { type: 'heading', text: 'Action Items for Businesses:' },
        {
          type: 'list',
          items: [
            'Register on the Udyam portal and keep the certificate and updated details on file',
            'Update your Udyam details when turnover or investment changes',
            'Check your supplier list for MSMEs and pay them within the permitted period',
            'Ask your bank about CGTMSE-backed loans before offering collateral',
          ],
        },
        {
          type: 'paragraph',
          text: 'ACR & Company can handle your Udyam registration and help you plan the right use of MSME benefits. Contact us to get started.',
        },
      ],
    },
    {
      slug: 'digital-taxation-india-new-landscape',
      category: 'Tax Updates',
      title: 'Digital Taxation in India: Navigating the New Landscape',
      excerpt:
        "From cryptocurrency reporting to e-commerce TDS provisions, India's digital tax framework is maturing. Understanding these rules is crucial for modern businesses operating online.",
      image: { src: '/assets/images/hero-bg.jpg', alt: 'Aerial view of a modern city skyline' },
      publishedAt: '2026-01-20',
      readMinutes: 6,
      body: [
        {
          type: 'paragraph',
          text: 'India now taxes and tracks digital activity much like any other income. Businesses that sell online, accept digital payments or hold digital assets need to know which rules apply to them and what must be reported.',
        },
        { type: 'heading', text: 'Virtual Digital Assets' },
        {
          type: 'paragraph',
          text: 'Gains from the transfer of virtual digital assets, including cryptocurrency and NFTs, are taxed at a flat 30% under Section 115BBH. No deduction is allowed other than the cost of acquisition, and losses cannot be set off against other income. A 1% TDS under Section 194S applies on transfers above the prescribed limits.',
        },
        { type: 'heading', text: 'E-Commerce and Platform Sellers' },
        {
          type: 'paragraph',
          text: 'Sellers on online marketplaces face tax deducted or collected at source on their sales, under both income tax and GST. These amounts show up in your tax statements and GST returns, and must be matched with your books so that you can claim credit for them.',
        },
        { type: 'heading', text: 'GST on Online Services' },
        {
          type: 'paragraph',
          text: 'Foreign suppliers of online information and database access services (OIDAR) to Indian customers must register and pay GST in India. Indian businesses buying digital services from abroad should check whether reverse charge applies to them.',
        },
        { type: 'heading', text: 'Reporting and Data Matching' },
        {
          type: 'paragraph',
          text: 'The Income Tax Department receives information from exchanges, banks and platforms and shows it in the Annual Information Statement (AIS). Income that appears there but not in your return is likely to attract a notice.',
        },
        { type: 'heading', text: 'Action Items for Businesses:' },
        {
          type: 'list',
          items: [
            'Keep transaction-wise records of all digital asset purchases and sales',
            'Check your AIS and 26AS regularly and correct any mismatch',
            'Reconcile marketplace TDS and TCS credits with your books each quarter',
            'Review GST registration and reverse charge for cross-border digital services',
          ],
        },
        {
          type: 'paragraph',
          text: 'Our tax team at ACR & Company can review your online business for digital tax exposure. Contact us to discuss your situation.',
        },
      ],
    },
    {
      slug: 'itr-filing-2026-forms-deadlines-mistakes',
      category: 'Tax Updates',
      title: 'ITR Filing 2026: New Forms, Deadlines, and Common Mistakes',
      excerpt:
        'The Income Tax Department has revamped ITR forms for AY 2026-27. Know which form applies to you, the key deadlines, and the most common mistakes that trigger scrutiny notices.',
      image: { src: '/assets/images/why-choose.jpg', alt: 'Income tax return forms and a pen on a desk' },
      publishedAt: '2026-01-12',
      readMinutes: 7,
      body: [
        {
          type: 'paragraph',
          text: 'Filing the right form on time is the first step to a clean return. Each year the forms change a little, so check the version for AY 2026-27 before you start.',
        },
        { type: 'heading', text: 'Which Form Applies to You' },
        {
          type: 'list',
          items: [
            'ITR-1 (Sahaj): resident individuals with income up to ₹50 lakh from salary, one house property and other sources',
            'ITR-2: individuals and HUFs with capital gains, more than one house property, or foreign assets',
            'ITR-3: individuals and HUFs with income from business or profession',
            'ITR-4 (Sugam): residents opting for presumptive taxation under Sections 44AD, 44ADA or 44AE',
          ],
        },
        { type: 'heading', text: 'Key Deadlines' },
        {
          type: 'paragraph',
          text: 'The due date is 31 July for individuals and others who are not required to get their accounts audited, and 31 October for those who are. A belated or revised return can be filed later, but with a late fee and interest, and some losses cannot be carried forward. Always check the official due date for the year, as it is sometimes extended.',
        },
        { type: 'heading', text: 'Common Mistakes That Trigger Notices' },
        {
          type: 'list',
          items: [
            'Income in AIS or Form 26AS that is missing from the return',
            'Choosing the wrong ITR form for your income sources',
            'Not reporting foreign assets and foreign income where required',
            'Claiming deductions without proof, or under the wrong tax regime',
            'Forgetting to e-verify the return within 30 days of filing',
            'Wrong or closed bank account for the refund',
          ],
        },
        { type: 'heading', text: 'Action Items for Taxpayers:' },
        {
          type: 'list',
          items: [
            'Download your AIS and Form 26AS and compare them with your records',
            'Compare the old and new tax regimes before choosing one',
            'Gather investment proofs, rent receipts and capital gains statements early',
            'E-verify immediately after filing and keep the acknowledgement',
          ],
        },
        {
          type: 'paragraph',
          text: 'ACR & Company prepares and files returns for individuals, professionals and businesses, and responds to notices on your behalf. Contact us for help with your return.',
        },
      ],
    },
  ],
};
