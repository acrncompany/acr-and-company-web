import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoreServicesSection } from '../../../core/models/home';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-core-services-section',
  imports: [RouterLink, Icon, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="services">
      <div class="container">
        <app-section-heading [eyebrow]="s.heading.eyebrow" [title]="s.heading.title" [subtitle]="s.heading.subtitle" />
        <ul class="services__grid">
          @for (item of s.items; track item.title; let i = $index) {
            <li [appReveal]="i * 100">
              <a class="card" [routerLink]="item.path">
                <span class="card__icon"><app-icon [name]="item.icon" [size]="24" /></span>
                <h3 class="card__title">{{ item.title }}</h3>
                <p class="card__text">{{ item.description }}</p>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .services {
      padding-block: $section-y-sm;
      background: $surface;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .services__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      align-items: start;
      margin-top: 48px;

      @include up($bp-sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @include up($bp-md) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      @include up($bp-lg) {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
    }
    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      text-align: center;
      background: $white;
      border-radius: 12px;
      box-shadow: $shadow-sm;
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-md;
      }
    }
    .card__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      color: $gold;
      background: hsl(44 53% 54% / 0.12);
      border-radius: 12px;
    }
    .card__title {
      margin-top: 16px;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.35;
      color: $navy;
    }
    .card__text {
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.55;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreServicesSectionComponent {
  readonly section = input.required<CoreServicesSection>();
}
