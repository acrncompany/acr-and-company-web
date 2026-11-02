import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ValuesSection as ValuesContent } from '../../../core/models/about';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-values-section',
  imports: [Icon, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="values">
      <div class="container">
        <div [appReveal]="0">
          <app-section-heading [eyebrow]="s.heading.eyebrow" [title]="s.heading.title" />
        </div>
        <ul class="values__grid">
          <!-- The <li> only carries the scroll reveal; the hover effect lives on the inner card so the two transitions never override each other. -->
          @for (v of s.items; track v.title; let i = $index) {
            <li [appReveal]="150 + i * 150">
              <div class="card">
                <span class="card__icon"><app-icon [name]="v.icon" [size]="32" /></span>
                <h3 class="card__title">{{ v.title }}</h3>
                <p class="card__text">{{ v.description }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .values {
      padding-block: $section-y-sm;
      background: $surface;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .values__grid {
      display: grid;
      gap: 24px;
      margin-top: 48px;

      @include up($bp-md) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 32px;
      }
    }
    .card {
      height: 100%;
      padding: 32px;
      text-align: center;
      background: $white;
      border: 1px solid $border;
      border-radius: 12px;
      transition:
        transform 0.3s ease,
        box-shadow 0.3s ease,
        border-color 0.3s ease;

      &:hover {
        transform: translateY(-6px);
        border-color: hsl(44 53% 54% / 0.5);
        box-shadow: $shadow-lg;
      }
      &:hover .card__icon {
        color: $navy;
        background: $gold;
        transform: scale(1.1);
      }
    }
    .card__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      color: $gold;
      background: hsl(44 53% 54% / 0.12);
      border-radius: 50%;
      transition:
        transform 0.3s ease,
        background-color 0.3s ease,
        color 0.3s ease;
    }
    .card__title {
      margin-top: 16px;
      font-size: 20px;
      font-weight: 700;
      color: $navy;
    }
    .card__text {
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.6;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValuesSection {
  readonly section = input.required<ValuesContent>();
}
