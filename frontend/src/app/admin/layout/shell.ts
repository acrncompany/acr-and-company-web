import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, map, startWith } from 'rxjs';
import { ConfirmService } from '../core/confirm.service';
import { AuthService } from '../core/auth.service';
import { InboxService } from '../core/inbox.service';
import { AdminUrlPipe } from '../core/admin-url';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  exact?: boolean;
  /** Shows the unread number of this inbox next to the label. */
  badge?: 'messages' | 'applications';
  /** Sidebar entries with several screens: they show as horizontal tabs inside the page. */
  section?: string;
}

interface Tab { label: string; path: string }
interface Section { key: string; tabs: Tab[] }

const SECTIONS: Section[] = [
  { key: 'services', tabs: [{ label: 'All services', path: '/services' }, { label: 'Service groups', path: '/services/groups' }, { label: 'Page texts', path: '/services/page' }] },
  { key: 'learning', tabs: [{ label: 'Articles', path: '/learning' }, { label: 'Categories', path: '/learning/categories' }, { label: 'Page texts', path: '/learning/page' }] },
  { key: 'careers', tabs: [{ label: 'Job openings', path: '/careers' }, { label: 'Departments', path: '/careers/departments' }, { label: 'Page texts', path: '/careers/page' }] },
];
const under = (path: string, base: string) => path === base || path.startsWith(base + '/');

/** The frame around every admin screen: top bar, menu (a slide-out drawer on tablets and phones), and the content area. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, AdminUrlPipe],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #nav [mode]="compact() ? 'over' : 'side'" [opened]="!compact()" class="nav" [fixedInViewport]="true" role="navigation">
        <div class="brand">
          <img class="mark" src="/assets/images/logo.png" alt="ACR &amp; Company logo" width="64" height="39" />
          <span class="divider" aria-hidden="true"></span>
          <div><strong>ACR &amp; Company</strong><small>Chartered Accountants</small></div>
        </div>
        <mat-nav-list>
          @for (item of items; track item.label) {
            <a mat-list-item [routerLink]="item.path | adminUrl" [class.active]="isActive(item)" [routerLinkActive]="item.section ? '' : 'active'" [routerLinkActiveOptions]="{ exact: !!item.exact }" (click)="closeIfCompact()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
              @if (unread(item); as n) {
                <span matListItemMeta class="count" [attr.aria-label]="n + ' unread'">{{ n }}</span>
              }
            </a>
          }
        </mat-nav-list>
        <div class="foot">
          <a mat-stroked-button [href]="siteHome" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon> View website</a>
          <button mat-flat-button type="button" class="logout" (click)="confirmLogout()"><mat-icon>logout</mat-icon> Log out</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="top">
          @if (compact()) {
            <button mat-icon-button type="button" (click)="nav.toggle()" aria-label="Open menu"><mat-icon>menu</mat-icon></button>
          }
          <span class="title">{{ compact() ? 'Website editor' : '' }}</span>
          <span class="spacer"></span>
          <span class="who"><mat-icon>account_circle</mat-icon> Administrator</span>
        </mat-toolbar>
        <main class="content">
          @if (section(); as sec) {
            <nav class="tabs" aria-label="Sections">
              @for (t of sec.tabs; track t.path) {
                <a class="tab" [routerLink]="t.path | adminUrl" [class.on]="t === activeTab()" (click)="$event.stopPropagation()">{{ t.label }}</a>
              }
            </nav>
          }
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .container { min-height: 100vh; background: var(--acr-surface); }
    .nav { width: 240px; background: var(--acr-navy); border-right: 0; border-radius: 0; --mat-sidenav-container-shape: 0; display: flex; flex-direction: column; color: #fff; }
    .brand { display: flex; align-items: center; gap: 12px; padding: 18px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); margin-bottom: 8px; }
    .mark { width: 64px; height: auto; flex: none; }
    .divider { width: 1px; align-self: stretch; background: rgba(255, 255, 255, 0.25); }
    .brand div { display: flex; flex-direction: column; line-height: 1.25; }
    .brand strong { font-size: 15px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
    .brand small { color: rgba(255, 255, 255, 0.6); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; }
    mat-nav-list { --mat-list-list-item-label-text-color: #fff; --mat-list-list-item-leading-icon-color: var(--acr-gold); --mat-list-list-item-hover-label-text-color: #fff; --mat-list-list-item-focus-label-text-color: #fff; --mat-list-list-item-hover-state-layer-color: #fff; --mat-list-list-item-focus-state-layer-color: #fff; padding: 6px 10px; }
    mat-nav-list a { border-radius: 10px; margin-bottom: 2px; --mat-list-list-item-one-line-container-height: 44px; --mat-list-list-item-label-text-size: 14px; --mat-list-list-item-leading-icon-size: 20px; }
    mat-nav-list a mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .tabs { display: flex; flex-wrap: wrap; overflow: visible; gap: 6px; margin: 0 0 20px; padding: 6px; background: #e8edf5; border-radius: 12px; }
    .tab { padding: 8px 16px; color: var(--acr-muted); font-weight: 600; text-decoration: none; border-radius: 8px; white-space: nowrap; }
    .tab:hover { color: var(--acr-navy); background: rgba(255, 255, 255, 0.6); }
    .tab.on { color: var(--acr-navy); background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15); }
    .count { min-width: 22px; padding: 0 7px; border-radius: 999px; background: var(--acr-gold); color: var(--acr-navy); font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; }
    .active { background: rgba(255, 255, 255, 0.12); }
    .active mat-icon { color: var(--acr-gold); }
    .foot { margin-top: auto; padding: 16px; }
    .foot { display: flex; flex-direction: column; gap: 10px; }
    .logout { --mat-button-filled-container-color: #d32f2f; --mat-button-filled-label-text-color: #fff; width: 100%; font-weight: 700; }
    .who { display: inline-flex; align-items: center; gap: 8px; color: var(--acr-navy); font-weight: 600; }
    .foot a { --mat-button-outlined-label-text-color: #fff; --mat-button-outlined-outline-color: rgba(255, 255, 255, 0.4); width: 100%; }
    .top { position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid var(--acr-border); }
    .title { font-size: 18px; font-weight: 600; color: var(--acr-navy); margin-left: 4px; }
    .spacer { flex: 1; }
    .content { padding: 28px 32px 40px; max-width: 1040px; margin: 0 auto; }
    @media (max-width: 1100px) { .content { padding: 20px 20px 32px; } }
    @media (max-width: 900px) { .content { padding: 14px 12px 24px; } }
  `,
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly inbox = inject(InboxService);
  private readonly confirm = inject(ConfirmService);
  private readonly breakpoints = inject(BreakpointObserver);
  @ViewChild('nav') private nav!: MatSidenav;

  /** Tablets and phones get a slide-out menu; laptops get a fixed side menu. */
  readonly compact = toSignal(this.breakpoints.observe('(max-width: 1023px)').pipe(map((r) => r.matches)), { initialValue: false });
  readonly siteHome = '/';

  private readonly router = inject(Router);
  private readonly path = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), startWith(null), map(() => this.router.url.split(/[?#]/)[0].replace(/^\/admin/, '') || '/')),
    { initialValue: '/' },
  );
  /** The sidebar section the current screen belongs to (its tabs are shown above the page). */
  readonly section = computed(() => SECTIONS.find((x) => x.tabs.some((t) => under(this.path(), t.path))) ?? null);
  /** The tab with the longest matching path, so "/services/groups/5" lights "Service groups" and "/services/5" lights "All services". */
  readonly activeTab = computed(() => {
    const sec = this.section();
    if (!sec) return null;
    return sec.tabs.filter((t) => under(this.path(), t.path)).sort((a, b) => b.path.length - a.path.length)[0] ?? null;
  });

  isActive(item: NavItem): boolean {
    return !!item.section && this.section()?.key === item.section;
  }

  readonly items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/', exact: true },
    { label: 'Home page', icon: 'home', path: '/home' },
    { label: 'About page', icon: 'info', path: '/about' },
    { label: 'Services', icon: 'handyman', path: '/services', section: 'services' },
    { label: 'Learning Centre', icon: 'edit_note', path: '/learning', section: 'learning' },
    { label: 'Careers', icon: 'work', path: '/careers', section: 'careers' },
    { label: 'Contact page', icon: 'contact_mail', path: '/contact' },
    { label: 'Messages', icon: 'mail', path: '/inbox/messages', badge: 'messages' },
    { label: 'Applications', icon: 'assignment_ind', path: '/inbox/applications', badge: 'applications' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
  ];

  constructor() {
    this.inbox.refresh();
  }

  /** Unread number for an inbox item (0 hides the badge). */
  unread(item: NavItem): number {
    if (item.badge === 'messages') return this.inbox.unreadMessages();
    if (item.badge === 'applications') return this.inbox.unreadApplications();
    return 0;
  }

  async confirmLogout() {
    const ok = await this.confirm.ask({ title: 'Log out?', message: 'Are you sure you want to log out of the admin portal?', confirmText: 'Log out', danger: true });
    if (ok) this.auth.logout();
  }

  closeIfCompact() {
    if (this.compact()) this.nav.close();
  }
}
