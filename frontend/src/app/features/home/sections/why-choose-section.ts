import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WhyChooseSection } from '../../../core/models/home';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-why-choose-section',
  imports: [Icon, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="why">
      <div class="container why__grid">
        <div class="why__media" [appReveal]="0" revealFrom="left">
          <img class="why__img" [src]="s.image.src" [alt]="s.image.alt" width="584" height="584" loading="lazy" />
        </div>
        <div class="why__body" [appReveal]="150" revealFrom="right">
          <app-section-heading
            align="left"
            [eyebrow]="s.heading.eyebrow"
            [title]="s.heading.title"
            [subtitle]="s.heading.subtitle"
          />
          <ul class="why__features">
            @for (f of s.features; track f.title) {
              <li class="feature">
                <span class="feature__icon"><app-icon [name]="f.icon" [size]="20" /></span>
                <div>
                  <h3 class="feature__title">{{ f.title }}</h3>
                  <p class="feature__text">{{ f.description }}</p>
                </div>
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

    .why {
      padding-block: $section-y-sm;
      overflow-x: clip; // the columns slide in from the sides; never cause a horizontal scrollbar
      background: $white;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .why__grid {
      display: grid;
      gap: 48px;
      align-items: center;

      @include up($bp-lg) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 64px;
      }
    }
    // Decorative offset blocks behind the photo.
    .why__media {
      position: relative;
      margin: 16px 0 0 16px;

      &::before,
      &::after {
        content: '';
        position: absolute;
        z-index: 0;
        border-radius: 16px;
      }
      &::before {
        top: -16px;
        left: -16px;
        width: 64px;
        height: 64px;
        background: hsl(214 32% 93%);
      }
      &::after {
        right: -16px;
        bottom: -16px;
        width: 112px;
        height: 112px;
        background: hsl(44 53% 94%);
      }
    }
    .why__img {
      position: relative;
      z-index: 1;
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: $shadow-lg;
    }
    .why__features {
      display: grid;
      gap: 24px 32px;
      margin-top: 32px;

      @include up($bp-sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .feature {
      display: flex;
      gap: 14px;
    }
    .feature__icon {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: $gold;
      background: hsl(44 53% 54% / 0.12);
      border-radius: 10px;
    }
    .feature__title {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.35;
      color: $navy;
    }
    .feature__text {
      margin-top: 4px;
      font-size: 14px;
      line-height: 1.7;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyChooseSectionComponent {
  readonly section = input.required<WhyChooseSection>();
}
