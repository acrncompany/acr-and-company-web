import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { InboxService } from '../core/inbox.service';
import { NotifyService } from '../core/notify.service';
import { NavCard, NavCards } from '../shared/nav-cards';
import { PageHeader } from '../shared/page-header';

/** Simple menu screens made of big cards: Website pages, Settings, and the Dashboard. */
const PAGE_BLURBS: Record<string, string> = {
  home: 'Headings, buttons, numbers, FAQs and how the home page appears on Google',
  about: 'Our story, founder, values and network',
  services: 'The heading and intro of the Services page, and its bottom box',
  learning: 'The Learning Centre heading and labels',
  careers: 'The Careers page texts, perks and open positions',
  contact: 'The Contact page and the "Book a Consultation" pop-up',
};
const PAGE_ICONS: Record<string, string> = { home: 'home', about: 'info', services: 'handyman', learning: 'edit_note', careers: 'work', contact: 'contact_mail' };

@Component({
  selector: 'app-pages-landing',
  imports: [PageHeader, NavCards, MatProgressSpinnerModule],
  template: `
    <app-page-header title="Website pages" help="Choose a page to change its texts and pictures, switch its call-to-action band on or off, and control how it appears on Google." />
    @if (cards().length) {
      <app-nav-cards [cards]="cards()" />
    } @else {
      <mat-spinner diameter="36" />
    }
  `,
})
export class PagesLanding implements OnInit {
  private readonly api = inject(Api);
  private readonly notify = inject(NotifyService);
  readonly cards = signal<NavCard[]>([]);

  async ngOnInit() {
    try {
      const pages = await firstValueFrom(this.api.get<{ key: string; title: string }[]>('/pages'));
      this.cards.set(pages.map((p) => ({ title: p.title, description: PAGE_BLURBS[p.key], icon: PAGE_ICONS[p.key] ?? 'article', path: `/pages/${p.key}` })));
    } catch (e) {
      this.notify.error(e);
    }
  }
}

@Component({
  selector: 'app-settings-landing',
  imports: [PageHeader, NavCards],
  template: `
    <app-page-header title="Settings" help="Details that are used all over the website." />
    <app-nav-cards [cards]="cards" />
  `,
})
export class SettingsLanding {
  readonly cards: NavCard[] = [
    { title: 'Business details', description: 'Name, logo, browser icon, contact details, WhatsApp, footer, Google defaults', icon: 'business', path: '/settings/general' },
    { title: 'Top menu', description: 'The links at the top of every page', icon: 'menu', path: '/settings/menu-header' },
    { title: 'Footer links', description: 'The Quick Links at the bottom of every page', icon: 'view_list', path: '/settings/menu-footer' },
    { title: 'Social media links', description: 'LinkedIn, Facebook, Instagram...', icon: 'share', path: '/settings/social' },
    { title: 'Pictures', description: 'All uploaded pictures: add, describe or delete', icon: 'photo_library', path: '/settings/images' },
    { title: 'Change password', description: 'Choose a new password for your login', icon: 'lock', path: '/settings/account' },
  ];
}

interface Dashboard {
  unreadMessages: number;
  unreadApplications: number;
  draftPosts: number;
  publishedPosts: number;
  draftJobs: number;
  publishedJobs: number;
  services: number;
  serviceCategories: number;
  whatsappMissing: boolean;
  faviconMissing: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule, MatCardModule, MatIconModule, PageHeader, NavCards, MatProgressSpinnerModule],
  template: `
    <app-page-header [title]="'Welcome, ' + (auth.user()?.name || 'there')" help="Here is what needs your attention and the most common tasks." />
    @if (data(); as d) {
      @if (attention().length) {
        <h2 class="h">Needs your attention</h2>
        <app-nav-cards [cards]="attention()" />
      } @else {
        <mat-card appearance="outlined" class="ok"><mat-card-content><mat-icon>check_circle</mat-icon> Everything is set up. Nothing is waiting for you.</mat-card-content></mat-card>
      }

      <h2 class="h">Common tasks</h2>
      <app-nav-cards [cards]="tasks()" />

      <h2 class="h">Your website</h2>
      <div class="stats">
        <div><strong>{{ d.publishedPosts }}</strong><span>articles published</span></div>
        <div><strong>{{ d.services }}</strong><span>services shown</span></div>
        <div><strong>{{ d.publishedJobs }}</strong><span>open positions</span></div>
      </div>
      <a mat-stroked-button [href]="home" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon> Open the website</a>
    } @else {
      <mat-spinner diameter="36" />
    }
  `,
  styles: `
    .h { font-size: 16px; font-weight: 700; margin: 28px 0 10px; color: var(--acr-navy); }
    .ok mat-card-content { display: flex; align-items: center; gap: 10px; color: var(--acr-success); padding: 16px; }
    .stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .stats div { background: #fff; border: 1px solid var(--acr-border); border-radius: 12px; padding: 14px 20px; display: flex; flex-direction: column; min-width: 140px; border-top: 3px solid var(--acr-gold); }
    .stats strong { font-size: 28px; font-weight: 700; color: var(--acr-navy); }
    .stats span { color: var(--acr-muted); font-size: 13px; }
  `,
})
export class DashboardPage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly notify = inject(NotifyService);
  readonly data = signal<Dashboard | null>(null);
  readonly attention = signal<NavCard[]>([]);
  readonly home = '/';

  private readonly inbox = inject(InboxService);
  readonly tasks = computed<NavCard[]>(() => [
    { title: 'Messages', description: 'Contact form and consultation requests', icon: 'mail', path: '/inbox/messages', badge: this.inbox.unreadMessages() || undefined },
    { title: 'Job applications', description: 'Applications and CVs from the Careers pages', icon: 'assignment_ind', path: '/inbox/applications', badge: this.inbox.unreadApplications() || undefined },
    { title: 'Write a new article', icon: 'edit_note', path: '/learning/new' },
    { title: 'Add a job opening', icon: 'person_add', path: '/careers/new' },
    { title: 'Add a service', icon: 'add_business', path: '/services/new' },
    { title: 'Edit the home page', icon: 'home', path: '/pages/home' },
    { title: 'Upload a picture', icon: 'add_photo_alternate', path: '/settings/images' },
    { title: 'Change the contact details or WhatsApp', icon: 'call', path: '/settings/general' },
  ]);

  async ngOnInit() {
    try {
      const d = await firstValueFrom(this.api.get<Dashboard>('/dashboard'));
      this.data.set(d);
      this.inbox.refresh();
      const cards: NavCard[] = [];
      if (d.unreadMessages) cards.push({ title: `${d.unreadMessages} new message${d.unreadMessages > 1 ? 's' : ''}`, description: 'From the Contact page and the consultation pop-up', icon: 'mark_email_unread', path: '/inbox/messages', badge: d.unreadMessages });
      if (d.unreadApplications) cards.push({ title: `${d.unreadApplications} new application${d.unreadApplications > 1 ? 's' : ''}`, description: 'People who applied for a job', icon: 'assignment_ind', path: '/inbox/applications', badge: d.unreadApplications });
      if (d.whatsappMissing) cards.push({ title: 'WhatsApp number is not set', description: 'The green WhatsApp button stays hidden on the website until you add the number', icon: 'chat', path: '/settings/general' });
      if (d.faviconMissing) cards.push({ title: 'No browser icon yet', description: 'Create it from your logo in Settings', icon: 'tab', path: '/settings/general' });
      if (d.draftPosts) cards.push({ title: `${d.draftPosts} hidden article${d.draftPosts > 1 ? 's' : ''}`, description: 'Drafts that are not yet on the website', icon: 'visibility_off', path: '/learning' });
      if (d.draftJobs) cards.push({ title: `${d.draftJobs} hidden job${d.draftJobs > 1 ? 's' : ''}`, description: 'Not shown on the Careers page', icon: 'visibility_off', path: '/careers' });
      this.attention.set(cards);
    } catch (e) {
      this.notify.error(e);
    }
  }
}
