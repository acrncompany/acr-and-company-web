import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApproachSection } from '../../../core/models/home';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-approach-section',
  imports: [Icon, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="approach">
      <div class="container approach__grid">
        <div class="approach__body" [appReveal]="0" revealFrom="left">
          <app-section-heading
            align="left"
            [eyebrow]="s.heading.eyebrow"
            [title]="s.heading.title"
            [subtitle]="s.heading.subtitle"
          />
          <ol class="steps">
            @for (step of s.steps; track step.title) {
              <li class="step">
                <span class="step__icon"><app-icon [name]="step.icon" [size]="22" /></span>
                <div>
                  <h3 class="step__title">{{ step.title }}</h3>
                  <p class="step__text">{{ step.description }}</p>
                </div>
              </li>
            }
          </ol>
        </div>
        <div class="approach__media" [appReveal]="150" revealFrom="right">
          <img class="approach__img" [src]="s.image.src" [alt]="s.image.alt" width="584" height="584" loading="lazy" />
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .approach {
      padding-block: $section-y-sm;
      overflow-x: clip; // the columns slide in from the sides; never cause a horizontal scrollbar
      background: $surface;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .approach__grid {
      display: grid;
      gap: 48px;
      align-items: center;

      @include up($bp-lg) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 64px;
      }
    }
    .steps {
      display: grid;
      gap: 28px;
      margin-top: 36px;
      padding: 0;
      list-style: none;
    }
    .step {
      display: flex;
      gap: 16px;
    }
    .step__icon {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      color: $gold;
      background: hsl(44 53% 54% / 0.14);
      border-radius: 12px;
    }
    .step__title {
      font-size: 18px;
      font-weight: 600;
      line-height: 1.35;
      color: $navy;
    }
    .step__text {
      margin-top: 4px;
      font-size: 15px;
      line-height: 1.7;
      color: $muted;
    }
    .approach__media {
      position: relative;
      margin: 16px 16px 0 0;

      &::before,
      &::after {
        content: '';
        position: absolute;
        z-index: 0;
        border-radius: 16px;
      }
      &::before {
        top: -16px;
        right: -16px;
        width: 64px;
        height: 64px;
        background: hsl(44 53% 94%);
      }
      &::after {
        bottom: -16px;
        left: -16px;
        width: 96px;
        height: 96px;
        background: hsl(214 32% 91%);
      }
    }
    .approach__img {
      position: relative;
      z-index: 1;
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: $shadow-lg;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproachSectionComponent {
  readonly section = input.required<ApproachSection>();
}
