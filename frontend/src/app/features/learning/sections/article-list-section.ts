import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningArticle } from '../../../core/models/learning';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

/** Filter tabs plus a grid of article cards. The first tab (null) shows every article. */
@Component({
  selector: 'app-article-list-section',
  imports: [RouterLink, DatePipe, Icon, Reveal],
  template: `
    <section class="list">
      <div class="container">
        <div class="tabs" role="group" aria-label="Filter articles by category" [appReveal]="0">
          <button
            type="button"
            class="tab"
            [class.tab--active]="selected() === null"
            [attr.aria-pressed]="selected() === null"
            (click)="selected.set(null)"
          >
            {{ allLabel() }}
          </button>
          @for (c of categories(); track c) {
            <button
              type="button"
              class="tab"
              [class.tab--active]="selected() === c"
              [attr.aria-pressed]="selected() === c"
              (click)="selected.set(c)"
            >
              {{ c }}
            </button>
          }
        </div>

        <ul class="grid">
          @for (a of visible(); track a.slug; let i = $index) {
            <li [appReveal]="(i % 3) * 100">
              <article class="card">
                <a class="card__link" [routerLink]="['/learning', a.slug]">
                  <img class="card__img" [src]="a.image.src" [alt]="a.image.alt" width="480" height="240" loading="lazy" />
                  <div class="card__body">
                    <p class="card__category">{{ a.category }}</p>
                    <h2 class="card__title">{{ a.title }}</h2>
                    <p class="card__excerpt">{{ a.excerpt }}</p>
                    <div class="card__foot">
                      <time class="card__date" [attr.datetime]="a.publishedAt">
                        <app-icon name="calendar" [size]="14" />
                        {{ a.publishedAt | date: 'd MMMM y' }}
                      </time>
                      <span class="card__read">
                        {{ readLabel() }} <app-icon name="arrow-right" [size]="14" />
                      </span>
                    </div>
                  </div>
                </a>
              </article>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .list {
      padding-block: 40px $section-y-sm;
      background: $white;

      @include up($bp-md) {
        padding-block: 64px $section-y;
      }
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      @include up($bp-md) {
        gap: 10px;
      }
    }
    .tab {
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
      color: $muted;
      background: $surface;
      border: 0;
      border-radius: 999px;
      transition:
        background-color 0.2s,
        color 0.2s;

      @include up($bp-md) {
        padding: 12px 20px;
        font-size: 15px;
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
      gap: 24px;
      margin-top: 32px;

      @include up($bp-md) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-top: 48px;
      }
      @include up($bp-lg) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 32px;
      }
    }
    .card {
      height: 100%;
      overflow: hidden;
      background: $white;
      border: 1px solid $border;
      border-radius: 12px;
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: $shadow-md;
      }
    }
    .card__link {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .card__img {
      width: 100%;
      height: 200px;
      object-fit: cover;

      @include up($bp-lg) {
        height: 240px;
      }
    }
    .card__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 24px;
    }
    .card__category {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: $gold-dark;
    }
    .card__title {
      margin-top: 12px;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.35;
      color: $navy;
    }
    .card__excerpt {
      margin-top: 12px;
      font-size: 15px;
      line-height: 1.7;
      color: $muted;
    }
    .card__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: auto;
      padding-top: 20px;
      font-size: 14px;
    }
    .card__date {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: $muted;
    }
    .card__read {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      color: $gold-dark;
    }
    .card:hover .card__read {
      color: $navy;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListSection {
  readonly articles = input.required<LearningArticle[]>();
  readonly categories = input.required<string[]>();
  readonly allLabel = input.required<string>();
  readonly readLabel = input.required<string>();

  /** Selected category, or null for "all". */
  protected readonly selected = signal<string | null>(null);

  protected readonly visible = computed(() => {
    const category = this.selected();
    return category === null ? this.articles() : this.articles().filter((a) => a.category === category);
  });
}
