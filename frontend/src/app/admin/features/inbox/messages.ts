import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { ContactMessage, InboxService, Page } from '../../core/inbox.service';
import { NotifyService } from '../../core/notify.service';
import { PageHeader } from '../../shared/page-header';

type TypeFilter = '' | 'CONTACT' | 'CONSULTATION';

/** Messages from the Contact page form and the "Book a Consultation" pop-up: filter by type, read / unread, delete. */
@Component({
  selector: 'app-inbox-messages',
  imports: [DatePipe, MatButtonModule, MatButtonToggleModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatSlideToggleModule, PageHeader],
  template: `
    <app-page-header title="Messages" help="What visitors send from the Contact page and the Book a Consultation pop-up. Open a message to read it." />

    <div class="filters">
      <mat-button-toggle-group [value]="type()" (change)="setType($event.value)" aria-label="Show messages of type">
        <mat-button-toggle value="">All ({{ inbox.counts()?.messages ?? 0 }})</mat-button-toggle>
        <mat-button-toggle value="CONTACT">Contact form ({{ inbox.counts()?.contact ?? 0 }})</mat-button-toggle>
        <mat-button-toggle value="CONSULTATION">Consultations ({{ inbox.counts()?.consultation ?? 0 }})</mat-button-toggle>
      </mat-button-toggle-group>
      <mat-slide-toggle [checked]="unreadOnly()" (change)="setUnreadOnly($event.checked)">Unread only</mat-slide-toggle>
    </div>

    @if (loading() && items().length === 0) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (items().length === 0) {
      <mat-card appearance="outlined" class="empty"><mat-card-content><mat-icon>inbox</mat-icon><p>{{ unreadOnly() ? 'No unread messages.' : 'No messages yet.' }}</p></mat-card-content></mat-card>
    } @else {
      @for (m of items(); track m.id) {
        <mat-card appearance="outlined" class="row" [class.unread]="!m.isRead">
          <button type="button" class="head" (click)="toggle(m)" [attr.aria-expanded]="openId() === m.id">
            <span class="dot" [attr.aria-label]="m.isRead ? 'Read' : 'Unread'"></span>
            <span class="who">
              <strong>{{ m.name }}</strong>
              <small>{{ m.type === 'CONTACT' ? 'Contact form' : 'Consultation' }}@if (m.service) { · {{ m.service }} }</small>
            </span>
            <span class="when">{{ m.createdAt | date: 'd MMM y, HH:mm' }}</span>
            <mat-icon>{{ openId() === m.id ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
          @if (openId() === m.id) {
            <div class="body">
              <dl>
                <dt>Name</dt><dd>{{ m.name }}</dd>
                @if (m.email) { <dt>Email</dt><dd><a [href]="'mailto:' + m.email">{{ m.email }}</a></dd> }
                @if (m.phone) { <dt>Phone</dt><dd><a [href]="'tel:' + m.phone">{{ m.phone }}</a></dd> }
                @if (m.service) { <dt>Service</dt><dd>{{ m.service }}</dd> }
                @if (m.preferredTime) { <dt>Preferred time</dt><dd>{{ m.preferredTime }}</dd> }
                @if (m.message) { <dt>Message</dt><dd class="msg">{{ m.message }}</dd> }
              </dl>
              <div class="actions">
                <button mat-stroked-button type="button" (click)="setRead(m, !m.isRead)"><mat-icon>{{ m.isRead ? 'mark_email_unread' : 'drafts' }}</mat-icon> {{ m.isRead ? 'Mark as unread' : 'Mark as read' }}</button>
                <button mat-stroked-button type="button" class="danger-outline" (click)="remove(m)"><mat-icon>delete</mat-icon> Delete</button>
              </div>
            </div>
          }
        </mat-card>
      }
      @if (items().length < total()) {
        <div class="center"><button mat-stroked-button type="button" (click)="more()" [disabled]="loading()">Show more</button></div>
      }
    }
  `,
  styles: `
    .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; margin-bottom: 16px; }
    .center { display: flex; justify-content: center; padding: 24px; }
    .empty mat-card-content { display: flex; flex-direction: column; align-items: center; padding: 32px; color: var(--acr-muted); }
    .row { margin-bottom: 8px; }
    .row.unread { border-left: 4px solid var(--acr-gold); }
    .head { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; border: 0; background: none; text-align: left; cursor: pointer; font: inherit; color: inherit; min-height: 56px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex: none; background: transparent; }
    .unread .dot { background: var(--acr-gold); }
    .who { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .who strong { font-weight: 500; }
    .unread .who strong { font-weight: 700; }
    .who small { color: var(--acr-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .when { color: var(--acr-muted); font-size: 13px; white-space: nowrap; }
    .body { padding: 0 16px 16px 38px; }
    dl { display: grid; grid-template-columns: 120px 1fr; gap: 6px 12px; margin: 0 0 16px; }
    dt { color: var(--acr-muted); font-size: 13px; }
    dd { margin: 0; overflow-wrap: anywhere; }
    .msg { white-space: pre-wrap; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .danger-outline { color: var(--acr-danger); }
    @media (max-width: 600px) { .when { display: none; } dl { grid-template-columns: 1fr; } dt { margin-top: 6px; } .body { padding-left: 16px; } }
  `,
})
export class InboxMessages implements OnInit {
  private readonly api = inject(Api);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);
  private readonly route = inject(ActivatedRoute);
  protected readonly inbox = inject(InboxService);

  protected readonly items = signal<ContactMessage[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly type = signal<TypeFilter>('');
  protected readonly unreadOnly = signal(false);
  protected readonly openId = signal<number | null>(null);
  private page = 1;

  async ngOnInit() {
    this.inbox.refresh();
    await this.load(true);
    // An email alert links here with ?open=<id>.
    const open = Number(this.route.snapshot.queryParamMap.get('open'));
    const m = this.items().find((x) => x.id === open);
    if (m) this.toggle(m);
  }

  protected setType(value: TypeFilter) {
    this.type.set(value);
    this.openId.set(null);
    this.load(true);
  }

  protected setUnreadOnly(on: boolean) {
    this.unreadOnly.set(on);
    this.load(true);
  }

  protected more() {
    this.page++;
    this.load(false);
  }

  private async load(reset: boolean) {
    if (reset) this.page = 1;
    this.loading.set(true);
    try {
      const r = await firstValueFrom(
        this.api.get<Page<ContactMessage>>('/messages', { type: this.type(), status: this.unreadOnly() ? 'unread' : '', page: this.page }),
      );
      this.total.set(r.total);
      this.items.set(reset ? r.items : [...this.items(), ...r.items]);
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  /** Opening a message marks it as read. */
  protected toggle(m: ContactMessage) {
    const opening = this.openId() !== m.id;
    this.openId.set(opening ? m.id : null);
    if (opening && !m.isRead) this.setRead(m, true);
  }

  protected async setRead(m: ContactMessage, isRead: boolean) {
    try {
      const saved = await firstValueFrom(this.api.patch<ContactMessage>(`/messages/${m.id}`, { isRead }));
      this.items.update((list) => list.map((x) => (x.id === m.id ? saved : x)));
      this.inbox.refresh();
    } catch (e) {
      this.notify.error(e);
    }
  }

  protected async remove(m: ContactMessage) {
    const ok = await this.confirm.ask({
      title: 'Delete this message?',
      message: `The message from ${m.name} will be deleted for good.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await firstValueFrom(this.api.delete(`/messages/${m.id}`));
      this.items.update((list) => list.filter((x) => x.id !== m.id));
      this.total.update((n) => n - 1);
      this.openId.set(null);
      this.notify.success('Message deleted');
      this.inbox.refresh();
    } catch (e) {
      this.notify.error(e);
    }
  }
}
