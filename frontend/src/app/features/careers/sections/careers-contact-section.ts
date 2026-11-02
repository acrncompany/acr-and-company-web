import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CareersContactContent } from '../../../core/models/careers';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

@Component({
  selector: 'app-careers-contact-section',
  imports: [Icon, Reveal],
  template: `
    @let c = contact();
    <section class="touch" aria-labelledby="touch-title">
      <div class="container" [appReveal]="0">
        <h2 class="touch__title" id="touch-title">{{ c.title }}</h2>
        <p class="touch__text">{{ c.text }}</p>
        <ul class="touch__list">
          @for (email of c.emails; track email) {
            <li>
              <a class="touch__link" [href]="'mailto:' + email"><app-icon name="mail" [size]="18" /> {{ email }}</a>
            </li>
          }
          <li>
            <a class="touch__link" [href]="'tel:' + c.phoneRaw"><app-icon name="phone" [size]="18" /> {{ c.phone }}</a>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .touch {
      padding-block: $section-y-sm;
      text-align: center;
      background: $white;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .touch__title {
      font-size: 24px;
      font-weight: 700;
      color: $navy;

      @include up($bp-md) {
        font-size: 28px;
      }
    }
    .touch__text {
      max-width: 640px;
      margin: 16px auto 0;
      font-size: 15px;
      line-height: 1.7;
      color: $muted;
    }
    .touch__list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px 32px;
      margin-top: 28px;
    }
    .touch__link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: $muted;
      transition: color 0.2s;

      app-icon {
        color: $gold;
      }

      &:hover {
        color: $navy;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareersContactSection {
  readonly contact = input.required<CareersContactContent>();
}
