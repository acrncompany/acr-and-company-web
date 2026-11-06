import { Injectable, NotFoundException } from '@nestjs/common';
import { Media, Page, Post, PostCategory, Prisma } from '@prisma/client';
import { env } from '../config/env';
import { sanitizeRichText, stripHtml, truncate } from '../common/sanitize';
import { PrismaService } from '../prisma/prisma.service';

export type ImageRef = { src: string; alt: string };

const published = { status: 'PUBLISHED' } as const;
const bySort = { sortOrder: 'asc' } as const;
/** "line one\nline two" -> ["line one", "line two"] (the multi-line settings fields). */
const lines = (s: string) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);

/**
 * Builds the JSON the website consumes. The shapes deliberately mirror the TypeScript interfaces the Angular site
 * already uses (HomePageContent, AboutPageContent, ...), so switching the website from static data to this API is a
 * drop-in change. Only PUBLISHED rows are ever returned.
 *
 * NOTE: nothing here builds a WhatsApp link. The API returns the raw whatsappNumber + whatsappMessage and the website's
 * single helper turns them into https://wa.me/<number>?text=<message>.
 */
@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- helpers

  private image(m: Media | null | undefined): ImageRef | null {
    return m ? { src: `/uploads/${m.path}`, alt: m.alt } : null;
  }

  private settings() {
    return this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 }, include: { logo: true, defaultOg: true } });
  }

  /** Read access to one page's ContentBlock rows by key. */
  private async blocks(pageKey: string) {
    const rows = await this.prisma.contentBlock.findMany({ where: { pageKey }, include: { media: true } });
    const map = new Map(rows.map((r) => [r.blockKey, r]));
    const text = (key: string) => map.get(key)?.value ?? '';
    const image = (key: string): ImageRef => this.image(map.get(key)?.media) ?? { src: '', alt: '' };
    const heading = (prefix: string) => ({
      eyebrow: text(`${prefix}.eyebrow`), title: text(`${prefix}.title`), subtitle: text(`${prefix}.subtitle`) || undefined,
    });
    const link = (labelKey: string, urlKey: string) => ({ label: text(labelKey), path: text(urlKey) });
    return { text, image, heading, link };
  }

  private pageSeo(p: Page & { ogImage?: Media | null }) {
    return {
      key: p.key,
      path: p.slug ? `/${p.slug}` : '/',
      pageTitle: p.title,
      isHome: p.slug === '',
      metaTitle: p.metaTitle ?? undefined,
      metaDescription: p.metaDescription ?? undefined,
      ogType: p.ogType,
      ogImage: this.image(p.ogImage) ?? undefined,
      noindex: p.noindex,
      showCta: p.showCta,
      priority: Number(p.priority),
    };
  }

  private articleCard(p: Post & { category: PostCategory; cover: Media | null }) {
    return {
      slug: p.slug,
      category: p.category.name,
      title: p.title,
      excerpt: p.excerpt,
      image: this.image(p.cover) ?? { src: '', alt: '' },
      publishedAt: day(p.publishedAt),
      readMinutes: p.readMinutes ?? undefined,
      path: `/learning/${p.slug}`,
    };
  }

  /** Posts that are published and not dated in the future. */
  private livePosts(): Prisma.PostWhereInput {
    return { ...published, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] };
  }

  /** Jobs that are published and not past their closing date. */
  private liveJobs(): Prisma.JobWhereInput {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    return { ...published, OR: [{ closingDate: null }, { closingDate: { gte: startOfToday } }] };
  }

  // ---------------------------------------------------------------- site-wide

  async site() {
    const s = await this.settings();
    const quickLinks = await this.prisma.menuItem.findMany({ where: { location: 'FOOTER', visible: true }, orderBy: bySort });
    return {
      name: s.brandName,
      tagline: s.tagline,
      legalName: s.legalName,
      foundingYear: s.foundingYear,
      description: s.description,
      logo: this.image(s.logo) ?? { src: '', alt: s.brandName },
      contact: {
        addressLines: lines(s.addressLines),
        email: s.contactEmail,
        phone: s.contactPhone,
        phoneRaw: s.contactPhoneRaw,
        whatsappNumber: s.whatsappNumber,
        whatsappMessage: s.whatsappMessage,
      },
      businessHours: lines(s.businessHours),
      mapQuery: s.mapQuery,
      cta: { title: s.ctaTitle, text: s.ctaText, buttonLabel: s.ctaButtonLabel, path: s.ctaPath },
      footer: {
        about: s.footerAbout,
        quickLinks: quickLinks.map((m) => ({ label: m.label, path: m.url })),
        copyright: s.footerCopyright,
        tagline: lines(s.footerTaglines),
      },
      socialLinks: this.socialLinks(s).map((l) => ({ platform: l.platform, url: l.url || '#' })),
    };
  }

  private socialLinks(s: { facebookUrl: string; instagramUrl: string; linkedinUrl: string }) {
    return [
      { platform: 'facebook', url: s.facebookUrl },
      { platform: 'instagram', url: s.instagramUrl },
      { platform: 'linkedin', url: s.linkedinUrl },
    ];
  }

  /** Header menu + the Services mega-menu (built from the services, so there is one source). */
  async nav() {
    const [s, items, categories] = await Promise.all([
      this.settings(),
      this.prisma.menuItem.findMany({ where: { location: 'HEADER', visible: true }, orderBy: bySort }),
      this.prisma.serviceCategory.findMany({
        where: published, orderBy: bySort,
        include: { services: { where: { ...published, showInMenu: true }, orderBy: bySort } },
      }),
    ]);
    return {
      items: items.map((m) => ({ label: m.label, path: m.url, exact: m.exact || undefined, megaMenu: m.isMegaMenu || undefined })),
      cta: { label: s.headerButtonLabel, path: s.headerButtonUrl },
      serviceCategories: categories.map((c) => ({
        title: c.title, slug: c.slug, path: '/services',
        items: c.services.map((x) => ({ label: x.menuLabel ?? x.title, slug: x.slug, path: '/services' })),
      })),
    };
  }

  // ---------------------------------------------------------------- SEO

  async seoSite() {
    const s = await this.settings();
    return {
      siteName: s.siteName,
      titleSuffix: s.titleSuffix,
      siteUrl: env.siteUrl,
      defaultDescription: s.defaultMetaDescription,
      keywords: s.keywords,
      author: s.author,
      themeColor: s.themeColor,
      defaultOgImage: this.image(s.defaultOg) ?? this.image(s.logo) ?? { src: '', alt: s.brandName },
      organization: {
        addressStreet: s.orgStreet, addressLocality: s.orgLocality, addressRegion: s.orgRegion,
        addressPostalCode: s.orgPostalCode, addressCountry: s.orgCountryCode,
        sameAs: this.socialLinks(s).map((l) => l.url).filter(Boolean),
      },
    };
  }

  /** Every indexable URL (fixed pages, published articles and open jobs), for the sitemap. */
  async seoPages() {
    const [pages, posts, jobs] = await Promise.all([
      this.prisma.page.findMany({ where: { noindex: false }, include: { ogImage: true }, orderBy: { id: 'asc' } }),
      this.prisma.post.findMany({ where: this.livePosts(), orderBy: [{ publishedAt: 'desc' }] }),
      this.prisma.job.findMany({ where: this.liveJobs(), orderBy: [{ postedAt: 'desc' }] }),
    ]);
    return [
      ...pages.map((p) => ({ ...this.pageSeo(p), lastModified: p.updatedAt.toISOString() })),
      ...posts.map((p) => ({ key: `learning/${p.slug}`, path: `/learning/${p.slug}`, pageTitle: p.title, lastModified: p.updatedAt.toISOString(), priority: 0.6 })),
      ...jobs.map((j) => ({ key: `careers/${j.slug}`, path: `/careers/${j.slug}`, pageTitle: j.title, lastModified: j.updatedAt.toISOString(), priority: 0.5 })),
    ];
  }

  async seoPage(key: string) {
    const page = await this.prisma.page.findUnique({ where: { key }, include: { ogImage: true } });
    if (!page) throw new NotFoundException();
    return this.pageSeo(page);
  }

  async seoArticle(slug: string) {
    const p = await this.prisma.post.findFirst({ where: { slug, ...this.livePosts() }, include: { cover: true, ogImage: true } });
    if (!p) throw new NotFoundException();
    return {
      key: `learning/${p.slug}`,
      path: `/learning/${p.slug}`,
      pageTitle: p.title,
      metaTitle: p.metaTitle ?? undefined,
      metaDescription: p.metaDescription ?? p.excerpt,
      ogType: 'article',
      ogImage: this.image(p.ogImage) ?? this.image(p.cover) ?? undefined,
      showCta: false,
      priority: 0.6,
      publishedAt: day(p.publishedAt),
      modifiedAt: p.updatedAt.toISOString(),
    };
  }

  async seoJob(slug: string) {
    const j = await this.prisma.job.findFirst({ where: { slug, ...this.liveJobs() }, include: { ogImage: true, department: true } });
    if (!j) throw new NotFoundException();
    return {
      key: `careers/${j.slug}`,
      path: `/careers/${j.slug}`,
      pageTitle: j.title,
      metaTitle: j.metaTitle ?? undefined,
      metaDescription: j.metaDescription ?? truncate(stripHtml(j.description), 160),
      ogType: 'website',
      ogImage: this.image(j.ogImage) ?? undefined,
      showCta: false,
      priority: 0.5,
    };
  }

  // ---------------------------------------------------------------- pages

  async home() {
    const [b, stats, categories, why, steps, industries, faqs, featured, others] = await Promise.all([
      this.blocks('home'),
      this.prisma.stat.findMany({ where: { ...published, group: 'HOME_HERO' }, orderBy: bySort }),
      this.prisma.serviceCategory.findMany({ where: { ...published, showOnHome: true }, orderBy: bySort }),
      this.prisma.featureItem.findMany({ where: { ...published, group: 'HOME_WHY_CHOOSE' }, orderBy: bySort }),
      this.prisma.featureItem.findMany({ where: { ...published, group: 'HOME_APPROACH' }, orderBy: bySort }),
      this.prisma.industry.findMany({ where: published, orderBy: bySort }),
      this.prisma.faq.findMany({ where: { ...published, pageKey: 'home' }, orderBy: bySort }),
      this.prisma.post.findFirst({
        where: { ...this.livePosts(), isFeatured: true }, orderBy: { publishedAt: 'desc' }, include: { category: true, cover: true },
      }),
      this.prisma.post.findMany({
        where: { ...this.livePosts(), showOnHome: true, isFeatured: false }, orderBy: { publishedAt: 'desc' }, take: 3,
        include: { category: true, cover: true },
      }),
    ]);
    const item = (f: { icon: string; title: string; body: string }) => ({ icon: f.icon, title: f.title, description: f.body });
    return {
      hero: {
        eyebrow: b.text('hero.eyebrow'),
        title: b.text('hero.title'),
        highlight: b.text('hero.highlight'),
        subtitle: b.text('hero.subtitle'),
        primaryCta: b.link('hero.primary_cta_label', 'hero.primary_cta_url'),
        secondaryCta: b.link('hero.secondary_cta_label', 'hero.secondary_cta_url'),
        stats: stats.map((s) => ({ value: s.value, label: s.label })),
        background: b.image('hero.background'),
        backgroundOpacity: (() => {
          const n = parseInt(b.text('hero.background_opacity'), 10);
          return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100;
        })(),
      },
      coreServices: {
        heading: b.heading('core_services'),
        items: categories.map((c) => ({ icon: c.icon, title: c.title, description: c.summary, slug: c.slug, path: '/services' })),
      },
      whyChoose: { heading: b.heading('why_choose'), image: b.image('why_choose.image'), features: why.map(item) },
      approach: { heading: b.heading('approach'), image: b.image('approach.image'), steps: steps.map(item) },
      industries: {
        heading: b.heading('industries'),
        items: industries.map((i) => ({ icon: i.icon, label: i.label, tone: i.tone.toLowerCase() })),
      },
      insights: {
        heading: { eyebrow: b.text('insights.eyebrow'), title: b.text('insights.title') },
        viewAll: b.link('insights.view_all_label', 'insights.view_all_url'),
        featured: featured ? this.articleCard(featured) : null,
        articles: others.map((p) => this.articleCard(p)),
      },
      faq: {
        heading: b.heading('faq'),
        aside: { icon: b.text('faq.aside_icon'), title: b.text('faq.aside_title'), text: b.text('faq.aside_text') },
        items: faqs.map((f) => ({ question: f.question, answer: f.answer })),
      },
    };
  }

  async about() {
    const [b, stats, founder, values, locations] = await Promise.all([
      this.blocks('about'),
      this.prisma.stat.findMany({ where: { ...published, group: 'ABOUT_STORY' }, orderBy: bySort }),
      this.prisma.teamMember.findFirst({ where: published, orderBy: bySort, include: { photo: true } }),
      this.prisma.featureItem.findMany({ where: { ...published, group: 'ABOUT_VALUE' }, orderBy: bySort }),
      this.prisma.location.findMany({ where: published, orderBy: bySort }),
    ]);
    const strip = (h: { eyebrow: string; title: string }) => ({ eyebrow: h.eyebrow, title: h.title });
    return {
      hero: { eyebrow: b.text('hero.eyebrow'), title: b.text('hero.title'), subtitle: b.text('hero.subtitle') },
      story: {
        heading: strip(b.heading('story')),
        paragraphs: b.text('story.paragraphs').split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean),
        stats: stats.map((s) => ({ value: s.value, label: s.label })),
      },
      founder: founder
        ? {
            heading: strip(b.heading('founder')),
            name: founder.name, role: founder.role, qualifications: founder.qualifications, bio: founder.bio,
            fallbackIcon: founder.fallbackIcon, photo: this.image(founder.photo) ?? undefined,
          }
        : null,
      values: { heading: strip(b.heading('values')), items: values.map((v) => ({ icon: v.icon, title: v.title, description: v.body })) },
      network: { heading: b.heading('network'), locations: locations.map((l) => l.name) },
    };
  }

  async services() {
    const [b, categories] = await Promise.all([
      this.blocks('services'),
      this.prisma.serviceCategory.findMany({
        where: published, orderBy: bySort,
        include: { services: { where: published, orderBy: bySort } },
      }),
    ]);
    return {
      hero: { eyebrow: b.text('hero.eyebrow'), title: b.text('hero.title'), subtitle: b.text('hero.subtitle') },
      allLabel: b.text('all_label'),
      groups: categories.map((c) => ({
        title: c.title, slug: c.slug, icon: c.icon,
        items: c.services.map((x) => ({ title: x.title, slug: x.slug, description: x.description })),
      })),
      cta: {
        title: b.text('cta.title'), text: b.text('cta.text'), buttonLabel: b.text('cta.button_label'),
      },
    };
  }

  /** The Learning Centre list (article bodies are fetched one at a time, see article()). */
  async learning() {
    const [b, categories, posts] = await Promise.all([
      this.blocks('learning'),
      this.prisma.postCategory.findMany({ orderBy: bySort }),
      this.prisma.post.findMany({
        where: this.livePosts(), orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }], include: { category: true, cover: true },
      }),
    ]);
    return {
      hero: { eyebrow: b.text('hero.eyebrow'), title: b.text('hero.title'), subtitle: b.text('hero.subtitle') },
      allLabel: b.text('all_label'),
      categories: categories.map((c) => c.name),
      articles: posts.map((p) => this.articleCard(p)),
      readLabel: b.text('read_label'),
      backToCentreLabel: b.text('back_to_centre_label'),
      backToArticlesLabel: b.text('back_to_articles_label'),
    };
  }

  /** One article with its body as sanitised HTML. */
  async article(slug: string) {
    const p = await this.prisma.post.findFirst({ where: { slug, ...this.livePosts() }, include: { category: true, cover: true } });
    if (!p) throw new NotFoundException();
    return { ...this.articleCard(p), body: sanitizeRichText(p.body) };
  }

  private jobView(j: Prisma.JobGetPayload<{ include: { department: true } }>, defaultApplyEmail: string) {
    return {
      id: j.slug,
      slug: j.slug,
      title: j.title,
      description: sanitizeRichText(j.description),
      requirements: sanitizeRichText(j.requirements),
      location: j.location,
      type: j.employmentType,
      department: j.department?.name ?? '',
      salary: j.salary ?? undefined,
      applyEmail: j.applyEmail ?? defaultApplyEmail,
      postedAt: day(j.postedAt),
      closingDate: day(j.closingDate),
    };
  }

  async careers() {
    const [b, s, perks, departments, jobs] = await Promise.all([
      this.blocks('careers'),
      this.settings(),
      this.prisma.featureItem.findMany({ where: { ...published, group: 'CAREER_PERK' }, orderBy: bySort }),
      this.prisma.department.findMany({ orderBy: bySort }),
      this.prisma.job.findMany({ where: this.liveJobs(), include: { department: true }, orderBy: [{ postedAt: 'desc' }, { id: 'desc' }] }),
    ]);
    const used = new Set(jobs.map((j) => j.departmentId));
    return {
      hero: { eyebrow: b.text('hero.eyebrow'), title: b.text('hero.title'), subtitle: b.text('hero.subtitle') },
      perksTitle: b.text('perks_title'),
      perks: perks.map((p) => ({ icon: p.icon, title: p.title, text: p.body })),
      openingsTitle: b.text('openings_title'),
      allLabel: b.text('all_label'),
      applyLabel: b.text('apply_label'),
      detailsLabel: b.text('details_label'),
      backLabel: b.text('back_label'),
      descriptionTitle: b.text('description_title'),
      requirementsTitle: b.text('requirements_title'),
      salaryLabel: b.text('salary_label'),
      closingLabel: b.text('closing_label'),
      applyEmail: s.careersEmail,
      apply: {
        title: b.text('apply.title'), subtitle: b.text('apply.subtitle'), submitLabel: b.text('apply.submit_label'),
        sendingLabel: b.text('apply.sending_label'), successMessage: b.text('apply.success_message'),
        errorMessage: b.text('apply.error_message'), tooManyMessage: b.text('apply.too_many_message'),
        cvHint: b.text('apply.cv_hint'), cvErrorMessage: b.text('apply.cv_error_message'), closedMessage: b.text('apply.closed_message'),
      },
      // Filter tabs: only departments that currently have an open position.
      departments: departments.filter((d) => used.has(d.id)).map((d) => d.name),
      openings: jobs.map((j) => this.jobView(j, s.careersEmail)),
      contact: {
        title: b.text('contact.title'),
        text: b.text('contact.text'),
        emails: [...new Set([s.careersEmail, s.contactEmail])],
        phone: s.contactPhone,
        phoneRaw: s.contactPhoneRaw,
      },
    };
  }

  async job(slug: string) {
    const [s, j] = await Promise.all([
      this.settings(),
      this.prisma.job.findFirst({ where: { slug, ...this.liveJobs() }, include: { department: true } }),
    ]);
    if (!j) throw new NotFoundException();
    return this.jobView(j, s.careersEmail);
  }

  async contact() {
    const [b, c, s, categories] = await Promise.all([
      this.blocks('contact'),
      this.blocks('consultation'),
      this.settings(),
      this.prisma.serviceCategory.findMany({ where: published, orderBy: bySort }),
    ]);
    return {
      hero: { eyebrow: b.text('hero.eyebrow'), title: b.text('hero.title'), subtitle: b.text('hero.subtitle') },
      form: {
        title: b.text('form.title'), submitLabel: b.text('form.submit_label'),
        sendingLabel: b.text('form.sending_label'), successMessage: b.text('form.success_message'),
        errorMessage: b.text('form.error_message'), tooManyMessage: b.text('form.too_many_message'),
      },
      addressTitle: b.text('address_title'),
      // The WhatsApp row is NOT here: the website adds it with its one WhatsApp helper from /site (contact.whatsapp*).
      address: [
        { icon: 'map-pin', text: lines(s.addressLines).join(', ') },
        { icon: 'mail', text: s.contactEmail, href: `mailto:${s.contactEmail}` },
        { icon: 'phone', text: s.contactPhone, href: `tel:${s.contactPhoneRaw}` },
      ],
      hoursTitle: b.text('hours_title'),
      hours: lines(s.businessHours).map((text) => ({ icon: 'clock', text })),
      map: { query: s.mapQuery, title: b.text('map.title'), openLabel: b.text('map.open_label') },
      // The "Service interested in" choices: edited in the admin (one per line); empty = the service group names.
      services: lines(b.text('form.service_options')).length ? lines(b.text('form.service_options')) : categories.map((x) => x.title),
      consultation: {
        title: c.text('title'), subtitle: c.text('subtitle'), submitLabel: c.text('submit_label'),
        sendingLabel: c.text('sending_label'), successMessage: c.text('success_message'), closeLabel: c.text('close_label'),
        errorMessage: c.text('error_message'), tooManyMessage: c.text('too_many_message'),
      },
    };
  }
}
