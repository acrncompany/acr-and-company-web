import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { FieldDef, FieldType } from '../core/resources';
import { UnsavedChangesBase } from '../core/unsaved';
import { Field } from '../shared/field';
import { PageHeader } from '../shared/page-header';
import { AdminUrlPipe, adminUrl } from '../core/admin-url';

interface Block {
  id: number;
  pageKey: string;
  blockKey: string;
  label: string;
  help: string;
  type: 'TEXT' | 'TEXTAREA' | 'RICHTEXT' | 'IMAGE' | 'LINK';
  value: string;
  mediaId: number | null;
}

interface Section {
  title: string;
  links?: { label: string; path: string; icon: string }[];
  fields: FieldDef[];
}

const TYPE_MAP: Record<Block['type'], FieldType> = { TEXT: 'text', TEXTAREA: 'textarea', RICHTEXT: 'richtext', IMAGE: 'image', LINK: 'link' };
const LINK_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)/;

/** Content blocks that belong to a page's editor although they have their own pageKey. */
const EXTRA_BLOCK_PAGES: Record<string, string[]> = { contact: ['consultation'] };

/** Lists shown inside a section's dropdown instead of the top "Lists and items" card. */
type ListLink = { label: string; path: string; icon: string };
const SECTION_LINKS: Record<string, ListLink[]> = {
  'home/why_choose': [{ label: 'Why choose us', path: '/lists/why', icon: 'thumb_up' }],
  'home/approach': [{ label: 'How we work with you', path: '/lists/approach', icon: 'timeline' }],
  'home/industries': [{ label: 'Industries we serve', path: '/lists/industries', icon: 'factory' }],
  'home/faq': [{ label: 'Questions and answers', path: '/lists/faqs', icon: 'help' }],
  'about/founder': [{ label: 'Founder', path: '/lists/team', icon: 'person' }],
  'about/values': [{ label: 'Core values', path: '/lists/values', icon: 'favorite' }],
  'about/network': [{ label: 'Network cities', path: '/lists/locations', icon: 'public' }],
  'services/': [
    { label: 'Services', path: '/services', icon: 'handyman' },
    { label: 'Service groups', path: '/services/groups', icon: 'folder' },
  ],
  'learning/': [
    { label: 'Articles', path: '/learning', icon: 'article' },
    { label: 'Article categories', path: '/learning/categories', icon: 'label' },
  ],
  'careers/perks': [{ label: 'Why work with us', path: '/lists/perks', icon: 'favorite' }],
  'careers/openings': [
    { label: 'Job openings', path: '/careers', icon: 'work' },
    { label: 'Departments', path: '/careers/departments', icon: 'account_tree' },
  ],
  'contact/map': [{ label: 'Address, phone, hours, WhatsApp (Settings)', path: '/settings/general', icon: 'location_on' }],
};

/** Blocks without a dotted key that still belong to a named section (pageKey/blockKey → section prefix). */
const BLOCK_SECTION: Record<string, string> = {
  'careers/perks_title': 'perks',
  'careers/openings_title': 'openings',
};

/** Pages whose numbers are edited inline: the stats group and the block they appear after. */
const INLINE_STATS: Record<string, { group: string; after: string }> = {
  home: { group: 'HOME_HERO', after: 'hero.subtitle' },
  about: { group: 'ABOUT_STORY', after: 'story.paragraphs' },
};

/** Blocks kept in the data but not shown in the editor. */
const HIDDEN_BLOCKS = new Set([
  'home/hero.primary_cta_label', 'home/hero.primary_cta_url',
  'home/hero.secondary_cta_label', 'home/hero.secondary_cta_url',
  'contact/form.title', 'contact/form.submit_label', 'contact/form.sending_label',
  'contact/form.success_message', 'contact/form.error_message', 'contact/form.too_many_message',
]);

/** Text blocks edited as a list with Add / Remove buttons (stored one item per line). */
const LIST_BLOCKS = new Set(['contact/form.service_options']);

/** Whole sections kept in the data but not shown in the editor (pageKey/section prefix). */
const HIDDEN_SECTIONS = new Set(['careers/', 'careers/apply', 'careers/contact', 'contact/', 'contact/map', 'consultation/']);

/** Readable names for the groups of texts on each page (the part of the block key before the first dot). */
const SECTION_TITLES: Record<string, Record<string, string>> = {
  home: {
    hero: 'Top of the page', core_services: 'Our Core Services', why_choose: 'Why Choose ACR & Company', approach: 'How We Work With You',
    industries: 'Industries We Serve', insights: 'Latest articles', faq: 'Frequently Asked Questions',
  },
  about: { hero: 'Top of the page', story: 'Our story', founder: 'Founder', values: 'Core values', network: 'Network cities' },
  services: { hero: 'Top of the page', cta: 'Box at the bottom of the page', '': 'Services and filter tab' },
  learning: { hero: 'Top of the page', '': 'Articles, labels and links' },
  careers: { hero: 'Top of the page', perks: 'Why work with us', openings: 'Job openings', apply: 'Job application form', contact: '"Get In Touch" box', '': 'Headings and button labels' },
  contact: { hero: 'Top of the page', form: 'Contact form: Service Interested In', map: 'Map', '': 'Headings' },
  consultation: { '': 'Book a Consultation pop-up (opens from the header button)' },
};

/** Last loaded copy of each page, so going back to a page does not show the loading spinner again. */
const PAGE_CACHE = new Map<string, { page: any; blocks: Block[] }>();

const prettify = (s: string) => (s ? s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Other texts');

/**
 * Edits one fixed page (Home, About, ...): its texts and pictures ("content blocks", grouped by section and each with
 * a label and help text), whether the call-to-action band shows, the links to the lists that belong to the page, and
 * its search-engine details.
 */
@Component({
  selector: 'app-page-editor',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule, MatSliderModule, PageHeader, Field, AdminUrlPipe],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (form(); as f) {
      <app-page-header [title]="page().title" help="Change the texts and pictures of this page. Nothing changes on the website until you press Save.">
        <a mat-stroked-button [href]="siteUrl()" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon> View on website</a>
      </app-page-header>

      <form [formGroup]="f" (ngSubmit)="save()" novalidate>
        @if (sections().length) {
          <mat-accordion multi class="acc">
            @for (s of sections(); track s.title) {
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>{{ s.title }}</mat-panel-title>
                </mat-expansion-panel-header>
                <div class="panel">
                  @for (b of s.fields; track b.key) {
                    @if (b.key === opacityKey) {
                      <div class="slider">
                        <label>{{ b.label }}: <strong>{{ ctl(b.key).value }}%</strong></label>
                        <mat-slider min="0" max="100" step="5" discrete><input matSliderThumb [formControl]="ctl(b.key)" /></mat-slider>
                      </div>
                    } @else {
                      <app-field [def]="b" [control]="ctl(b.key)" />
                    }
                    @if (b.key === subtitleKey) {
                      @for (s of stats(); track s.id) {
                        <app-field [def]="s.def" [control]="ctl('s' + s.id)" />
                      }
                    }
                  }
                  @if (s.links?.length) {
                    <div class="chips">
                      @for (l of s.links; track l.path) {
                        <a mat-stroked-button [routerLink]="l.path | adminUrl"><mat-icon>{{ l.icon }}</mat-icon> {{ l.label }}</a>
                      }
                    </div>
                  }
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        }

        @if (f.dirty || saving()) {
          <div class="bar">
            <button mat-flat-button type="submit" [disabled]="saving()">
              @if (saving()) {
                <mat-spinner diameter="20" />
              } @else {
                <mat-icon>save</mat-icon>
              }
              Save changes
            </button>
          </div>
        }
      </form>
    }
  `,
  styles: `
    .center { display: flex; justify-content: center; padding: 48px; }
    mat-card { margin-bottom: 16px; }
    mat-card-content { padding-top: 16px; }
    .h { font-size: 16px; font-weight: 700; margin: 26px 0 10px; color: var(--acr-navy); }
    .acc { display: block; }
    .panel { padding-top: 12px; }
    .slider { display: flex; flex-direction: column; margin: 4px 0 16px; max-width: 520px; }
    .slider label { font-size: 14px; }
    .slider mat-slider { width: 100%; margin: 0; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .toggle { display: flex; flex-direction: column; gap: 4px; margin: 6px 0 16px; }
    .hint { font-size: 12px; color: var(--acr-muted); max-width: 640px; }
    .bar { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 8px; padding: 12px 0; background: linear-gradient(to top, var(--acr-surface) 70%, rgba(245, 247, 250, 0)); z-index: 5; }
  `,
})
export class PageEditor extends UnsavedChangesBase implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Api);
  private readonly notify = inject(NotifyService);

  key = '';
  readonly titleDef: FieldDef = { key: 'title', label: 'Page name', type: 'text', required: true, max: 200, hint: 'Used in the browser tab title, for example "About Us — ACR & Company". It is not shown on the page itself.' };
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly form = signal<FormGroup | null>(null);
  readonly page = signal<any>({});
  readonly sections = signal<Section[]>([]);
  private blocks: Block[] = [];
  /** Home page only: the numbers under the heading, editable by count only (the words stay as set in the list). */
  readonly stats = signal<{ id: number; value: string; def: FieldDef }[]>([]);
  subtitleKey = '';
  opacityKey = '';
  /** Contact page only: the office address, which is stored in the site settings (null until loaded). */
  private address: string | null = null;

  hasUnsavedChanges() {
    return !!this.form()?.dirty;
  }

  siteUrl() {
    return this.page().viewUrl ?? '/';
  }

  ctl(key: string): FormControl {
    return this.form()!.controls[key] as FormControl;
  }

  async ngOnInit() {
    this.key = this.route.snapshot.data['pageKey'];
    // Pages seen before open instantly from memory; the fresh copy is fetched quietly in the background.
    const cached = PAGE_CACHE.get(this.key);
    if (cached) {
      this.apply(cached.page, cached.blocks);
      this.loading.set(false);
    }
    try {
      const keys = [this.key, ...(EXTRA_BLOCK_PAGES[this.key] ?? [])];
      const [pages, settings, ...blockLists] = await Promise.all([
        firstValueFrom(this.api.get<any[]>('/pages')),
        this.key === 'contact' ? firstValueFrom(this.api.get<any>('/settings')) : Promise.resolve(null),
        ...keys.map((k) => firstValueFrom(this.api.get<Block[]>('/content-blocks', { pageKey: k }))),
      ]);
      const page = pages.find((p) => p.key === this.key);
      if (!page) throw new Error('unknown page');
      const blocks = blockLists.flat();
      if (settings) this.address = String(settings.addressLines ?? '');
      const inline = INLINE_STATS[this.key];
      if (inline) {
        const rows = await firstValueFrom(this.api.get<any[]>('/stats', { group: inline.group }));
        this.stats.set(rows.map((r) => ({
          id: r.id, value: r.value,
          def: { key: `s${r.id}`, label: `Number: ${r.label}`, type: 'text', required: true, max: 30, placeholder: '2,000+' } as FieldDef,
        })));
      }
      PAGE_CACHE.set(this.key, { page, blocks });
      // Never overwrite what the person is typing.
      if (!cached || !this.form()?.dirty) this.apply(page, blocks);
    } catch (e) {
      if (!cached) {
        this.notify.error(e);
        this.router.navigateByUrl(adminUrl('/'));
      }
    } finally {
      this.loading.set(false);
    }
  }

  private apply(page: any, blocks: Block[]) {
    this.page.set(page);
    this.blocks = blocks;
    const sections = this.group(blocks);
    if (this.address !== null) {
      sections.unshift({
        title: 'Office address',
        fields: [{ key: 'addressLines', label: 'Office address', type: 'textarea', required: true, max: 1000, rows: 4 }],
      });
    }
    this.sections.set(sections);
    this.build(page, blocks);
  }

  /** Groups the blocks into sections by the first part of their key, keeping the order they have in the admin API. */
  private group(blocks: Block[]): Section[] {
    const out = new Map<string, Section>();
    for (const b of blocks) {
      if (HIDDEN_BLOCKS.has(`${b.pageKey}/${b.blockKey}`)) continue;
      const dot = b.blockKey.indexOf('.');
      const prefix = dot === -1 ? (BLOCK_SECTION[`${b.pageKey}/${b.blockKey}`] ?? '') : b.blockKey.slice(0, dot);
      const title = SECTION_TITLES[b.pageKey]?.[prefix] ?? prettify(prefix);
      const id = `${b.pageKey}/${prefix}`;
      if (HIDDEN_SECTIONS.has(id)) continue;
      if (!out.has(id)) out.set(id, { title, fields: [], links: SECTION_LINKS[id] });
      out.get(id)!.fields.push(this.fieldFor(b));
    }
    return [...out.values()];
  }

  private fieldFor(b: Block): FieldDef {
    const type = LIST_BLOCKS.has(`${b.pageKey}/${b.blockKey}`) ? 'lines' : TYPE_MAP[b.type];
    if (type === 'lines') return { key: `b${b.id}`, label: b.label, type, hint: 'Add as many as you need. If the list is empty, the website shows the service group names.' };
    return {
      key: `b${b.id}`, label: b.label, type,
      rows: type === 'textarea' ? (b.type === 'TEXTAREA' ? Math.min(8, Math.max(3, Math.ceil(b.value.length / 80))) : 2) : undefined,
      max: type === 'text' || type === 'link' ? 300 : undefined,
      placeholder: type === 'link' ? '/contact or https://...' : undefined,
    };
  }

  private build(page: any, blocks: Block[]) {
    const c: Record<string, FormControl> = {
      title: new FormControl(page.title, [Validators.required, Validators.maxLength(200)]),
      metaTitle: new FormControl(page.metaTitle ?? '', [Validators.maxLength(200)]),
      metaDescription: new FormControl(page.metaDescription ?? '', [Validators.maxLength(400)]),
      ogImageId: new FormControl(page.ogImageId ?? null),
      showCta: new FormControl(!!page.showCta),
      noindex: new FormControl(!!page.noindex),
    };
    this.subtitleKey = '';
    this.opacityKey = '';
    if (this.address !== null) c['addressLines'] = new FormControl(this.address, [Validators.required, Validators.maxLength(1000)]);
    for (const s of this.stats()) c[`s${s.id}`] = new FormControl(s.value, [Validators.required, Validators.maxLength(30)]);
    for (const b of blocks) {
      if (INLINE_STATS[b.pageKey]?.after === b.blockKey) this.subtitleKey = `b${b.id}`;
      const isOpacity = b.pageKey === 'home' && b.blockKey === 'hero.background_opacity';
      if (isOpacity) this.opacityKey = `b${b.id}`;
      c[`b${b.id}`] = new FormControl(isOpacity ? (Number.isFinite(parseInt(b.value, 10)) ? parseInt(b.value, 10) : 100) : b.type === 'IMAGE' ? b.mediaId : b.value, b.type === 'LINK' ? [Validators.pattern(LINK_PATTERN)] : []);
    }
    this.form.set(new FormGroup(c));
  }

  async save() {
    const f = this.form()!;
    f.markAllAsTouched();
    if (f.invalid) return this.notify.error('Please fix the highlighted fields first.');
    this.saving.set(true);
    try {
      const v = f.getRawValue();
      const jobs: Promise<unknown>[] = [
        firstValueFrom(this.api.patch(`/pages/${this.page().id}`, {
          title: v['title'], metaTitle: v['metaTitle'] ?? '', metaDescription: v['metaDescription'] ?? '', ogImageId: v['ogImageId'] || null,
          showCta: !!v['showCta'], noindex: !!v['noindex'],
        })),
      ];
      for (const b of this.blocks) {
        const ctl = f.controls[`b${b.id}`];
        if (!ctl.dirty) continue;
        jobs.push(firstValueFrom(this.api.patch(`/content-blocks/${b.id}`, b.type === 'IMAGE' ? { mediaId: ctl.value || null } : { value: String(ctl.value ?? '') })));
      }
      if (f.controls['addressLines']?.dirty) {
        jobs.push(firstValueFrom(this.api.patch('/settings', { addressLines: String(f.controls['addressLines'].value ?? '').trim() })));
      }
      for (const s of this.stats()) {
        const ctl = f.controls[`s${s.id}`];
        if (ctl?.dirty) jobs.push(firstValueFrom(this.api.patch(`/stats/${s.id}`, { value: ctl.value ?? '' })));
      }
      await Promise.all(jobs);
      this.stats.update((list) => list.map((s) => ({ ...s, value: f.controls[`s${s.id}`].value })));
      if (f.controls['addressLines']) this.address = String(f.controls['addressLines'].value ?? '').trim();
      f.markAsPristine();
      this.page.update((p) => ({ ...p, title: v['title'], metaTitle: v['metaTitle'] ?? '', metaDescription: v['metaDescription'] ?? '', ogImageId: v['ogImageId'] || null, showCta: !!v['showCta'], noindex: !!v['noindex'] }));
      this.blocks = this.blocks.map((b) => {
        const val = f.controls[`b${b.id}`].value;
        return b.type === 'IMAGE' ? { ...b, mediaId: val || null } : { ...b, value: val ?? '' };
      });
      PAGE_CACHE.set(this.key, { page: this.page(), blocks: this.blocks });
      this.notify.success('Saved');
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.saving.set(false);
    }
  }

  async cancel() {
    await this.router.navigateByUrl(adminUrl('/'));
  }
}
