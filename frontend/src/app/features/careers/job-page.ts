import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { CareersService } from '../../core/services/careers.service';
import { Icon } from '../../shared/icon/icon';
import { RichText } from '../../shared/rich-text/rich-text';
import { JobApplicationForm } from './sections/job-application-form';

/** One open position at /careers/:slug. An unknown or closed position shows a notice and answers with a real 404 during SSR. */
@Component({
  selector: 'app-job-page',
  imports: [RouterLink, DatePipe, Icon, RichText, JobApplicationForm],
  template: `
    @if (view(); as v) {
      @if (v.job; as j) {
        <article>
          <header class="head">
            <div class="inner">
              <a class="back" routerLink="/careers">
                <app-icon name="arrow-left" [size]="16" /> {{ v.content.backLabel }}
              </a>
              <h1 class="head__title">{{ j.title }}</h1>
              <ul class="head__meta">
                <li><app-icon name="map-pin" [size]="16" /> {{ j.location }}</li>
                <li><app-icon name="clock" [size]="16" /> {{ j.type }}</li>
                @if (j.department) {
                  <li><app-icon name="building" [size]="16" /> {{ j.department }}</li>
                }
                <li>
                  <app-icon name="calendar" [size]="16" />
                  <time [attr.datetime]="j.postedAt">{{ j.postedAt | date: 'd MMM y' }}</time>
                </li>
                @if (j.closingDate) {
                  <li>
                    <app-icon name="calendar" [size]="16" /> {{ v.content.closingLabel }}:
                    <time [attr.datetime]="j.closingDate">{{ j.closingDate | date: 'd MMM y' }}</time>
                  </li>
                }
                @if (j.salary) {
                  <li>{{ v.content.salaryLabel }}: {{ j.salary }}</li>
                }
              </ul>
            </div>
          </header>

          <div class="body">
            <section aria-labelledby="job-description">
              <h2 class="body__heading" id="job-description">{{ v.content.descriptionTitle }}</h2>
              <app-rich-text [html]="j.description" />
            </section>
            @if (j.requirements) {
              <section aria-labelledby="job-requirements">
                <h2 class="body__heading" id="job-requirements">{{ v.content.requirementsTitle }}</h2>
                <app-rich-text [html]="j.requirements" />
              </section>
            }
            <app-job-application-form [content]="v.content.apply" [jobSlug]="j.slug" />
            <div class="body__actions">
              <a class="btn btn--gold" [routerLink]="[]" fragment="apply">{{ v.content.applyLabel }}</a>
              <a class="back back--dark" routerLink="/careers">
                <app-icon name="arrow-left" [size]="16" /> {{ v.content.backLabel }}
              </a>
            </div>
          </div>
        </article>
      } @else {
        <section class="missing container">
          <h1>Position not found</h1>
          <p>This position is no longer open, or the link is wrong.</p>
          <a class="btn btn--gold" routerLink="/careers">{{ v.content.backLabel }}</a>
        </section>
      }
    }
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .head {
      padding-block: 40px 48px;
      color: $white;
      background: $navy;

      @include up($bp-md) {
        padding-block: 56px 72px;
      }
    }
    .inner,
    .body {
      width: min(860px, 100% - 2 * $container-gutter-sm);
      margin-inline: auto;

      @include up($bp-md) {
        width: min(860px, 100% - 2 * $container-gutter);
      }
    }
    .back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: $gold;

      &:hover {
        color: $white;
      }
    }
    .back--dark:hover {
      color: $navy;
    }
    .head__title {
      margin-top: 24px;
      font-size: 30px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.01em;

      @include up($bp-md) {
        font-size: 44px;
      }
    }
    .head__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      margin-top: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);

      li {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
    }
    .body {
      padding-block: 40px $section-y-sm;

      @include up($bp-md) {
        padding-block: 56px $section-y;
      }
    }
    .body__heading {
      margin-top: 32px;
      font-size: 22px;
      font-weight: 700;
      color: $navy;

      &#job-description {
        margin-top: 0;
      }
    }
    .body__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px 28px;
      margin-top: 48px;
      padding-top: 28px;
      border-top: 1px solid $border;
    }
    .missing {
      padding-block: 120px;
      text-align: center;

      h1 {
        font-size: 36px;
        font-weight: 700;
        color: $navy;
      }
      p {
        margin: 12px 0 28px;
        color: $muted;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobPage {
  private readonly careers = inject(CareersService);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  protected readonly view = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((params) => params.get('slug') ?? ''),
      switchMap((slug) => forkJoin({ job: this.careers.getJob(slug), content: this.careers.getCareers() })),
      tap(({ job }) => {
        if (!job && this.responseInit) this.responseInit.status = 404;
      }),
    ),
  );
}
