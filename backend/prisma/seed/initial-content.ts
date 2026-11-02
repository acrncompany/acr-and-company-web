/**
 * Initial content seed: fills the DB with the website's current content and copies its images into UPLOAD_DIR.
 *
 * Run:   npm run seed:content      (from backend/)
 *
 * SAFE TO RE-RUN: it only creates what is missing and never overwrites anything edited in the admin. Every table
 * is only filled while it is empty. SiteSettings is written LAST and doubles as the "already seeded" marker.
 *
 * The content comes from prisma/seed/source/ (a frozen copy of the frontend's core/data + core/models, so the seed
 * keeps working after the website stops shipping that data). Notes about anything merged, dropped or adjusted are
 * printed at the end.
 */
import '../../src/config/load-env';
import { PrismaClient, Status, BlockType, IndustryTone } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { loadSharp, mimeFromExt, processImage } from '../../src/common/image-processor';
import { slugify } from '../../src/common/slug';
import { ABOUT_DATA } from './source/data/about.data';
import { CAREERS_DATA } from './source/data/careers.data';
import { CONTACT_DATA } from './source/data/contact.data';
import { HOME_DATA } from './source/data/home.data';
import { LEARNING_DATA } from './source/data/learning.data';
import { NAV_DATA } from './source/data/nav.data';
import { PAGE_SEO_DATA, SITE_SEO_DATA } from './source/data/seo.data';
import { SERVICES_DATA } from './source/data/services.data';
import { SITE_DATA } from './source/data/site.data';

const prisma = new PrismaClient();
const backendRoot = path.resolve(__dirname, '..', '..');
const uploadDir = path.resolve(backendRoot, process.env.UPLOAD_DIR || '../../acr-data/acr-and-company/uploads');
const assetsDir = path.resolve(backendRoot, process.env.SEED_ASSETS_DIR || 'prisma/seed-assets');

const notes: string[] = [];
const note = (s: string) => notes.push(s);

/** Lower-case letters and digits only, "&" read as "and". Used to match names between the two sources. */
const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

// ------------------------------------------------------------------ media

const mediaCache = new Map<string, number>();

/** Copy a seed image into UPLOAD_DIR/seed/ (resized + WebP) and register it as Media, once per file. */
async function ensureMedia(webPath: string, alt: string): Promise<number> {
  const file = path.basename(webPath);
  const cached = mediaCache.get(file);
  if (cached) return cached;

  const src = path.join(assetsDir, file);
  if (!fs.existsSync(src)) throw new Error(`Seed image not found: ${src}`);
  const ext = path.extname(src).toLowerCase();
  const img = await processImage(fs.readFileSync(src), src);
  const rel = `seed/${path.basename(src, ext)}${img.ext}`;

  let media = await prisma.media.findUnique({ where: { path: rel } });
  if (!media) {
    const dest = path.join(uploadDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, img.buffer);
    media = await prisma.media.create({
      data: { path: rel, alt, width: img.width, height: img.height, mimeType: img.mimeType || mimeFromExt(ext), sizeBytes: img.buffer.length },
    });
  }
  mediaCache.set(file, media.id);
  return media.id;
}

// ------------------------------------------------------------------ content blocks

type Block = { pageKey: string; blockKey: string; label: string; help?: string; type?: BlockType; value?: string; image?: { src: string; alt: string } };

const t = (pageKey: string, blockKey: string, label: string, value: string, type: BlockType = 'TEXT'): Block =>
  ({ pageKey, blockKey, label, value, type });
const link = (pageKey: string, blockKey: string, label: string, value: string): Block => t(pageKey, blockKey, label, value, 'LINK');
const img = (pageKey: string, blockKey: string, label: string, image: { src: string; alt: string }): Block =>
  ({ pageKey, blockKey, label, type: 'IMAGE', image });

/** The heading trio used by most sections: eyebrow, title and (optional) subtitle. */
function heading(pageKey: string, prefix: string, name: string, h: { eyebrow: string; title: string; subtitle?: string }): Block[] {
  const out = [t(pageKey, `${prefix}.eyebrow`, `${name}: small label`, h.eyebrow), t(pageKey, `${prefix}.title`, `${name}: title`, h.title)];
  if (h.subtitle) out.push(t(pageKey, `${prefix}.subtitle`, `${name}: subtitle`, h.subtitle, 'TEXTAREA'));
  return out;
}

function buildBlocks(): Block[] {
  const H = HOME_DATA, A = ABOUT_DATA, S = SERVICES_DATA, L = LEARNING_DATA, C = CAREERS_DATA, K = CONTACT_DATA;
  const blocks: Block[] = [
    // ---- home
    t('home', 'hero.eyebrow', 'Hero: small label', H.hero.eyebrow),
    t('home', 'hero.title', 'Hero: title (before the highlighted word)', H.hero.title),
    t('home', 'hero.highlight', 'Hero: highlighted word(s)', H.hero.highlight),
    t('home', 'hero.subtitle', 'Hero: subtitle', H.hero.subtitle, 'TEXTAREA'),
    t('home', 'hero.primary_cta_label', 'Hero: first button label', H.hero.primaryCta.label),
    link('home', 'hero.primary_cta_url', 'Hero: first button link', H.hero.primaryCta.path),
    t('home', 'hero.secondary_cta_label', 'Hero: second button label', H.hero.secondaryCta.label),
    link('home', 'hero.secondary_cta_url', 'Hero: second button link', H.hero.secondaryCta.path),
    // alt is required on Media; the original hero alt was empty (decorative), so it gets a plain description
    img('home', 'hero.background', 'Hero: background image', { src: H.hero.background.src, alt: 'ACR & Company hero background' }),
    ...heading('home', 'core_services', 'Our Core Services', H.coreServices.heading),
    ...heading('home', 'why_choose', 'Why Choose', H.whyChoose.heading),
    img('home', 'why_choose.image', 'Why Choose: image', H.whyChoose.image),
    ...heading('home', 'approach', 'How We Work', H.approach.heading),
    img('home', 'approach.image', 'How We Work: image', H.approach.image),
    ...heading('home', 'industries', 'Industries', H.industries.heading),
    ...heading('home', 'insights', 'Insights', H.insights.heading),
    t('home', 'insights.view_all_label', 'Insights: "view all" label', H.insights.viewAll.label),
    link('home', 'insights.view_all_url', 'Insights: "view all" link', H.insights.viewAll.path),
    ...heading('home', 'faq', 'FAQ', H.faq.heading),
    t('home', 'faq.aside_icon', 'FAQ side box: icon name', H.faq.aside.icon),
    t('home', 'faq.aside_title', 'FAQ side box: title', H.faq.aside.title),
    t('home', 'faq.aside_text', 'FAQ side box: text', H.faq.aside.text, 'TEXTAREA'),

    // ---- about
    ...heading('about', 'hero', 'Hero', A.hero),
    ...heading('about', 'story', 'Our Story', A.story.heading),
    t('about', 'story.paragraphs', 'Our Story: paragraphs (leave a blank line between them)', A.story.paragraphs.join('\n\n'), 'TEXTAREA'),
    ...heading('about', 'founder', 'Founder', A.founder.heading),
    ...heading('about', 'values', 'Core Values', A.values.heading),
    ...heading('about', 'network', 'Network', A.network.heading),

    // ---- services
    ...heading('services', 'hero', 'Hero', S.hero),
    t('services', 'all_label', 'Filter tab that shows every group', S.allLabel),
    t('services', 'cta.title', 'Bottom band: title', S.cta.title),
    t('services', 'cta.text', 'Bottom band: text', S.cta.text, 'TEXTAREA'),
    t('services', 'cta.button_label', 'Bottom band: button label', S.cta.buttonLabel),
    link('services', 'cta.button_url', 'Bottom band: button link', S.cta.path),

    // ---- learning
    ...heading('learning', 'hero', 'Hero', L.hero),
    t('learning', 'all_label', 'Filter tab that shows every article', L.allLabel),
    t('learning', 'read_label', '"Read" link label', L.readLabel),
    t('learning', 'back_to_centre_label', 'Article page: "back to Learning Centre" label', L.backToCentreLabel),
    t('learning', 'back_to_articles_label', 'Article page: "back to all articles" label', L.backToArticlesLabel),

    // ---- careers
    ...heading('careers', 'hero', 'Hero', C.hero),
    t('careers', 'perks_title', '"Why work with us" title', C.perksTitle),
    t('careers', 'openings_title', 'Open positions title', C.openingsTitle),
    t('careers', 'all_label', 'Filter tab that shows every department', C.allLabel),
    t('careers', 'apply_label', '"Apply Now" button label', C.applyLabel),
    // labels for the job detail page (/careers/<slug>), added in phase 3
    t('careers', 'details_label', '"View details" link on each position', 'View Details'),
    t('careers', 'back_label', 'Job page: "back to all openings" label', 'Back to all openings'),
    t('careers', 'description_title', 'Job page: description heading', 'About the role'),
    t('careers', 'requirements_title', 'Job page: requirements heading', 'Requirements'),
    t('careers', 'salary_label', 'Job page: salary label', 'Salary'),
    t('careers', 'closing_label', 'Job page: closing date label', 'Apply by'),
    // job application form (phase 5)
    t('careers', 'apply.title', 'Application form: title', 'Apply for this position'),
    t('careers', 'apply.subtitle', 'Application form: text under the title', 'Send us your details and your CV. We read every application.', 'TEXTAREA'),
    t('careers', 'apply.submit_label', 'Application form: send button label', 'Submit application'),
    t('careers', 'apply.sending_label', 'Application form: button label while sending', 'Sending...'),
    t('careers', 'apply.success_message', 'Application form: thank-you message', 'Thank you for applying. We have received your application and will be in touch if your profile matches.', 'TEXTAREA'),
    t('careers', 'apply.error_message', 'Application form: message when sending fails', 'Sorry, your application could not be sent. Please try again in a moment, or email us.', 'TEXTAREA'),
    t('careers', 'apply.too_many_message', 'Application form: message when a visitor sends too many', 'You have sent several applications in a short time. Please wait a few minutes and try again.', 'TEXTAREA'),
    t('careers', 'apply.cv_hint', 'Application form: text under the CV field', 'PDF, DOC or DOCX, up to 5 MB.'),
    t('careers', 'apply.cv_error_message', 'Application form: message for a wrong CV file', 'Please attach your CV as a PDF, DOC or DOCX file of up to 5 MB.', 'TEXTAREA'),
    t('careers', 'apply.closed_message', 'Application form: message when the position has closed', 'This position is no longer open for applications.', 'TEXTAREA'),
    t('careers', 'contact.title', 'Contact box: title', C.contact.title),
    t('careers', 'contact.text', 'Contact box: text', C.contact.text, 'TEXTAREA'),

    // ---- contact
    ...heading('contact', 'hero', 'Hero', K.hero),
    t('contact', 'form.title', 'Form: title', K.form.title),
    t('contact', 'form.submit_label', 'Form: send button label', K.form.submitLabel),
    t('contact', 'form.sending_label', 'Form: button label while sending', K.form.sendingLabel),
    t('contact', 'form.success_message', 'Form: thank-you message', K.form.successMessage, 'TEXTAREA'),
    t('contact', 'form.error_message', 'Form: message when sending fails', 'Sorry, your message could not be sent. Please try again in a moment, or call or email us.', 'TEXTAREA'),
    t('contact', 'form.too_many_message', 'Form: message when a visitor sends too many', 'You have sent several messages in a short time. Please wait a few minutes and try again.', 'TEXTAREA'),
    t('contact', 'address_title', 'Office address: heading', K.addressTitle),
    t('contact', 'hours_title', 'Business hours: heading', K.hoursTitle),
    t('contact', 'map.title', 'Map: accessible title', K.map.title),
    t('contact', 'map.open_label', 'Map: "open in maps" label', K.map.openLabel),

    // ---- consultation modal
    t('consultation', 'title', 'Title', K.consultation.title),
    t('consultation', 'subtitle', 'Subtitle', K.consultation.subtitle, 'TEXTAREA'),
    t('consultation', 'submit_label', 'Submit button label', K.consultation.submitLabel),
    t('consultation', 'sending_label', 'Button label while sending', K.consultation.sendingLabel),
    t('consultation', 'success_message', 'Thank-you message', K.consultation.successMessage, 'TEXTAREA'),
    t('consultation', 'error_message', 'Message when sending fails', 'Sorry, your request could not be sent. Please try again in a moment, or call us.', 'TEXTAREA'),
    t('consultation', 'too_many_message', 'Message when a visitor sends too many', 'You have sent several requests in a short time. Please wait a few minutes and try again.', 'TEXTAREA'),
    t('consultation', 'close_label', 'Close button label', K.consultation.closeLabel),
  ];
  return blocks;
}

/**
 * One-line help shown under each text in the admin, so a non-developer knows what it changes. Rules by the end of the
 * key, with a few exact overrides. Edit this and run `npm run seed:content` to update the help of existing blocks
 * (only label + help are refreshed; the text and pictures the owner edited are never touched).
 */
const HELP_OVERRIDES: Record<string, string> = {
  'home.hero.title': 'The first part of the big heading. The highlighted word below is added after it, in gold.',
  'home.hero.highlight': 'The last word(s) of the big heading, shown in gold. Keep it short.',
  'home.hero.background': 'The large picture behind the top of the home page. A wide picture (about 1920 x 800) works best.',
  'home.faq.aside_icon': 'Name of the small icon in the box next to the questions (for example help-circle).',
  'home.faq.aside_text': 'The text in the box next to the questions.',
  'about.story.paragraphs': 'The story text. Leave one blank line between paragraphs.',
  'services.cta.button_url': 'Where the button goes. Use /contact to open the contact page.',
  'services.cta.text': 'The sentence under the heading in the box at the bottom of the Services page.',
  'consultation.subtitle': 'The short sentence under the heading of the "Book a Consultation" pop-up.',
  'services.all_label': 'The first filter tab, which shows every service group.',
  'learning.all_label': 'The first filter tab, which shows every article.',
  'careers.all_label': 'The first filter tab, which shows every department.',
  'careers.details_label': 'The link under each job that opens its full page.',
  'careers.back_label': 'The link at the top and bottom of a job page that goes back to the list.',
  'careers.description_title': 'Heading above the job description on a job page.',
  'careers.requirements_title': 'Heading above the requirements on a job page (shown only for jobs that have requirements).',
  'careers.salary_label': 'Word shown before the salary on a job page (shown only for jobs that have a salary).',
  'careers.closing_label': 'Word shown before the closing date on a job page (shown only for jobs that have one).',
  'careers.contact.text': 'The sentence under "Get In Touch". The email addresses and phone number come from Settings.',
  'contact.map.title': 'Short description of the map, read aloud by screen readers. Visitors do not see it.',
  'contact.map.open_label': 'The link on the map that opens Google Maps.',
  'contact.address_title': 'Heading above the address, email and phone. Those details come from Settings.',
  'contact.hours_title': 'Heading above the opening hours. The hours come from Settings.',
  'consultation.title': 'Heading of the "Book a Consultation" pop-up that opens from the header button.',
  'consultation.close_label': 'Text for the close button of the pop-up (read aloud by screen readers).',
};
const HELP_RULES: [RegExp, string][] = [
  [/\.eyebrow$/, 'The small coloured line above the heading. Keep it to a word or two.'],
  [/\.title$/, 'The main heading of this section.'],
  [/\.subtitle$/, 'The grey text under the heading.'],
  [/_cta_label$|button_label$|_label$/, 'The text written on the button or link.'],
  [/_url$/, 'Where the button goes. Use /contact (or another page of this website) or a full https:// address.'],
  [/\.image$|\.background$/, 'The picture shown in this section. Choose one from the library or upload a new one.'],
  [/success_message$/, 'Shown to the visitor after the form has been sent.'],
  [/error_message$|too_many_message$|closed_message$/, 'Shown to the visitor when the form could not be sent.'],
  [/_title$/, 'A heading on this page.'],
];
function helpFor(b: Block): string {
  const key = `${b.pageKey}.${b.blockKey}`;
  return b.help ?? HELP_OVERRIDES[key] ?? HELP_RULES.find(([re]) => re.test(b.blockKey))?.[1] ?? '';
}

// ------------------------------------------------------------------ article body -> HTML

function bodyToHtml(body: (typeof LEARNING_DATA.articles)[number]['body']): string {
  return body
    .map((b) => {
      if (b.type === 'heading') return `<h2>${esc(b.text)}</h2>`;
      if (b.type === 'paragraph') return `<p>${esc(b.text)}</p>`;
      return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    })
    .join('\n');
}

// ------------------------------------------------------------------ job descriptions
// The old descriptions contained the phone number 9447157549. It now lives only in SiteSettings.contactPhone, so
// the two sentences that held it are rewritten here on purpose (email addresses are left as they were).
const JOB_TEXT_OVERRIDES: Record<string, string> = {
  'ca-articleship-limited-vacancies': 'Please reach out to us directly by email: job4acr@gmail.com',
  'ca-cs-cma-articleship-internship':
    'We are an audit firm having versatile expertise in Accounting, Audit, Finance, Taxation and Corporate Consulting and Practices and looking for brilliant, young and energetic candidates for Articleship or Internship. Higher stipend and other benefits including food and accommodation shall be provided to performing candidates. Please reach out to us immediately by e-mail at job4acr@gmail.com for the limited positions available now. We will reserve the vacancies after the interview for eligible candidates for their convenient time for joining.',
};

// ------------------------------------------------------------------ main

/**
 * Creates any content block that does not exist yet. Runs EVERY time (before the "already seeded" check), so blocks
 * added by later phases reach an existing database. Existing blocks are never touched, and blocks cannot be deleted
 * in the admin, so nothing is ever brought back against the owner's wishes.
 */
async function ensureBlocks(): Promise<number> {
  const blocks = buildBlocks();
  let order = 0, created = 0;
  for (const bl of blocks) {
    const exists = await prisma.contentBlock.findUnique({ where: { pageKey_blockKey: { pageKey: bl.pageKey, blockKey: bl.blockKey } } });
    order++;
    if (exists) {
      // Only the developer-written label/help/order are refreshed; the owner's text and pictures are never touched.
      const help = helpFor(bl);
      if (exists.label !== bl.label || exists.help !== help || exists.sortOrder !== order) {
        await prisma.contentBlock.update({ where: { id: exists.id }, data: { label: bl.label, help, sortOrder: order } });
      }
      continue;
    }
    const mediaId = bl.image ? await ensureMedia(bl.image.src, bl.image.alt) : undefined;
    await prisma.contentBlock.create({
      data: { pageKey: bl.pageKey, blockKey: bl.blockKey, label: bl.label, help: helpFor(bl), type: bl.type ?? 'TEXT', value: bl.value ?? '', mediaId, sortOrder: order },
    });
    created++;
  }
  return created;
}


async function main() {
  const newBlocks = await ensureBlocks();
  if (newBlocks) console.log(`Added ${newBlocks} missing content block(s).`);
  if (await prisma.siteSettings.findUnique({ where: { id: 1 } })) {
    console.log('Content already seeded (SiteSettings exists). Nothing to do.');
    return;
  }
  console.log(`Seeding initial content. Images go to ${uploadDir}`);
  const empty = async (model: any, where?: object) => (await model.count({ where })) === 0;

  // ---- pages (SEO records). Home has no meta description of its own (the site default is used).
  for (const p of PAGE_SEO_DATA.filter((x) => !x.key.startsWith('learning/'))) {
    await prisma.page.upsert({
      where: { key: p.key },
      update: {},
      create: {
        key: p.key, title: p.pageTitle, slug: p.isHome ? '' : p.path.replace(/^\//, ''),
        metaTitle: p.metaTitle ?? null, metaDescription: p.metaDescription ?? null, ogType: p.ogType ?? 'website',
        noindex: p.noindex ?? false, showCta: p.showCta ?? true, priority: p.priority ?? 0.5,
      },
    });
  }
  note(`Pages: ${PAGE_SEO_DATA.filter((x) => !x.key.startsWith('learning/')).length} fixed pages. showCta is true only on Home (the others were false in seo.data.ts). The 6 per-article SEO entries became Post rows instead.`);

  // ---- stats
  const statGroups = [['HOME_HERO', HOME_DATA.hero.stats], ['ABOUT_STORY', ABOUT_DATA.story.stats]] as const;
  for (const [group, list] of statGroups) {
    if (!(await empty(prisma.stat, { group }))) continue;
    for (const [i, s] of list.entries()) await prisma.stat.create({ data: { group, value: s.value, label: s.label, sortOrder: i + 1 } });
  }

  // ---- icon + title + text repeaters
  const features: [any, { icon: string; title: string; description: string }[]][] = [
    ['HOME_WHY_CHOOSE', HOME_DATA.whyChoose.features],
    ['HOME_APPROACH', HOME_DATA.approach.steps],
    ['ABOUT_VALUE', ABOUT_DATA.values.items],
    ['CAREER_PERK', CAREERS_DATA.perks.map((p) => ({ icon: p.icon, title: p.title, description: p.text }))],
  ];
  for (const [group, list] of features) {
    if (!(await empty(prisma.featureItem, { group }))) continue;
    for (const [i, f] of list.entries()) await prisma.featureItem.create({ data: { group, icon: f.icon, title: f.title, body: f.description, sortOrder: i + 1 } });
  }

  // ---- FAQs, industries, locations, founder
  if (await empty(prisma.faq)) {
    for (const [i, f] of HOME_DATA.faq.items.entries()) await prisma.faq.create({ data: { pageKey: 'home', question: f.question, answer: f.answer, sortOrder: i + 1 } });
  }
  if (await empty(prisma.industry)) {
    for (const [i, x] of HOME_DATA.industries.items.entries()) {
      await prisma.industry.create({ data: { icon: x.icon, label: x.label, tone: x.tone.toUpperCase() as IndustryTone, sortOrder: i + 1 } });
    }
  }
  if (await empty(prisma.location)) {
    for (const [i, name] of ABOUT_DATA.network.locations.entries()) await prisma.location.create({ data: { name, sortOrder: i + 1 } });
  }
  if (await empty(prisma.teamMember)) {
    const f = ABOUT_DATA.founder;
    await prisma.teamMember.create({ data: { name: f.name, role: f.role, qualifications: f.qualifications, bio: f.bio, fallbackIcon: f.fallbackIcon, sortOrder: 1 } });
    note('Founder: no photo exists yet (the page shows the icon fallback). Upload one in the admin later.');
  }

  // ---- services (categories + offerings), merged with the mega-menu
  if (await empty(prisma.serviceCategory)) {
    let navOnly = 0, offeringOnly = 0, labelDiffs = 0, offerings = 0, menuItems = 0;
    for (const [ci, g] of SERVICES_DATA.groups.entries()) {
      const home = HOME_DATA.coreServices.items.find((x) => norm(x.title) === norm(g.title));
      const nav = NAV_DATA.serviceCategories.find((x) => norm(x.title) === norm(g.title));
      if (!home) note(`Services: no Home card found for category "${g.title}"; its Home card is hidden.`);
      if (!nav) note(`Services: no mega-menu column found for category "${g.title}".`);
      if (home && home.icon !== g.icon) note(`Services: category "${g.title}" icon differs (Services page "${g.icon}" vs Home card "${home.icon}"); the Services page icon was kept.`);
      const cat = await prisma.serviceCategory.create({
        data: { title: g.title, slug: slugify(g.title), icon: g.icon, summary: home?.description ?? '', showOnHome: !!home, sortOrder: ci + 1 },
      });
      const navItems = nav?.items ?? [];
      for (const [si, s] of g.items.entries()) {
        const navMatch = navItems.find((n) => norm(n.label) === norm(s.title));
        if (navMatch && navMatch.label !== s.title) labelDiffs++;
        if (!navMatch) offeringOnly++;
        offerings++;
        if (navMatch) menuItems++;
        await prisma.service.create({
          data: {
            categoryId: cat.id, title: s.title, slug: `${cat.slug}-${slugify(s.title)}`.slice(0, 220),
            menuLabel: navMatch && navMatch.label !== s.title ? navMatch.label : null,
            description: s.description, showInMenu: !!navMatch, sortOrder: si + 1,
          },
        });
      }
      navOnly += navItems.filter((n) => !g.items.some((s) => norm(s.title) === norm(n.label))).length;
    }
    note(`Services: ${SERVICES_DATA.groups.length} categories, ${offerings} offerings (services.data.ts) vs ${NAV_DATA.serviceCategories.reduce((n, c) => n + c.items.length, 0)} mega-menu items (nav.data.ts). Matched by name: ${menuItems}. Only in the Services page: ${offeringOnly}. Only in the mega-menu: ${navOnly}. Different wording: ${labelDiffs}.`);
    note('Services: every "Get Started" path (/contact) and every mega-menu path (/services) was dropped; the website will build links from the slug/category.');
  }

  // ---- learning categories + posts (also the Home Insights)
  if (await empty(prisma.postCategory)) {
    const catId = new Map<string, number>();
    for (const [i, name] of LEARNING_DATA.categories.entries()) {
      catId.set(name, (await prisma.postCategory.create({ data: { name, slug: slugify(name), sortOrder: i + 1 } })).id);
    }
    const featuredSlug = HOME_DATA.insights.featured.slug;
    const homeSlugs = new Set(HOME_DATA.insights.articles.map((a) => a.slug));
    for (const [i, a] of LEARNING_DATA.articles.entries()) {
      const cat = catId.get(a.category);
      if (!cat) throw new Error(`Article "${a.slug}" has unknown category "${a.category}"`);
      await prisma.post.create({
        data: {
          categoryId: cat, title: a.title, slug: a.slug, excerpt: a.excerpt, body: bodyToHtml(a.body),
          coverId: await ensureMedia(a.image.src, a.image.alt), publishedAt: date(a.publishedAt), readMinutes: a.readMinutes,
          isFeatured: a.slug === featuredSlug, showOnHome: homeSlugs.has(a.slug), status: 'PUBLISHED', sortOrder: i + 1,
        },
      });
    }
    // The Home Insights cards were a second hand-typed copy of some articles: report any differences.
    for (const h of [HOME_DATA.insights.featured, ...HOME_DATA.insights.articles]) {
      const a = LEARNING_DATA.articles.find((x) => x.slug === h.slug);
      if (!a) { note(`Insights: Home card "${h.slug}" has no Learning article.`); continue; }
      const diffs = [
        h.title !== a.title && 'title', h.category !== a.category && 'category', h.image.src !== a.image.src && 'image',
        h.publishedAt !== a.publishedAt && 'date', h.readMinutes !== a.readMinutes && 'read time',
        h.excerpt !== undefined && h.excerpt !== a.excerpt && 'excerpt',
      ].filter(Boolean);
      if (diffs.length) note(`Insights: Home card "${h.slug}" differs from the Learning article in: ${diffs.join(', ')}. The Learning article was kept.`);
    }
    note(`Posts: ${LEARNING_DATA.articles.length} articles in ${LEARNING_DATA.categories.length} categories. Home Insights = 1 featured + ${homeSlugs.size} showOnHome. Bodies converted from blocks to HTML (h2 / p / ul). Several articles share the same stand-in image file, so each image has ONE Media row and one alt text (the first article's wording).`);
  }

  // ---- careers
  if (await empty(prisma.department)) {
    const dep = new Map<string, number>();
    for (const [i, name] of CAREERS_DATA.departments.entries()) dep.set(name, (await prisma.department.create({ data: { name, sortOrder: i + 1 } })).id);
    for (const [i, o] of CAREERS_DATA.openings.entries()) {
      const text = JOB_TEXT_OVERRIDES[o.id] ?? o.description;
      await prisma.job.create({
        data: {
          departmentId: dep.get(o.department) ?? null, title: o.title, slug: o.id, location: o.location, employmentType: o.type,
          description: `<p>${esc(text)}</p>`, status: 'PUBLISHED', postedAt: date(o.postedAt), sortOrder: i + 1,
        },
      });
    }
    const phoneLeft = CAREERS_DATA.openings.filter((o) => /9447157549|94471 57549/.test(JOB_TEXT_OVERRIDES[o.id] ?? o.description));
    if (phoneLeft.length) throw new Error('A job description still contains the phone number');
    note(`Careers: ${CAREERS_DATA.departments.length} departments, ${CAREERS_DATA.openings.length} jobs (all published). The phone number was removed from the descriptions of ${Object.keys(JOB_TEXT_OVERRIDES).length} jobs. Job emails (job4acr@gmail.com) are still in their text.`);
  }

  // ---- menus
  if (await empty(prisma.menuItem)) {
    for (const [i, n] of NAV_DATA.items.entries()) {
      await prisma.menuItem.create({ data: { location: 'HEADER', label: n.label, url: n.path, exact: !!n.exact, isMegaMenu: !!n.megaMenu, sortOrder: i + 1 } });
    }
    for (const [i, n] of SITE_DATA.footer.quickLinks.entries()) {
      await prisma.menuItem.create({ data: { location: 'FOOTER', label: n.label, url: n.path, sortOrder: i + 1 } });
    }
  }

  // ---- settings LAST (marker that seeding finished)
  const logoId = await ensureMedia(SITE_DATA.logo.src, SITE_DATA.logo.alt);
  const defaultOgImageId = await ensureMedia(SITE_SEO_DATA.defaultOgImage.src, SITE_SEO_DATA.defaultOgImage.alt);
  const org = SITE_SEO_DATA.organization;
  await prisma.siteSettings.create({
    data: {
      id: 1,
      siteName: SITE_SEO_DATA.siteName, brandName: SITE_DATA.name, tagline: SITE_DATA.tagline, legalName: SITE_DATA.legalName,
      foundingYear: SITE_DATA.foundingYear, description: SITE_DATA.description, logoId,
      addressLines: SITE_DATA.contact.addressLines.join('\n'), contactEmail: SITE_DATA.contact.email,
      contactPhone: SITE_DATA.contact.phone, contactPhoneRaw: `+${SITE_DATA.contact.phoneRaw}`,
      businessHours: CONTACT_DATA.hours.map((h) => h.text).join('\n'), mapQuery: CONTACT_DATA.map.query,
      careersEmail: CAREERS_DATA.applyEmail, notificationEmail: SITE_DATA.contact.email,
      // Placeholders on purpose: the WhatsApp button stays hidden until a real number is saved in Admin > Settings.
      whatsappNumber: '[placeholder]',
      whatsappMessage: 'Hello ACR & Company, I would like to enquire about your services.',
      ctaTitle: SITE_DATA.cta.title, ctaText: SITE_DATA.cta.text, ctaButtonLabel: SITE_DATA.cta.buttonLabel, ctaPath: SITE_DATA.cta.path,
      headerButtonLabel: NAV_DATA.cta.label, headerButtonUrl: NAV_DATA.cta.path,
      footerAbout: SITE_DATA.footer.about, footerCopyright: SITE_DATA.footer.copyright, footerTaglines: SITE_DATA.footer.tagline.join('\n'),
      titleSuffix: SITE_SEO_DATA.titleSuffix ?? SITE_DATA.name, defaultMetaDescription: SITE_SEO_DATA.defaultDescription,
      keywords: SITE_SEO_DATA.keywords, author: SITE_SEO_DATA.author, themeColor: SITE_SEO_DATA.themeColor, defaultOgImageId,
      orgStreet: org.addressStreet, orgLocality: org.addressLocality, orgRegion: org.addressRegion,
      orgPostalCode: org.addressPostalCode, orgCountryCode: org.addressCountry,
    },
  });
  note('Settings: the phone number (+91 94471 57549) is stored once, in SiteSettings. The Careers contact box will read it from there, and its two emails come from careersEmail + contactEmail.');
  note('Settings: whatsappNumber is the literal "[placeholder]". The old hardcoded WhatsApp link (919447157549) and the Contact page number (+91 95447 10055) were NOT imported.');
  note('Settings: favicon not seeded (generated from the logo in Phase 2 with the media pipeline). notificationEmail defaults to contactEmail.');
  note('Dropped: the hero background had an empty alt (decorative); Media requires alt text, so it got "ACR & Company hero background". The Contact "Service interested in" list is not stored: it is built from ServiceCategory.');

  console.log('\nSeed finished. Notes:');
  notes.forEach((n) => console.log(' - ' + n));
  console.log(`\nWhatsApp sanity: ${(await prisma.siteSettings.findUnique({ where: { id: 1 } }))?.whatsappNumber}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
