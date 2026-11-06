import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { InboxService } from '../core/inbox.service';
import { NotifyService } from '../core/notify.service';
import { NavCard, NavCards } from '../shared/nav-cards';
import { PageHeader } from '../shared/page-header';

/** Simple menu screens made of big cards: Settings, and the Dashboard. */
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
    { title: 'Social media links', description: 'LinkedIn, Facebook, Instagram...', icon: 'share', path: '/settings/social' },
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
  imports: [MatButtonModule, MatIconModule, PageHeader, MatProgressSpinnerModule],
  template: `
    <app-page-header [title]="'Welcome, ' + (auth.user()?.name || 'there')" help="A quick look at your website." />
    @if (data(); as d) {
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
  readonly home = '/';

  private readonly inbox = inject(InboxService);

  async ngOnInit() {
    try {
      const d = await firstValueFrom(this.api.get<Dashboard>('/dashboard'));
      this.data.set(d);
      this.inbox.refresh();
    } catch (e) {
      this.notify.error(e);
    }
  }
}
