import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IndustriesSection } from '../../../core/models/home';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-industries-section',
  imports: [Icon, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="industries">
      <div class="container">
        <app-section-heading [eyebrow]="s.heading.eyebrow" [title]="s.heading.title" [subtitle]="s.heading.subtitle" />
        <ul class="industries__grid">
          @for (i of s.items; track i.label; let n = $index) {
            <li class="industry" [appReveal]="n * 80">
              <span class="industry__icon" [class]="'industry__icon tone-' + i.tone">
                <app-icon [name]="i.icon" [size]="28" />
              </span>
              <span class="industry__label">{{ i.label }}</span>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .industries {
      padding-block: $section-y-sm;
      background: $surface;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .industries__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px 16px;
      margin-top: 48px;

      @include up($bp-sm) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      @include up($bp-lg) {
        grid-template-columns: repeat(8, minmax(0, 1fr));
      }
    }
    .industry {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .industry__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      transition: transform 0.2s;
    }
    .industry:hover .industry__icon {
      transform: translateY(-3px);
    }
    .industry__label {
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      color: $foreground;
    }
    .tone-blue {
      color: #2563eb;
      background: rgb(59 130 246 / 0.1);
    }
    .tone-amber {
      color: #d97706;
      background: rgb(245 158 11 / 0.1);
    }
    .tone-green {
      color: #16a34a;
      background: rgb(34 197 94 / 0.1);
    }
    .tone-violet {
      color: #7c3aed;
      background: rgb(139 92 246 / 0.1);
    }
    .tone-rose {
      color: #e11d48;
      background: rgb(244 63 94 / 0.1);
    }
    .tone-orange {
      color: #ea580c;
      background: rgb(249 115 22 / 0.1);
    }
    .tone-teal {
      color: #0d9488;
      background: rgb(20 184 166 / 0.1);
    }
    .tone-slate {
      color: #475569;
      background: rgb(100 116 139 / 0.12);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndustriesSectionComponent {
  readonly section = input.required<IndustriesSection>();
}
