import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroContent } from '../../../core/models/home';
import { CountUp } from '../../../shared/count-up/count-up';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, CountUp],
  template: `
    @let h = hero();
    <section class="hero" aria-labelledby="hero-title">
      <img class="hero__bg" [src]="h.background.src" [alt]="h.background.alt" [style.opacity]="(h.backgroundOpacity ?? 100) / 100" fetchpriority="high" />
      <div class="container hero__inner">
        <p class="hero__eyebrow">{{ h.eyebrow }}</p>
        <h1 class="hero__title" id="hero-title">
          {{ h.title }} <span class="hero__highlight">{{ h.highlight }}</span>
        </h1>
        <p class="hero__subtitle">{{ h.subtitle }}</p>
        <div class="hero__actions">
          <a class="btn btn--gold hero__btn" [routerLink]="h.primaryCta.path">{{ h.primaryCta.label }}</a>
          <a class="btn btn--outline-light hero__btn" [routerLink]="h.secondaryCta.path">{{ h.secondaryCta.label }}</a>
        </div>
        <dl class="hero__stats">
          @for (s of h.stats; track s.label) {
            <div class="hero__stat">
              <dt class="hero__stat-value"><app-count-up [value]="s.value" /></dt>
              <dd class="hero__stat-label">{{ s.label }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .hero {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 560px;
      overflow: hidden;
      background: hsl(213 73% 15%);
      color: $white;

      @include up($bp-md) {
        min-height: calc(100vh - #{$header-height} - 4px);
      }
    }
    .hero__bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero__inner {
      position: relative;
      max-width: 800px;
      padding-block: 64px;
    }
    .hero__eyebrow {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $gold;
    }
    .hero__title {
      margin-top: 16px;
      font-size: 38px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.02em;

      @include up($bp-md) {
        font-size: 60px;
      }
    }
    .hero__highlight {
      color: $gold;
    }
    .hero__subtitle {
      max-width: 640px;
      margin-top: 24px;
      font-size: 18px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);

      @include up($bp-md) {
        font-size: 20px;
      }
    }
    .hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 32px;
    }
    .hero__btn {
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 500;
    }
    .hero__stats {
      display: flex;
      flex-wrap: wrap;
      gap: 24px 40px;
      margin: 48px 0 0;
    }
    .hero__stat {
      margin: 0;
    }
    .hero__stat-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
      color: $gold;

      @include up($bp-md) {
        font-size: 38px;
      }
    }
    .hero__stat-label {
      margin: 4px 0 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.78);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  readonly hero = input.required<HeroContent>();
}
