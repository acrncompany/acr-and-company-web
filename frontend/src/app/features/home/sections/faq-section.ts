import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FaqSection } from '../../../core/models/home';
import { Icon } from '../../../shared/icon/icon';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-faq-section',
  imports: [Icon, SectionHeading],
  template: `
    @let s = section();
    <section class="faq">
      <div class="container">
        <app-section-heading [eyebrow]="s.heading.eyebrow" [title]="s.heading.title" [subtitle]="s.heading.subtitle" />
        <div class="faq__grid">
          <aside class="aside">
            <span class="aside__icon"><app-icon [name]="s.aside.icon" [size]="28" /></span>
            <h3 class="aside__title">{{ s.aside.title }}</h3>
            <p class="aside__text">{{ s.aside.text }}</p>
          </aside>

          <div class="accordion">
            @for (item of s.items; track item.question; let i = $index) {
              <div class="qa" [class.qa--open]="open() === i">
                <h3 class="qa__heading">
                  <button
                    type="button"
                    class="qa__button"
                    [id]="'faq-q-' + i"
                    [attr.aria-expanded]="open() === i"
                    [attr.aria-controls]="'faq-a-' + i"
                    (click)="toggle(i)"
                  >
                    <span>{{ item.question }}</span>
                    <app-icon [name]="open() === i ? 'chevron-up' : 'chevron-down'" [size]="18" />
                  </button>
                </h3>
                @if (open() === i) {
                  <div class="qa__panel" role="region" [id]="'faq-a-' + i" [attr.aria-labelledby]="'faq-q-' + i">
                    <p>{{ item.answer }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .faq {
      padding-block: $section-y-sm;
      background: $white;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .faq__grid {
      display: grid;
      gap: 32px;
      margin-top: 48px;

      @include up($bp-lg) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.75fr);
        gap: 64px;
      }
    }
    .aside__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      color: $gold;
      background: hsl(44 53% 54% / 0.14);
      border-radius: 12px;
    }
    .aside__title {
      margin-top: 24px;
      font-size: 20px;
      font-weight: 600;
      color: $navy;
    }
    .aside__text {
      max-width: 400px;
      margin-top: 12px;
      font-size: 15px;
      line-height: 1.7;
      color: $muted;
    }
    .accordion {
      padding: 8px 16px;
      background: $white;
      border: 1px solid $border;
      border-radius: 20px;
      box-shadow: $shadow-sm;

      @include up($bp-md) {
        padding: 8px 20px;
      }
    }
    .qa + .qa {
      border-top: 1px solid $border;
    }
    .qa__button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
      padding: 20px 4px;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.4;
      text-align: left;
      color: $navy;
      background: none;
      border: 0;
    }
    .qa__panel {
      padding: 0 4px 22px;
      font-size: 15px;
      line-height: 1.7;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqSectionComponent {
  readonly section = input.required<FaqSection>();
  /** Index of the open question; the first one starts open (as on the live site). */
  protected readonly open = signal(0);

  protected toggle(i: number): void {
    this.open.update((o) => (o === i ? -1 : i));
  }
}
