import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, input, signal } from '@angular/core';
import { ApplyFormContent, JobOpening } from '../../../core/models/careers';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { JobApplicationForm } from './job-application-form';

/** Department filter tabs plus a card per opening. The first tab (null) shows every opening. */
@Component({
  selector: 'app-openings-section',
  imports: [DatePipe, Icon, Reveal, JobApplicationForm],
  template: `
    <section class="openings" aria-labelledby="openings-title">
      <div class="container">
        <h2 class="openings__title" id="openings-title" [appReveal]="0">{{ title() }}</h2>

        <div class="tabs" role="group" aria-label="Filter positions by department" [appReveal]="0">
          <button
            type="button"
            class="tab"
            [class.tab--active]="selected() === null"
            [attr.aria-pressed]="selected() === null"
            (click)="selected.set(null)"
          >
            {{ allLabel() }}
          </button>
          @for (d of departments(); track d) {
            <button
              type="button"
              class="tab"
              [class.tab--active]="selected() === d"
              [attr.aria-pressed]="selected() === d"
              (click)="selected.set(d)"
            >
              {{ d }}
            </button>
          }
        </div>

        <ul class="grid">
          @for (o of visible(); track o.id; let i = $index) {
            <li [appReveal]="(i % 2) * 100">
              <article class="job">
                <h3 class="job__title">{{ o.title }}</h3>
                <div class="job__text" [innerHTML]="o.description"></div>
                <ul class="job__meta">
                  <li><app-icon name="map-pin" [size]="14" /> {{ o.location }}</li>
                  <li><app-icon name="clock" [size]="14" /> {{ o.type }}</li>
                  <li><app-icon name="building" [size]="14" /> {{ o.department }}</li>
                  <li>
                    <app-icon name="calendar" [size]="14" />
                    Posted: <time [attr.datetime]="o.postedAt">{{ o.postedAt | date: 'd MMM y' }}</time>
                  </li>
                </ul>
                <div class="job__actions">
                  <button type="button" class="btn btn--gold" (click)="applying.set(o)">{{ applyLabel() }}</button>
                </div>
              </article>
            </li>
          }
        </ul>
      </div>
    </section>

    @if (applying(); as job) {
      <div class="modal" (click)="close()" (keydown.escape)="close()">
        <div
          class="modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-modal-title"
          (click)="$event.stopPropagation()"
        >
          <button type="button" class="modal__close" aria-label="Close" (click)="close()">
            <app-icon name="close" [size]="18" />
          </button>
          <h2 class="modal__title" id="apply-modal-title">Apply for {{ job.title }}</h2>
          <app-job-application-form [content]="apply()" [jobSlug]="job.slug" [embedded]="true" />
        </div>
      </div>
    }
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .openings {
      padding-block: $section-y-sm;
      background: $surface;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .openings__title {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      color: $navy;

      @include up($bp-md) {
        font-size: 28px;
      }
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 24px;

      @include up($bp-md) {
        gap: 10px;
      }
    }
    .tab {
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.3;
      text-align: left;
      color: $muted;
      background: $white;
      border: 0;
      border-radius: 999px;
      transition:
        background-color 0.2s,
        color 0.2s;

      @include up($bp-md) {
        padding: 10px 18px;
        font-size: 13px;
      }

      &:hover {
        color: $navy;
        background: hsl(214 32% 91%);
      }
    }
    .tab--active,
    .tab--active:hover {
      color: $white;
      background: $navy;
    }

    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
      margin-top: 32px;

      @include up($bp-lg) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }
    }
    .grid > li {
      display: flex;
    }
    .job {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 22px;
      background: $white;
      border: 1px solid $border;
      border-radius: 14px;

      @include up($bp-md) {
        padding: 24px 26px;
      }
    }
    .job__title {
      font-size: 17px;
      font-weight: 600;
      line-height: 1.35;
      color: $navy;
    }
    .job__text {
      // The description is rich text from the admin: show a short preview here, the full text is on the job page.
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      overflow: hidden;
      margin-top: 10px;
      font-size: 14px;
      line-height: 1.65;
      color: $muted;
    }
    .job__text :is(p, ul, ol) {
      margin: 0 0 8px;
    }
    .job__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      margin-block: 14px 20px;
      font-size: 12px;
      color: $muted;

      li {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
    }
    .job__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 20px;
      margin-top: auto;
    }
    .modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow-y: auto;
      background: hsl(222 47% 11% / 0.6);
    }
    .modal__panel {
      position: relative;
      width: 100%;
      max-width: 560px;
      max-height: calc(100dvh - 32px);
      overflow-y: auto;
      padding: 28px 30px 30px;
      background: $white;
      border-radius: 14px;
      box-shadow: 0 20px 50px hsl(222 47% 11% / 0.3);
    }
    .modal__title {
      margin: 0 36px 20px 0;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.25;
      color: $navy;
    }
    .modal__close {
      position: absolute;
      top: 18px;
      right: 18px;
      display: inline-flex;
      padding: 6px;
      color: $muted;
      background: none;
      border: 0;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        color: $navy;
      }
    }
    .job__details {
      font-size: 14px;
      font-weight: 500;
      color: $gold-dark;

      &:hover {
        color: $navy;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpeningsSection {
  readonly title = input.required<string>();
  readonly openings = input.required<JobOpening[]>();
  readonly departments = input.required<string[]>();
  readonly allLabel = input.required<string>();
  readonly applyLabel = input.required<string>();
  readonly detailsLabel = input.required<string>();
  readonly apply = input.required<ApplyFormContent>();

  /** The opening whose application modal is open, or null. */
  protected readonly applying = signal<JobOpening | null>(null);

  @HostListener('document:keydown.escape')
  protected close(): void {
    this.applying.set(null);
  }

  /** Selected department, or null for "all". */
  protected readonly selected = signal<string | null>(null);

  protected readonly visible = computed(() => {
    const department = this.selected();
    return department === null ? this.openings() : this.openings().filter((o) => o.department === department);
  });
}
