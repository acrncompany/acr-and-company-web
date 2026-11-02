/**
 * The admin's "map" of editable content. Each entry describes ONE content type: where it lives in the API,
 * which fields its form has, and how its list looks. The generic list and form screens
 * (features/resource/*) build everything from these descriptions, so adding a field here adds it to the form.
 * Every field has a plain-English label and a hint: write them for someone who has never seen the code.
 */

export type FieldType =
  | 'text' | 'textarea' | 'richtext' | 'number' | 'bool' | 'select' | 'status'
  | 'image' | 'icon' | 'link' | 'email' | 'datetime' | 'color';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  rows?: number;
  hint?: string;
  placeholder?: string;
  options?: { value: string | number | boolean; label: string }[];
  /** Options loaded from another API list (the pickers). */
  optionsFrom?: 'serviceCategories' | 'postCategories' | 'departments';
  /** Optional date/number: when emptied it is saved as "none" (otherwise an empty value leaves the saved value alone). */
  clearable?: boolean;
  /** Show the field only when this returns true for the current form values. */
  showIf?: (values: any) => boolean;
  /** Heading shown above this field and the ones after it (used by long forms such as Settings). */
  section?: string;
}

export interface ListDef {
  primary: (r: any) => string;
  secondary?: (r: any) => string;
  /** Relative upload path for a thumbnail, e.g. r.image?.path */
  thumb?: (r: any) => string | null | undefined;
  /** Name of a website icon shown when there is no thumbnail. */
  icon?: (r: any) => string | null | undefined;
  /** Rows are grouped under a heading (e.g. services by category). */
  groupBy?: (r: any) => string;
  /** Show drag handles / up-down arrows and save the new order. */
  sortable?: boolean;
  /** Row has a Published/Draft status. */
  hasStatus?: boolean;
  /** Extra filter above the list. */
  filter?: 'status' | 'serviceCategory' | 'postCategory';
  emptyText: string;
}

export interface ResourceConfig {
  key: string;
  endpoint: string;
  title: string;
  singular: string;
  /** Router path of the list screen (relative to /admin). */
  basePath: string;
  /** Where "Back" goes (default: basePath). */
  backPath?: string;
  backLabel?: string;
  help?: string;
  fields: FieldDef[];
  /** Fixed values: sent as a list filter AND as defaults/forced values when saving (e.g. { group: 'HOME_WHY_CHOOSE' }). */
  fixed?: Record<string, string>;
  /** Defaults for new items. */
  defaults?: Record<string, any>;
  seo?: { kind: 'service' | 'post' | 'job'; titleKey: string; textKey: string };
  list: ListDef;
  /** Single record without a list (site settings). */
  singleton?: boolean;
  /** Extra tools shown under the form (the settings screen: WhatsApp test link, browser-icon tools). */
  extras?: 'settings';
  noDelete?: boolean;
  links?: { label: string; path: string; icon: string }[];
}

const STATUS_OPTIONS = [
  { value: 'PUBLISHED', label: 'Visible on the website' },
  { value: 'DRAFT', label: 'Hidden (draft)' },
];
const status = (hint?: string): FieldDef => ({
  key: 'status', label: 'Visibility', type: 'status', options: STATUS_OPTIONS,
  hint: hint ?? 'Choose "Hidden" to keep it saved but off the website.',
});
const ICON_HINT = 'The small picture shown on the card. Choose one from the list.';
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const REGISTRY: ResourceConfig[] = [
  // ------------------------------------------------------------------ services
  {
    key: 'services', endpoint: '/services', title: 'Services', singular: 'service', basePath: '/services',
    help: 'Every service listed on the Services page and in the website menu. Drag to change the order inside a group.',
    links: [{ label: 'Service groups', path: '/services/groups', icon: 'folder' }],
    defaults: { status: 'PUBLISHED', showInMenu: true },
    fields: [
      { key: 'categoryId', label: 'Group', type: 'select', required: true, optionsFrom: 'serviceCategories', hint: 'The group (heading) this service is listed under, for example "Taxation".' },
      { key: 'title', label: 'Service name', type: 'text', required: true, max: 200, hint: 'Shown on the Services page, for example "GST Returns & Filing".' },
      { key: 'description', label: 'Short description', type: 'textarea', required: true, max: 2000, rows: 3, hint: 'One or two sentences shown on the service card.' },
      { key: 'showInMenu', label: 'Show in the website menu and footer', type: 'bool', hint: 'Switch off to list the service on the Services page only.' },
      { key: 'menuLabel', label: 'Shorter name for the menu', type: 'text', max: 200, showIf: (v) => !!v.showInMenu, hint: 'Optional. Use it if the menu needs a shorter name than the one above.' },
      status('Hidden services disappear from the Services page and the menu.'),
    ],
    list: {
      primary: (r) => r.title, secondary: (r) => r.description, groupBy: (r) => r.category?.title ?? 'Other',
      sortable: true, hasStatus: true, filter: 'serviceCategory', emptyText: 'No services yet. Click "Add service" to create the first one.',
    },
  },
  {
    key: 'serviceCategories', endpoint: '/service-categories', title: 'Service groups', singular: 'group', basePath: '/services/groups',
    backPath: '/services', backLabel: 'Services',
    help: 'The headings on the Services page, the columns of the menu and the cards on the home page. Drag to change the order.',
    defaults: { status: 'PUBLISHED', showOnHome: true, icon: 'briefcase' },
    fields: [
      { key: 'title', label: 'Group name', type: 'text', required: true, max: 150, hint: 'For example "Audit & Assurance".' },
      { key: 'icon', label: 'Icon', type: 'icon', hint: 'Shown next to the group name on the Services page and on its home page card.' },
      { key: 'summary', label: 'Text for the home page card', type: 'textarea', required: true, max: 300, rows: 2, hint: 'One short line shown under the group name on the home page.' },
      { key: 'showOnHome', label: 'Show as a card on the home page', type: 'bool', hint: 'The home page shows one card for each group switched on here.' },
      { key: 'slug', label: 'Web address part', type: 'text', max: 160, hint: 'Leave empty: it is created from the name.' },
      status('Hidden groups (and the services inside them) disappear from the website.'),
    ],
    list: { primary: (r) => r.title, secondary: (r) => r.summary, icon: (r) => r.icon, sortable: true, hasStatus: true, emptyText: 'No groups yet.' },
  },

  // ------------------------------------------------------------------ learning centre
  {
    key: 'posts', endpoint: '/posts', title: 'Learning Centre articles', singular: 'article', basePath: '/learning',
    help: 'Articles shown in the Learning Centre. Hidden (draft) articles are never shown to visitors.',
    seo: { kind: 'post', titleKey: 'title', textKey: 'excerpt' },
    links: [{ label: 'Article categories', path: '/learning/categories', icon: 'label' }],
    defaults: { status: 'DRAFT', showOnHome: false, isFeatured: false },
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, max: 250, hint: 'The headline of the article.' },
      { key: 'categoryId', label: 'Category', type: 'select', required: true, optionsFrom: 'postCategories', hint: 'The filter tab the article appears under.' },
      { key: 'coverId', label: 'Cover picture', type: 'image', hint: 'Shown on the article card and at the top of the article.' },
      { key: 'excerpt', label: 'Short summary', type: 'textarea', required: true, max: 5000, rows: 4, hint: 'Shown on the article card and used as the Google description if you do not write one below.' },
      { key: 'body', label: 'Article text', type: 'richtext', hint: 'Use the toolbar for headings, lists and links.' },
      { key: 'publishedAt', label: 'Publish date', type: 'datetime', hint: 'A date in the future keeps the article hidden until that day. Leave empty to use now.' },
      { key: 'readMinutes', label: 'Reading time (minutes)', type: 'number', clearable: true, hint: 'Shown as "6 min read". Optional.' },
      status('Only "Visible" articles appear on the website.'),
      { key: 'showOnHome', label: 'Show on the home page', type: 'bool', section: 'Home page', hint: 'The 3 newest articles switched on here appear in "Latest from our experts".' },
      { key: 'isFeatured', label: 'Make it the large featured article on the home page', type: 'bool', hint: 'Only one article is featured at a time (the newest one switched on).' },
    ],
    list: {
      primary: (r) => r.title, secondary: (r) => `${r.category?.name ?? ''} · ${r.publishedAt ? date(r.publishedAt) : 'no date'}`,
      thumb: (r) => r.cover?.path, hasStatus: true, filter: 'status', emptyText: 'No articles yet. Click "Add article" to write the first one.',
    },
  },
  {
    key: 'postCategories', endpoint: '/post-categories', title: 'Article categories', singular: 'category', basePath: '/learning/categories',
    backPath: '/learning', backLabel: 'Articles',
    help: 'The filter tabs of the Learning Centre. Drag to change the order.',
    fields: [
      { key: 'name', label: 'Category name', type: 'text', required: true, max: 100, hint: 'For example "GST Updates".' },
      { key: 'slug', label: 'Web address part', type: 'text', max: 120, hint: 'Leave empty: it is created from the name.' },
    ],
    list: { primary: (r) => r.name, sortable: true, emptyText: 'No categories yet.' },
  },

  // ------------------------------------------------------------------ careers
  {
    key: 'jobs', endpoint: '/jobs', title: 'Job openings', singular: 'job', basePath: '/careers',
    help: 'Open positions shown on the Careers page. Each one also gets its own page. Hidden jobs and jobs past their closing date are not shown.',
    seo: { kind: 'job', titleKey: 'title', textKey: 'description' },
    links: [{ label: 'Departments', path: '/careers/departments', icon: 'account_tree' }],
    defaults: { status: 'PUBLISHED', employmentType: 'Full-time' },
    fields: [
      { key: 'title', label: 'Job title', type: 'text', required: true, max: 200, hint: 'For example "Accounts Executive".' },
      { key: 'departmentId', label: 'Department', type: 'select', optionsFrom: 'departments', hint: 'Used for the filter tabs on the Careers page. Manage the list under "Departments".' },
      { key: 'location', label: 'Location', type: 'text', required: true, max: 150, placeholder: 'Calicut, Cochin, Bangalore' },
      { key: 'employmentType', label: 'Type of job', type: 'text', required: true, max: 80, placeholder: 'Full-time', hint: 'For example Full-time, Part-time, Internship.' },
      { key: 'description', label: 'About the role', type: 'richtext', hint: 'What the job is. The first lines also appear on the Careers page card.' },
      { key: 'requirements', label: 'Requirements', type: 'richtext', hint: 'Optional. Qualifications and skills needed. Shown on the job page.' },
      { key: 'salary', label: 'Salary or stipend', type: 'text', max: 100, hint: 'Optional, shown as typed. For example "Stipend as per norms".' },
      { key: 'applyEmail', label: 'Send applications to', type: 'email', max: 200, hint: 'Optional. If empty, applications go to the careers email in Settings.' },
      { key: 'postedAt', label: 'Posted on', type: 'datetime', hint: 'Shown as "Posted: 15 Jan 2026". Leave empty to use now.' },
      { key: 'closingDate', label: 'Closing date', type: 'datetime', clearable: true, hint: 'Optional. After this day the job disappears from the website.' },
      status('Only "Visible" jobs appear on the website. Use "Hidden" for a filled position.'),
    ],
    list: {
      primary: (r) => r.title, secondary: (r) => `${r.department?.name ?? 'No department'} · ${r.location} · ${r.employmentType}`,
      hasStatus: true, filter: 'status', emptyText: 'No job openings yet. Click "Add job" to create one.',
    },
  },
  {
    key: 'departments', endpoint: '/departments', title: 'Departments', singular: 'department', basePath: '/careers/departments',
    backPath: '/careers', backLabel: 'Job openings',
    help: 'The filter tabs on the Careers page. A tab only shows while a visible job belongs to it. Drag to change the order.',
    fields: [{ key: 'name', label: 'Department name', type: 'text', required: true, max: 150, hint: 'For example "Audit & Accounts".' }],
    list: { primary: (r) => r.name, sortable: true, emptyText: 'No departments yet.' },
  },

  // ------------------------------------------------------------------ lists inside the pages
  statsConfig('home-stats', 'HOME_HERO', 'Home page numbers', '/lists/home-stats', '/pages/home', 'Home page', 'The numbers shown under the big heading at the top of the home page (for example "20+ Years of Excellence").'),
  featureConfig('why', 'HOME_WHY_CHOOSE', 'Why choose us', '/lists/why', '/pages/home', 'Home page', 'The boxes under "Why Choose ACR & Company" on the home page.'),
  featureConfig('approach', 'HOME_APPROACH', 'How we work with you', '/lists/approach', '/pages/home', 'Home page', 'The steps under "How We Work With You" on the home page.'),
  {
    key: 'industries', endpoint: '/industries', title: 'Industries we serve', singular: 'industry', basePath: '/lists/industries', backPath: '/pages/home', backLabel: 'Home page',
    help: 'The coloured tiles under "Industries We Serve" on the home page.',
    defaults: { status: 'PUBLISHED', tone: 'BLUE', icon: 'building' },
    fields: [
      { key: 'label', label: 'Industry name', type: 'text', required: true, max: 100, hint: 'For example "Manufacturing".' },
      { key: 'icon', label: 'Icon', type: 'icon', hint: ICON_HINT },
      {
        key: 'tone', label: 'Tile colour', type: 'select', required: true, hint: 'The colour of the tile.',
        options: ['BLUE', 'AMBER', 'GREEN', 'VIOLET', 'ROSE', 'ORANGE', 'TEAL', 'SLATE'].map((t) => ({ value: t, label: t[0] + t.slice(1).toLowerCase() })),
      },
      status(),
    ],
    list: { primary: (r) => r.label, secondary: (r) => r.tone[0] + r.tone.slice(1).toLowerCase(), icon: (r) => r.icon, sortable: true, hasStatus: true, emptyText: 'No industries yet.' },
  },
  {
    key: 'faqs', endpoint: '/faqs', title: 'Frequently asked questions', singular: 'question', basePath: '/lists/faqs', backPath: '/pages/home', backLabel: 'Home page',
    help: 'The questions and answers on the home page. Drag to change the order.',
    fixed: { pageKey: 'home' }, defaults: { status: 'PUBLISHED' },
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true, max: 300, hint: 'Write it the way a client would ask it.' },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true, max: 3000, rows: 6, hint: 'A clear, short answer.' },
      status(),
    ],
    list: { primary: (r) => r.question, secondary: (r) => r.answer, sortable: true, hasStatus: true, emptyText: 'No questions yet.' },
  },
  statsConfig('about-stats', 'ABOUT_STORY', 'About page numbers', '/lists/about-stats', '/pages/about', 'About page', 'The numbers next to our story on the About page (for example "2000+ Clients").'),
  featureConfig('values', 'ABOUT_VALUE', 'Core values', '/lists/values', '/pages/about', 'About page', 'The boxes under "Our Core Values" on the About page.'),
  {
    key: 'locations', endpoint: '/locations', title: 'Network cities', singular: 'city', basePath: '/lists/locations', backPath: '/pages/about', backLabel: 'About page',
    help: 'The cities shown under "Pan-India & Middle East Presence" on the About page.',
    defaults: { status: 'PUBLISHED' },
    fields: [{ key: 'name', label: 'City name', type: 'text', required: true, max: 100, hint: 'For example "Dubai".' }, status()],
    list: { primary: (r) => r.name, sortable: true, hasStatus: true, emptyText: 'No cities yet.' },
  },
  {
    key: 'team', endpoint: '/team-members', title: 'Founder / leadership', singular: 'person', basePath: '/lists/team', backPath: '/pages/about', backLabel: 'About page',
    help: 'The person shown under "Meet Our Founder" on the About page. The page shows the first visible person.',
    defaults: { status: 'PUBLISHED', fallbackIcon: 'graduation-cap' },
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, max: 150 },
      { key: 'role', label: 'Role', type: 'text', required: true, max: 200, hint: 'For example "Founder & Managing Partner".' },
      { key: 'qualifications', label: 'Qualifications', type: 'text', max: 200, hint: 'For example "FCA, DISA, B.Com".' },
      { key: 'photoId', label: 'Photo', type: 'image', hint: 'Optional. A square photo works best. Without one the icon below is shown.' },
      { key: 'fallbackIcon', label: 'Icon (used when there is no photo)', type: 'icon' },
      { key: 'bio', label: 'About this person', type: 'textarea', required: true, max: 5000, rows: 8, hint: 'Leave a blank line between paragraphs.' },
      status(),
    ],
    list: { primary: (r) => r.name, secondary: (r) => r.role, thumb: (r) => r.photo?.path, icon: (r) => r.fallbackIcon, sortable: true, hasStatus: true, emptyText: 'No people yet.' },
  },
  featureConfig('perks', 'CAREER_PERK', 'Why work with us', '/lists/perks', '/pages/careers', 'Careers page', 'The boxes under "Why Work With Us" on the Careers page.'),

  // ------------------------------------------------------------------ settings area
  {
    key: 'social', endpoint: '/social-links', title: 'Social media links', singular: 'link', basePath: '/settings/social', backPath: '/settings', backLabel: 'Settings',
    help: 'Links to your social media pages. They are also given to Google as official profiles of the business.',
    defaults: { visible: true, platform: 'linkedin' },
    fields: [
      { key: 'platform', label: 'Network', type: 'select', required: true, options: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'].map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) })) },
      { key: 'url', label: 'Page address', type: 'text', required: true, max: 500, placeholder: 'https://www.linkedin.com/company/...', hint: 'The full address, starting with https://' },
      { key: 'visible', label: 'Use this link', type: 'bool', hint: 'Switch off to keep it saved without using it.' },
    ],
    list: { primary: (r) => r.platform, secondary: (r) => r.url, sortable: true, emptyText: 'No social links yet.' },
  },
  menuConfig('menu-header', 'HEADER', 'Top menu', '/settings/menu-header'),
  menuConfig('menu-footer', 'FOOTER', 'Footer links', '/settings/menu-footer'),
  {
    key: 'settings', endpoint: '/settings', title: 'Business details', singular: 'settings', basePath: '/settings/general', backPath: '/settings', backLabel: 'Settings', singleton: true,
    extras: 'settings',
    help: 'Details used all over the website: the name, contact details, WhatsApp, footer and the defaults for Google.',
    fields: [
      { key: 'brandName', label: 'Business name (shown in the page header)', type: 'text', required: true, max: 200, section: 'Business name', hint: 'For example "ACR & Company".' },
      { key: 'tagline', label: 'Small text under the name', type: 'text', required: true, max: 300, hint: 'For example "Chartered Accountants".' },
      { key: 'legalName', label: 'Full legal name', type: 'text', required: true, max: 250, hint: 'Used by Google to identify the business.' },
      { key: 'foundingYear', label: 'Year founded', type: 'number', required: true, hint: 'For example 2004.' },
      { key: 'description', label: 'One-line description of the business', type: 'textarea', required: true, max: 500, rows: 3, hint: 'Used by Google to understand the business.' },

      { key: 'logoId', label: 'Logo', type: 'image', section: 'Logo and browser icon', hint: 'Shown in the page header and footer. A transparent PNG works best.' },
      { key: 'faviconId', label: 'Browser icon (favicon)', type: 'image', hint: 'The tiny icon on browser tabs and phone home screens. Use the button under the form to make it from your logo.' },

      { key: 'addressLines', label: 'Office address', type: 'textarea', required: true, max: 1000, rows: 4, section: 'Contact details', hint: 'One line per row. Shown in the footer and on the Contact page.' },
      { key: 'contactEmail', label: 'Public email address', type: 'email', required: true, max: 200, hint: 'Shown on the website.' },
      { key: 'contactPhone', label: 'Phone number (as shown)', type: 'text', required: true, max: 50, placeholder: '+91 94471 57549', hint: 'Exactly as it should look on the website. This is the only place the phone number is stored.' },
      { key: 'contactPhoneRaw', label: 'Phone number (for tap-to-call)', type: 'text', required: true, max: 20, placeholder: '+919447157549', hint: 'The same number without spaces, starting with + and the country code.' },
      { key: 'businessHours', label: 'Business hours', type: 'textarea', required: true, max: 500, rows: 3, hint: 'One line per row, for example "Mon-Sat: 9:30 AM - 6:00 PM".' },
      { key: 'mapQuery', label: 'Map search text', type: 'text', required: true, max: 300, hint: 'What Google Maps searches for to show the office on the Contact page.' },

      { key: 'whatsappNumber', label: 'WhatsApp number', type: 'text', required: true, max: 30, section: 'WhatsApp', placeholder: '919544710055', hint: 'Country code and number, digits only (for India: 91 then the 10-digit number). The green WhatsApp button stays hidden until a real number is saved here.' },
      { key: 'whatsappMessage', label: 'Message the visitor starts with', type: 'textarea', required: true, max: 500, rows: 2, hint: 'This text is already typed in the chat box when a visitor taps the WhatsApp button.' },

      { key: 'careersEmail', label: 'Email for job applications', type: 'email', required: true, max: 200, section: 'Email', hint: 'The default address for the "Apply Now" button. A job can use its own address.' },
      { key: 'notificationEmail', label: 'Send form alerts to', type: 'email', required: true, max: 200, hint: 'New enquiries from the website forms are emailed here.' },

      { key: 'headerButtonLabel', label: 'Header button text', type: 'text', required: true, max: 100, section: 'Header and footer', hint: 'The gold button at the top right, for example "Book Consultation".' },
      { key: 'headerButtonUrl', label: 'Header button link', type: 'link', required: true, max: 300, placeholder: '/contact', hint: 'Use /contact for a page of this website or https://... for another site.' },
      { key: 'footerAbout', label: 'Footer introduction', type: 'textarea', required: true, max: 2000, rows: 4, hint: 'The paragraph under the logo in the footer.' },
      { key: 'footerCopyright', label: 'Copyright line', type: 'text', required: true, max: 300, hint: 'Shown after the (c) and the year, for example "ACR & Company. All Rights Reserved."' },
      { key: 'footerTaglines', label: 'Footer keywords', type: 'textarea', required: true, max: 500, rows: 3, hint: 'One per line, shown bottom right in the footer.' },

      { key: 'ctaTitle', label: 'Heading', type: 'text', required: true, max: 200, section: 'Call-to-action band ("Ready to grow your business?")', hint: 'The dark band above the footer. Each page can switch it on or off under Website pages.' },
      { key: 'ctaText', label: 'Text', type: 'textarea', required: true, max: 400, rows: 2 },
      { key: 'ctaButtonLabel', label: 'Button text', type: 'text', required: true, max: 100 },
      { key: 'ctaPath', label: 'Button link', type: 'link', required: true, max: 300, placeholder: '/contact' },

      { key: 'siteName', label: 'Default browser title', type: 'text', required: true, max: 200, section: 'Google and sharing defaults', hint: 'The title of the home page in Google, for example "ACR & Company | Chartered Accountants & Business Consultants".' },
      { key: 'titleSuffix', label: 'Name added to page titles', type: 'text', required: true, max: 200, hint: 'Pages without their own title look like "About Us — This name".' },
      { key: 'defaultMetaDescription', label: 'Default description for Google', type: 'textarea', required: true, max: 400, rows: 3, hint: 'Used for pages without their own description. Aim for under 160 characters.' },
      { key: 'defaultOgImageId', label: 'Default picture when a page is shared', type: 'image', hint: 'Shown when a link is shared on WhatsApp, LinkedIn or Facebook.' },
      { key: 'keywords', label: 'Keywords', type: 'text', max: 500, hint: 'A few words separated by commas. They matter little to Google today.' },
      { key: 'author', label: 'Site author', type: 'text', required: true, max: 200 },
      { key: 'themeColor', label: 'Browser colour', type: 'color', hint: 'Colours the address bar on phones.' },

      { key: 'orgStreet', label: 'Street address', type: 'text', required: true, max: 300, section: 'Business address for Google', hint: 'On one line. Helps Google show the business on maps.' },
      { key: 'orgLocality', label: 'City', type: 'text', required: true, max: 100 },
      { key: 'orgRegion', label: 'State', type: 'text', required: true, max: 100 },
      { key: 'orgPostalCode', label: 'Postal code', type: 'text', required: true, max: 20 },
      { key: 'orgCountryCode', label: 'Country code', type: 'text', required: true, max: 2, placeholder: 'IN', hint: 'Two capital letters.' },
    ],
    list: { primary: () => '', emptyText: '' },
  },
];

function featureConfig(key: string, group: string, title: string, basePath: string, backPath: string, backLabel: string, help: string): ResourceConfig {
  return {
    key, endpoint: '/feature-items', title, singular: 'item', basePath, backPath, backLabel, help,
    fixed: { group }, defaults: { status: 'PUBLISHED', icon: 'shield' },
    fields: [
      { key: 'icon', label: 'Icon', type: 'icon', hint: ICON_HINT },
      { key: 'title', label: 'Title', type: 'text', required: true, max: 200, hint: 'A short heading.' },
      { key: 'body', label: 'Text', type: 'textarea', required: true, max: 2000, rows: 4, hint: 'One or two sentences.' },
      status(),
    ],
    list: { primary: (r) => r.title, secondary: (r) => r.body, icon: (r) => r.icon, sortable: true, hasStatus: true, emptyText: 'Nothing here yet. Click "Add item".' },
  };
}

function statsConfig(key: string, group: string, title: string, basePath: string, backPath: string, backLabel: string, help: string): ResourceConfig {
  return {
    key, endpoint: '/stats', title, singular: 'number', basePath, backPath, backLabel, help, fixed: { group },
    defaults: { status: 'PUBLISHED' },
    fields: [
      { key: 'value', label: 'Number', type: 'text', required: true, max: 30, placeholder: '2,000+', hint: 'Type it exactly as it should look, for example "20+" or "2,000+".' },
      { key: 'label', label: 'What it counts', type: 'text', required: true, max: 150, placeholder: 'Clients Served', hint: 'The words under the number.' },
      status(),
    ],
    list: { primary: (r) => `${r.value}  ${r.label}`, sortable: true, hasStatus: true, emptyText: 'No numbers yet. Click "Add number".' },
  };
}

function menuConfig(key: string, location: string, title: string, basePath: string): ResourceConfig {
  const header = location === 'HEADER';
  return {
    key, endpoint: '/menu-items', title, singular: 'link', basePath, backPath: '/settings', backLabel: 'Settings',
    help: header
      ? 'The links at the top of every page. The Services menu itself is built from your services, so do not add its entries here. Drag to change the order.'
      : 'The "Quick Links" list in the footer. Drag to change the order. (The footer Services list comes from your service groups.)',
    fixed: { location }, defaults: { visible: true, exact: false, isMegaMenu: false },
    fields: [
      { key: 'label', label: 'Text', type: 'text', required: true, max: 100, hint: 'The words visitors click.' },
      { key: 'url', label: 'Link', type: 'link', required: true, max: 300, placeholder: '/services', hint: 'Use /about, /services, /contact... for pages of this website, or https://... for another site.' },
      ...(header ? [{ key: 'isMegaMenu', label: 'Opens the Services menu', type: 'bool', hint: 'Switch on for the "Services" link only: it then shows the big menu of all service groups.' } as FieldDef] : []),
      { key: 'visible', label: 'Show on the website', type: 'bool' },
    ],
    list: { primary: (r) => r.label, secondary: (r) => r.url, sortable: true, emptyText: 'No links yet.' },
  };
}

export const RESOURCES: Record<string, ResourceConfig> = Object.fromEntries(REGISTRY.map((r) => [r.key, r]));
export const resourceKeys = REGISTRY.map((r) => r.key);

/** Links from each fixed page's editor to the lists that belong to that page. */
export const PAGE_LISTS: Record<string, { label: string; path: string; icon: string }[]> = {
  home: [
    { label: 'Numbers under the heading', path: '/lists/home-stats', icon: 'pin' },
    { label: 'Service cards (groups)', path: '/services/groups', icon: 'handyman' },
    { label: 'Why choose us', path: '/lists/why', icon: 'thumb_up' },
    { label: 'How we work with you', path: '/lists/approach', icon: 'timeline' },
    { label: 'Industries we serve', path: '/lists/industries', icon: 'factory' },
    { label: 'Latest articles', path: '/learning', icon: 'article' },
    { label: 'Questions and answers', path: '/lists/faqs', icon: 'help' },
  ],
  about: [
    { label: 'Numbers', path: '/lists/about-stats', icon: 'pin' },
    { label: 'Founder', path: '/lists/team', icon: 'person' },
    { label: 'Core values', path: '/lists/values', icon: 'favorite' },
    { label: 'Network cities', path: '/lists/locations', icon: 'public' },
  ],
  services: [
    { label: 'Services', path: '/services', icon: 'handyman' },
    { label: 'Service groups', path: '/services/groups', icon: 'folder' },
  ],
  learning: [
    { label: 'Articles', path: '/learning', icon: 'article' },
    { label: 'Article categories', path: '/learning/categories', icon: 'label' },
  ],
  careers: [
    { label: 'Job openings', path: '/careers', icon: 'work' },
    { label: 'Departments', path: '/careers/departments', icon: 'account_tree' },
    { label: 'Why work with us', path: '/lists/perks', icon: 'favorite' },
  ],
  contact: [{ label: 'Address, phone, hours, WhatsApp (Settings)', path: '/settings/general', icon: 'location_on' }],
};
