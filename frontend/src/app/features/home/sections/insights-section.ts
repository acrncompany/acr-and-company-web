import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InsightsSection } from '../../../core/models/home';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

@Component({
  selector: 'app-insights-section',
  imports: [RouterLink, DatePipe, Icon, Reveal],
  template: `
    @let s = section();
    <section class="insights">
      <div class="container">
        <header class="insights__head">
          <div>
            <p class="insights__eyebrow">{{ s.heading.eyebrow }}</p>
            <h2 class="insights__title">{{ s.heading.title }}</h2>
          </div>
          <a class="btn insights__all" [routerLink]="s.viewAll.path">
            {{ s.viewAll.label }}
            <app-icon name="arrow-right" [size]="16" />
          </a>
        </header>

        <div class="insights__grid">
          @if (s.featured; as f) {
            <article class="featured" [appReveal]="0" revealFrom="left">
              <a class="featured__link" [routerLink]="f.path">
                <img
                  class="featured__img"
                  [src]="f.image.src"
                  [alt]="f.image.alt"
                  width="590"
                  height="256"
                  loading="lazy"
                />
                <div class="featured__body">
                  <p class="category">{{ f.category }}</p>
                  <h3 class="featured__title">{{ f.title }}</h3>
                  @if (f.excerpt) {
                    <p class="featured__excerpt">{{ f.excerpt }}</p>
                  }
                </div>
              </a>
            </article>
          }

          <ul class="list">
            @for (a of s.articles; track a.slug; let i = $index) {
              <li [appReveal]="150 + i * 120" revealFrom="right">
                <article class="item">
                  <a class="item__link" [routerLink]="a.path">
                    <img class="item__img" [src]="a.image.src" [alt]="a.image.alt" width="160" height="195" loading="lazy" />
                    <div class="item__body">
                      <p class="category category--sm">{{ a.category }}</p>
                      <h3 class="item__title">{{ a.title }}</h3>
                      @if (a.excerpt) {
                        <p class="item__excerpt">{{ a.excerpt }}</p>
                      }
                      @if (a.publishedAt || a.readMinutes) {
                        <p class="item__meta">
                          @if (a.publishedAt) {
                            <time [attr.datetime]="a.publishedAt">{{ a.publishedAt | date: 'd MMM' }}</time>
                          }
                          @if (a.readMinutes) {
                            <span>{{ a.readMinutes }} min read</span>
                          }
                        </p>
                      }
                    </div>
                  </a>
                </article>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .insights {
      padding-block: $section-y-sm;
      overflow-x: clip; // cards slide in from the sides; never cause a horizontal scrollbar
      background: $white;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .insights__head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
    }
    .insights__eyebrow {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $gold;
    }
    .insights__title {
      margin-top: 12px;
      font-size: 30px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.01em;
      color: $navy;

      @include up($bp-md) {
        font-size: 40px;
      }
    }
    .insights__all {
      display: none;
      color: $navy;
      background: $white;
      border-color: $border;

      &:hover {
        background: $surface;
      }

      @include up($bp-md) {
        display: inline-flex;
      }
    }
    .insights__grid {
      display: grid;
      gap: 24px;
      margin-top: 40px;

      @include up($bp-lg) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 32px;
      }
    }
    .category {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: $gold;

      &--sm {
        font-size: 11px;
      }
    }

    // Featured card
    .featured {
      height: 100%;
      overflow: hidden;
      border: 1px solid $border;
      border-radius: 12px;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: $shadow-md;
      }
    }
    .featured__link {
      display: block;
      height: 100%;
    }
    .featured__img {
      width: 100%;
      height: 256px;
      object-fit: cover;
    }
    .featured__body {
      padding: 24px;

      @include up($bp-md) {
        padding: 32px;
      }
    }
    .featured__title {
      margin-top: 12px;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
      color: $navy;

      @include up($bp-md) {
        font-size: 26px;
      }
    }
    .featured__excerpt {
      margin-top: 16px;
      font-size: 15px;
      line-height: 1.75;
      color: $muted;
    }

    // Side list
    .list {
      display: grid;
      gap: 16px;
    }
    .item {
      overflow: hidden;
      border: 1px solid $border;
      border-radius: 12px;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: $shadow-md;
      }
    }
    .item__link {
      display: flex;
      min-height: 140px;
    }
    .item__img {
      flex: none;
      width: 110px;
      object-fit: cover;

      @include up($bp-sm) {
        width: 160px;
      }
    }
    .item__body {
      padding: 16px 20px;
    }
    .item__title {
      margin-top: 8px;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;
      color: $navy;

      @include up($bp-md) {
        font-size: 18px;
      }
    }
    .item__excerpt {
      display: -webkit-box;
      margin-top: 8px;
      overflow: hidden;
      font-size: 13px;
      line-height: 1.65;
      color: $muted;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;

      @include down($bp-sm) {
        display: none;
      }
    }
    .item__meta {
      display: flex;
      gap: 12px;
      margin-top: 10px;
      font-size: 11px;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsSectionComponent {
  readonly section = input.required<InsightsSection>();
}
