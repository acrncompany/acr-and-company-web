import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { Application, InboxService, JobFilter, Page } from '../../core/inbox.service';
import { NotifyService } from '../../core/notify.service';
import { PageHeader } from '../../shared/page-header';

/** Job applications: filter by position, read / unread, download the CV, delete. */
@Component({
  selector: 'app-inbox-applications',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule, MatSlideToggleModule, PageHeader],
  template: `
    <app-page-header title="Job applications" help="People who applied from a job page. Open an application to read it." />

    <div class="filters">
      <mat-form-field appearance="outline" class="job">
        <mat-label>Position</mat-label>
        <mat-select [value]="job()" (selectionChange)="setJob($event.value)" aria-label="Show applications for position">
          <mat-option value="">All positions ({{ inbox.counts()?.applications ?? 0 }})</mat-option>
          @for (j of jobs(); track j.jobId ?? j.title) {
            <mat-option [value]="j.jobId === null ? 'none' : '' + j.jobId">{{ j.title }}{{ j.jobId === null ? ' (removed)' : '' }} ({{ j.total }})</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-slide-toggle [checked]="unreadOnly()" (change)="setUnreadOnly($event.checked)">Unread only</mat-slide-toggle>
    </div>

    @if (loading() && items().length === 0) {
      <div class="center"><mat-spinner diameter="40" /></div>
    } @else if (items().length === 0) {
      <mat-card appearance="outlined" class="empty"><mat-card-content><mat-icon>inbox</mat-icon><p>{{ unreadOnly() ? 'No unread applications.' : 'No applications yet.' }}</p></mat-card-content></mat-card>
    } @else {
      @for (a of items(); track a.id) {
        <mat-card appearance="outlined" class="row" [class.unread]="!a.isRead">
          <button type="button" class="head" (click)="toggle(a)" [attr.aria-expanded]="openId() === a.id">
            <span class="dot" [attr.aria-label]="a.isRead ? 'Read' : 'Unread'"></span>
            <span class="who">
              <strong>{{ a.name }}</strong>
              <small>{{ a.jobTitle || 'Removed position' }}</small>
            </span>
            <span class="when">{{ a.createdAt | date: 'd MMM y, HH:mm' }}</span>
            <mat-icon>{{ openId() === a.id ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
          @if (openId() === a.id) {
            <div class="body">
              <dl>
                <dt>Position</dt><dd>{{ a.jobTitle || 'Removed position' }}</dd>
                <dt>Name</dt><dd>{{ a.name }}</dd>
                <dt>Email</dt><dd><a [href]="'mailto:' + a.email">{{ a.email }}</a></dd>
                @if (a.phone) { <dt>Phone</dt><dd><a [href]="'tel:' + a.phone">{{ a.phone }}</a></dd> }
                @if (a.message) { <dt>Cover note</dt><dd class="msg">{{ a.message }}</dd> }
                @if (a.cvOriginalName) { <dt>CV</dt><dd>{{ a.cvOriginalName }}</dd> }
              </dl>
              <div class="actions">
                @if (a.cvOriginalName) { <a mat-flat-button [href]="cvUrl(a)" download><mat-icon>download</mat-icon> Download CV</a> }
                <button mat-stroked-button type="button" (click)="setRead(a, !a.isRead)"><mat-icon>{{ a.isRead ? 'mark_email_unread' : 'drafts' }}</mat-icon> {{ a.isRead ? 'Mark as unread' : 'Mark as read' }}</button>
                <button mat-stroked-button type="button" class="danger-outline" (click)="remove(a)"><mat-icon>delete</mat-icon> Delete</button>
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
    .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 0 20px; margin-bottom: 8px; }
    .job { width: min(420px, 100%); }
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
export class InboxApplications implements OnInit {
  private readonly api = inject(Api);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);
  private readonly route = inject(ActivatedRoute);
  protected readonly inbox = inject(InboxService);

  protected readonly items = signal<Application[]>([]);
  protected readonly jobs = signal<JobFilter[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly job = signal(''); // '' = all, 'none' = removed positions, otherwise a job id
  protected readonly unreadOnly = signal(false);
  protected readonly openId = signal<number | null>(null);
  private page = 1;

  async ngOnInit() {
    this.inbox.refresh();
    this.loadJobs();
    await this.load(true);
    // An email alert links here with ?open=<id>.
    const open = Number(this.route.snapshot.queryParamMap.get('open'));
    const a = this.items().find((x) => x.id === open);
    if (a) this.toggle(a);
  }

  /** The CV can only be downloaded by a logged-in admin: the API checks the login cookie. */
  protected cvUrl(a: Application): string {
    return `${this.api.base}/applications/${a.id}/cv`;
  }

  protected setJob(value: string) {
    this.job.set(value);
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

  private async loadJobs() {
    try {
      this.jobs.set(await firstValueFrom(this.api.get<JobFilter[]>('/applications/jobs')));
    } catch (e) {
      this.notify.error(e);
    }
  }

  private async load(reset: boolean) {
    if (reset) this.page = 1;
    this.loading.set(true);
    try {
      const r = await firstValueFrom(
        this.api.get<Page<Application>>('/applications', { jobId: this.job(), status: this.unreadOnly() ? 'unread' : '', page: this.page }),
      );
      this.total.set(r.total);
      this.items.set(reset ? r.items : [...this.items(), ...r.items]);
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  /** Opening an application marks it as read. */
  protected toggle(a: Application) {
    const opening = this.openId() !== a.id;
    this.openId.set(opening ? a.id : null);
    if (opening && !a.isRead) this.setRead(a, true);
  }

  protected async setRead(a: Application, isRead: boolean) {
    try {
      const saved = await firstValueFrom(this.api.patch<Application>(`/applications/${a.id}`, { isRead }));
      this.items.update((list) => list.map((x) => (x.id === a.id ? saved : x)));
      this.inbox.refresh();
      this.loadJobs();
    } catch (e) {
      this.notify.error(e);
    }
  }

  protected async remove(a: Application) {
    const ok = await this.confirm.ask({
      title: 'Delete this application?',
      message: `The application from ${a.name} and the CV file will be deleted for good.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await firstValueFrom(this.api.delete(`/applications/${a.id}`));
      this.items.update((list) => list.filter((x) => x.id !== a.id));
      this.total.update((n) => n - 1);
      this.openId.set(null);
      this.notify.success('Application deleted');
      this.inbox.refresh();
      this.loadJobs();
    } catch (e) {
      this.notify.error(e);
    }
  }
}
