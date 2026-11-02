import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaContent } from '../../../core/models/site';
import { Reveal } from '../../../shared/reveal/reveal';

@Component({
  selector: 'app-services-cta-section',
  imports: [RouterLink, Reveal],
  template: `
    @let c = cta();
    <section class="cta">
      <div class="container">
        <div class="cta__box" [appReveal]="0">
          <h2 class="cta__title">{{ c.title }}</h2>
          <p class="cta__text">{{ c.text }}</p>
          <a class="btn btn--gold" [routerLink]="c.path">{{ c.buttonLabel }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .cta {
      padding-bottom: $section-y-sm;

      @include up($bp-md) {
        padding-bottom: $section-y;
      }
    }
    .cta__box {
      padding: 48px 24px;
      text-align: center;
      background: $surface;
      border-radius: 16px;

      @include up($bp-md) {
        padding: 64px 32px;
      }
    }
    .cta__title {
      font-size: 26px;
      font-weight: 700;
      color: $navy;

      @include up($bp-md) {
        font-size: 30px;
      }
    }
    .cta__text {
      margin: 12px 0 28px;
      font-size: 17px;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesCtaSection {
  readonly cta = input.required<CtaContent>();
}
