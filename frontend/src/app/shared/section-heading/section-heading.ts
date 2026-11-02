import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Eyebrow + title + optional subtitle block used by every Home section. */
@Component({
  selector: 'app-section-heading',
  template: `
    <header class="heading" [class.heading--left]="align() === 'left'">
      <p class="heading__eyebrow">{{ eyebrow() }}</p>
      <h2 class="heading__title">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="heading__subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .heading {
      max-width: 680px;
      margin-inline: auto;
      text-align: center;
    }
    .heading--left {
      margin-inline: 0;
      text-align: left;
    }
    .heading__eyebrow {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $gold;
    }
    .heading__title {
      margin-top: 12px;
      font-size: 30px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.01em;
      color: $navy;

      @include up($bp-md) {
        font-size: 40px;
      }
    }
    .heading__subtitle {
      margin-top: 16px;
      font-size: 16px;
      line-height: 1.7;
      color: $muted;

      @include up($bp-md) {
        font-size: 18px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeading {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly align = input<'center' | 'left'>('center');
}
