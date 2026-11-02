import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { FieldDef, FieldType, PAGE_LISTS } from '../core/resources';
import { UnsavedChangesBase } from '../core/unsaved';
import { Field } from '../shared/field';
import { PageHeader } from '../shared/page-header';
import { SeoPanel } from '../shared/seo-panel';
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
  fields: FieldDef[];
}

const TYPE_MAP: Record<Block['type'], FieldType> = { TEXT: 'text', TEXTAREA: 'textarea', RICHTEXT: 'richtext', IMAGE: 'image', LINK: 'link' };
const LINK_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)/;

/** Content blocks that belong to a page's editor although they have their own pageKey. */
const EXTRA_BLOCK_PAGES: Record<string, string[]> = { contact: ['consultation'] };

/** Readable names for the groups of texts on each page (the part of the block key before the first dot). */
const SECTION_TITLES: Record<string, Record<string, string>> = {
  home: {
    hero: 'Top of the page (hero)', core_services: 'Our Core Services', why_choose: 'Why Choose ACR & Company', approach: 'How We Work With You',
    industries: 'Industries We Serve', insights: 'Latest articles', faq: 'Frequently Asked Questions',
  },
  about: { hero: 'Top of the page', story: 'Our story', founder: 'Founder heading', values: 'Core values heading', network: 'Network heading' },
  services: { hero: 'Top of the page', cta: 'Box at the bottom of the page', '': 'Filter tab' },
  learning: { hero: 'Top of the page', '': 'Labels and links' },
  careers: { hero: 'Top of the page', apply: 'Job application form', contact: '"Get In Touch" box', '': 'Headings and button labels' },
  contact: { hero: 'Top of the page', form: 'Contact form', map: 'Map', '': 'Headings' },
  consultation: { '': 'Book a Consultation pop-up (opens from the header button)' },
};

const prettify = (s: string) => (s ? s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Other texts');

/**
 * Edits one fixed page (Home, About, ...): its texts and pictures ("content blocks", grouped by section and each with
 * a label and help text), whether the call-to-action band shows, the links to the lists that belong to the page, and
 * its search-engine details.
 */
@Component({
  selector: 'app-page-editor',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule, MatSlideToggleModule, PageHeader, Field, SeoPanel, AdminUrlPipe],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (form(); as f) {
      <app-page-header [title]="page().title" back="/pages" backLabel="Website pages" help="Change the texts and pictures of this page. Nothing changes on the website until you press Save.">
        <a mat-stroked-button [href]="siteUrl()" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon> View on website</a>
      </app-page-header>

      @if (lists.length) {
        <mat-card appearance="outlined" class="lists">
          <mat-card-header><mat-card-title>Lists and items on this page</mat-card-title><mat-card-subtitle>Open one to add, change, reorder or hide its items.</mat-card-subtitle></mat-card-header>
          <mat-card-content class="chips">
            @for (l of lists; track l.path) {
              <a mat-stroked-button [routerLink]="l.path | adminUrl"><mat-icon>{{ l.icon }}</mat-icon> {{ l.label }}</a>
            }
          </mat-card-content>
        </mat-card>
      }

      <form [formGroup]="f" (ngSubmit)="save()" novalidate>
        @if (sections().length) {
          <h2 class="h">Texts and pictures</h2>
          <mat-accordion multi class="acc">
            @for (s of sections(); track s.title; let i = $index) {
              <mat-expansion-panel [expanded]="i === 0">
                <mat-expansion-panel-header>
                  <mat-panel-title>{{ s.title }}</mat-panel-title>
                  <mat-panel-description>{{ s.fields.length }} {{ s.fields.length === 1 ? 'item' : 'items' }}</mat-panel-description>
                </mat-expansion-panel-header>
                <div class="panel">
                  @for (b of s.fields; track b.key) {
                    <app-field [def]="b" [control]="ctl(b.key)" />
                  }
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        }

        <h2 class="h">This page on the website</h2>
        <mat-card appearance="outlined">
          <mat-card-content>
            <app-field [def]="titleDef" [control]="ctl('title')" />
            <div class="toggle">
              <mat-slide-toggle [formControl]="$any(ctl('showCta'))">Show the call-to-action band at the bottom of this page</mat-slide-toggle>
              <span class="hint">The dark band above the footer with the heading and the gold button (the text is in Settings &gt; Business details). On the live site only the home page shows it.</span>
            </div>
            <div class="toggle">
              <mat-slide-toggle [formControl]="$any(ctl('noindex'))">Ask Google not to list this page</mat-slide-toggle>
              <span class="hint">Leave this off unless the page must stay out of search results.</span>
            </div>
          </mat-card-content>
        </mat-card>

        <app-seo-panel [form]="f" kind="page" [pageKey]="key" titleKey="title" />

        <div class="bar">
          <button mat-button type="button" (click)="cancel()">{{ f.dirty ? 'Cancel' : 'Close' }}</button>
          <button mat-flat-button type="submit" [disabled]="saving()">
            @if (saving()) {
              <mat-spinner diameter="20" />
            } @else {
              <mat-icon>save</mat-icon>
            }
            Save changes
          </button>
        </div>
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
  lists: { label: string; path: string; icon: string }[] = [];
  readonly titleDef: FieldDef = { key: 'title', label: 'Page name', type: 'text', required: true, max: 200, hint: 'Used in the browser tab title, for example "About Us — ACR & Company". It is not shown on the page itself.' };
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly form = signal<FormGroup | null>(null);
  readonly page = signal<any>({});
  readonly sections = signal<Section[]>([]);
  private blocks: Block[] = [];

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
    this.key = this.route.snapshot.paramMap.get('key')!;
    this.lists = PAGE_LISTS[this.key] ?? [];
    try {
      const keys = [this.key, ...(EXTRA_BLOCK_PAGES[this.key] ?? [])];
      const [pages, ...blockLists] = await Promise.all([
        firstValueFrom(this.api.get<any[]>('/pages')),
        ...keys.map((k) => firstValueFrom(this.api.get<Block[]>('/content-blocks', { pageKey: k }))),
      ]);
      const page = pages.find((p) => p.key === this.key);
      if (!page) throw new Error('unknown page');
      this.page.set(page);
      this.blocks = blockLists.flat();
      this.sections.set(this.group(this.blocks));
      this.build(page, this.blocks);
    } catch (e) {
      this.notify.error(e);
      this.router.navigateByUrl(adminUrl('/pages'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Groups the blocks into sections by the first part of their key, keeping the order they have in the admin API. */
  private group(blocks: Block[]): Section[] {
    const out = new Map<string, Section>();
    for (const b of blocks) {
      const dot = b.blockKey.indexOf('.');
      const prefix = dot === -1 ? '' : b.blockKey.slice(0, dot);
      const title = SECTION_TITLES[b.pageKey]?.[prefix] ?? prettify(prefix);
      const id = `${b.pageKey}/${prefix}`;
      if (!out.has(id)) out.set(id, { title, fields: [] });
      out.get(id)!.fields.push(this.fieldFor(b));
    }
    return [...out.values()];
  }

  private fieldFor(b: Block): FieldDef {
    const type = TYPE_MAP[b.type];
    return {
      key: `b${b.id}`, label: b.label, type, hint: b.help || undefined,
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
    for (const b of blocks) {
      c[`b${b.id}`] = new FormControl(b.type === 'IMAGE' ? b.mediaId : b.value, b.type === 'LINK' ? [Validators.pattern(LINK_PATTERN)] : []);
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
        jobs.push(firstValueFrom(this.api.patch(`/content-blocks/${b.id}`, b.type === 'IMAGE' ? { mediaId: ctl.value || null } : { value: ctl.value ?? '' })));
      }
      await Promise.all(jobs);
      f.markAsPristine();
      this.page.update((p) => ({ ...p, title: v['title'] }));
      this.notify.success('Saved');
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.saving.set(false);
    }
  }

  async cancel() {
    await this.router.navigateByUrl(adminUrl('/pages'));
  }
}
