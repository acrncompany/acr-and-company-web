import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ContactHeroContent } from '../../../core/models/contact';

@Component({
  selector: 'app-contact-hero-section',
  template: `
    @let h = hero();
    <section class="banner" aria-labelledby="contact-title">
      <div class="container">
        <p class="banner__eyebrow">{{ h.eyebrow }}</p>
        <h1 class="banner__title" id="contact-title">{{ h.title }}</h1>
        <p class="banner__subtitle">{{ h.subtitle }}</p>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .banner {
      padding-block: 48px 56px;
      color: $white;
      background: $navy;

      @include up($bp-md) {
        padding-block: 64px 80px;
      }
    }
    .banner__eyebrow {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $gold;
    }
    .banner__title {
      margin-top: 8px;
      font-size: 30px;
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.01em;

      @include up($bp-md) {
        font-size: 40px;
      }
    }
    .banner__subtitle {
      max-width: 672px;
      margin-top: 16px;
      font-size: 15px;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.7);

      @include up($bp-md) {
        font-size: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactHeroSection {
  readonly hero = input.required<ContactHeroContent>();
}
