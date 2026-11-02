import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';
import { LearningService } from '../../core/services/learning.service';
import { Icon } from '../../shared/icon/icon';
import { RichText } from '../../shared/rich-text/rich-text';

/** One article at /learning/:slug. An unknown slug shows a notice and answers with a real 404 during SSR. */
@Component({
  selector: 'app-article-page',
  imports: [RouterLink, DatePipe, Icon, RichText],
  template: `
    @if (view(); as v) {
      @if (v.article; as a) {
        <article>
          <header class="head">
            <div class="head__inner">
              <a class="back" routerLink="/learning">
                <app-icon name="arrow-left" [size]="16" /> {{ v.content.backToCentreLabel }}
              </a>
              <p class="head__category">{{ a.category }}</p>
              <h1 class="head__title">{{ a.title }}</h1>
              <p class="head__excerpt">{{ a.excerpt }}</p>
              <p class="head__meta">
                <time [attr.datetime]="a.publishedAt">
                  <app-icon name="calendar" [size]="16" /> {{ a.publishedAt | date: 'd MMMM y' }}
                </time>
                <span><app-icon name="clock" [size]="16" /> {{ a.readMinutes }} min read</span>
              </p>
            </div>
          </header>

          <div class="figure">
            <div class="figure__inner">
              <img class="figure__img" [src]="a.image.src" [alt]="a.image.alt" width="1040" height="420" />
            </div>
          </div>

          <div class="body">
            <app-rich-text [html]="a.body" />
            <footer class="body__foot">
              <a class="back" routerLink="/learning">
                <app-icon name="arrow-left" [size]="16" /> {{ v.content.backToArticlesLabel }}
              </a>
            </footer>
          </div>
        </article>
      } @else {
        <section class="missing container">
          <h1>Article not found</h1>
          <p>We could not find that article. It may have been moved or removed.</p>
          <a class="btn btn--gold" routerLink="/learning">{{ v.content.backToCentreLabel }}</a>
        </section>
      }
    }
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .head {
      padding-block: 40px 56px;
      color: $white;
      background: $navy;

      @include up($bp-md) {
        padding-block: 56px 112px;
      }
    }
    // Same width as the image below, so the title lines up with it.
    .head__inner,
    .figure__inner {
      width: min(1040px, 100% - 2 * $container-gutter-sm);
      margin-inline: auto;

      @include up($bp-md) {
        width: min(1040px, 100% - 2 * $container-gutter);
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
    .head__category {
      margin-top: 28px;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $gold;
    }
    .head__title {
      margin-top: 12px;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.01em;

      @include up($bp-md) {
        font-size: 52px;
      }
    }
    .head__excerpt {
      max-width: 672px;
      margin-top: 20px;
      font-size: 17px;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.7);

      @include up($bp-md) {
        font-size: 18px;
      }
    }
    .head__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      margin-top: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);

      time,
      span {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
    }

    // The navy header runs behind the top half of the image.
    .figure {
      background: linear-gradient($navy 50%, $white 50%);

      @include down($bp-md) {
        background: $navy;
      }
    }
    .figure__img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 14px;
      box-shadow: $shadow-lg;

      @include up($bp-md) {
        height: 420px;
      }
    }

    .body {
      width: min(860px, 100% - 2 * $container-gutter-sm);
      margin-inline: auto;
      padding-block: 40px $section-y-sm;

      @include up($bp-md) {
        width: min(860px, 100% - 2 * $container-gutter);
        padding-block: 56px $section-y;
      }
    }
    .body__foot {
      margin-top: 56px;
      padding-top: 28px;
      border-top: 1px solid $border;

      .back {
        color: $gold-dark;

        &:hover {
          color: $navy;
        }
      }
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
export class ArticlePage {
  private readonly learning = inject(LearningService);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  protected readonly view = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((params) => params.get('slug') ?? ''),
      switchMap((slug) => this.learning.getArticle(slug)),
      switchMap((article) =>
        this.learning.getLearning().pipe(
          map((content) => ({ article, content })),
          tap(({ article }) => {
            if (!article && this.responseInit) this.responseInit.status = 404;
          }),
        ),
      ),
    ),
  );
}
