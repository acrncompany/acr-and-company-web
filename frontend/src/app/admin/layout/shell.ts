import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map } from 'rxjs';
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
}

/** The frame around every admin screen: top bar, menu (a slide-out drawer on tablets and phones), and the content area. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule, AdminUrlPipe],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #nav [mode]="compact() ? 'over' : 'side'" [opened]="!compact()" class="nav" [fixedInViewport]="true" role="navigation">
        <div class="brand">
          <span class="mark">ACR</span>
          <div><strong>ACR &amp; Company</strong><small>Website editor</small></div>
        </div>
        <mat-nav-list>
          @for (item of items; track item.path) {
            <a mat-list-item [routerLink]="item.path | adminUrl" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !!item.exact }" (click)="closeIfCompact()">
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
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="top">
          @if (compact()) {
            <button mat-icon-button type="button" (click)="nav.toggle()" aria-label="Open menu"><mat-icon>menu</mat-icon></button>
          }
          <span class="title">{{ compact() ? 'Website editor' : '' }}</span>
          <span class="spacer"></span>
          <button mat-button type="button" [matMenuTriggerFor]="user"><mat-icon>account_circle</mat-icon> <span class="who">{{ auth.user()?.name }}</span></button>
          <mat-menu #user="matMenu">
            <div class="email">{{ auth.user()?.email }}</div>
            <a mat-menu-item [routerLink]="'/settings/account' | adminUrl"><mat-icon>lock</mat-icon> Change password</a>
            <button mat-menu-item type="button" (click)="auth.logout()"><mat-icon>logout</mat-icon> Log out</button>
          </mat-menu>
        </mat-toolbar>
        <main class="content"><router-outlet /></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .container { min-height: 100vh; background: var(--acr-surface); }
    .nav { width: 264px; background: var(--acr-navy); border-right: 0; display: flex; flex-direction: column; color: #fff; }
    .brand { display: flex; align-items: center; gap: 12px; padding: 20px 18px 14px; }
    .mark { padding: 6px 9px; border-radius: 8px; background: var(--acr-gold); color: var(--acr-navy); font-weight: 700; /* the admin only ever had weights 400-700; 800 used to fall back to 700 */ letter-spacing: 0.05em; font-size: 14px; }
    .brand div { display: flex; flex-direction: column; line-height: 1.25; }
    .brand strong { font-size: 15px; }
    .brand small { color: rgba(255, 255, 255, 0.65); }
    mat-nav-list { --mat-list-list-item-label-text-color: #fff; --mat-list-list-item-leading-icon-color: var(--acr-gold); --mat-list-list-item-hover-label-text-color: #fff; --mat-list-list-item-focus-label-text-color: #fff; --mat-list-list-item-hover-state-layer-color: #fff; --mat-list-list-item-focus-state-layer-color: #fff; padding: 6px 10px; }
    mat-nav-list a { border-radius: 10px; margin-bottom: 2px; }
    .count { min-width: 22px; padding: 0 7px; border-radius: 999px; background: var(--acr-gold); color: var(--acr-navy); font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; }
    .active { background: rgba(255, 255, 255, 0.12); }
    .active mat-icon { color: var(--acr-gold); }
    .foot { margin-top: auto; padding: 16px; }
    .foot a { --mat-button-outlined-label-text-color: #fff; --mat-button-outlined-outline-color: rgba(255, 255, 255, 0.4); width: 100%; }
    .top { position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid var(--acr-border); }
    .title { font-size: 18px; font-weight: 600; color: var(--acr-navy); margin-left: 4px; }
    .spacer { flex: 1; }
    .email { padding: 8px 16px; color: var(--acr-muted); font-size: 13px; }
    .content { padding: 28px 32px 40px; max-width: 1040px; margin: 0 auto; }
    @media (max-width: 1100px) { .content { padding: 20px 20px 32px; } }
    @media (max-width: 900px) { .content { padding: 14px 12px 24px; } .who { display: none; } }
  `,
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly inbox = inject(InboxService);
  private readonly breakpoints = inject(BreakpointObserver);
  @ViewChild('nav') private nav!: MatSidenav;

  /** Tablets and phones get a slide-out menu; laptops get a fixed side menu. */
  readonly compact = toSignal(this.breakpoints.observe('(max-width: 1023px)').pipe(map((r) => r.matches)), { initialValue: false });
  readonly siteHome = '/';

  readonly items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/', exact: true },
    { label: 'Website pages', icon: 'article', path: '/pages' },
    { label: 'Services', icon: 'handyman', path: '/services' },
    { label: 'Learning Centre', icon: 'edit_note', path: '/learning' },
    { label: 'Careers', icon: 'work', path: '/careers' },
    { label: 'Messages', icon: 'mail', path: '/inbox/messages', badge: 'messages' },
    { label: 'Applications', icon: 'assignment_ind', path: '/inbox/applications', badge: 'applications' },
    { label: 'Pictures', icon: 'photo_library', path: '/settings/images' },
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

  closeIfCompact() {
    if (this.compact()) this.nav.close();
  }
}
