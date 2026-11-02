import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CareerPerk } from '../../../core/models/careers';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

@Component({
  selector: 'app-perks-section',
  imports: [Icon, Reveal],
  template: `
    <section class="perks" aria-labelledby="perks-title">
      <div class="container">
        <h2 class="perks__title" id="perks-title" [appReveal]="0">{{ title() }}</h2>
        <ul class="perks__grid">
          @for (p of perks(); track p.title; let i = $index) {
            <li class="perk" [appReveal]="i * 100">
              <span class="perk__icon"><app-icon [name]="p.icon" [size]="40" /></span>
              <h3 class="perk__title">{{ p.title }}</h3>
              <p class="perk__text">{{ p.text }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .perks {
      padding-block: $section-y-sm;
      background: $white;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .perks__title {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      color: $navy;

      @include up($bp-md) {
        font-size: 28px;
      }
    }
    .perks__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
      margin-top: 40px;

      @include up($bp-sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @include up($bp-lg) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 24px;
      }
    }
    .perk {
      height: 100%;
      padding: 32px 24px;
      text-align: center;
      background: $surface;
      border-radius: 14px;
    }
    .perk__icon {
      display: inline-flex;
      color: $gold;
    }
    .perk__title {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: $navy;
    }
    .perk__text {
      margin-top: 8px;
      font-size: 13px;
      line-height: 1.6;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerksSection {
  readonly title = input.required<string>();
  readonly perks = input.required<CareerPerk[]>();
}
