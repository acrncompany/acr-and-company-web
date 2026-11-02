import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NetworkSection as NetworkContent } from '../../../core/models/about';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

@Component({
  selector: 'app-network-section',
  imports: [Icon, Reveal],
  template: `
    @let s = section();
    <section class="network" aria-labelledby="network-title">
      <div class="container">
        <header class="network__head" [appReveal]="0">
          <p class="network__eyebrow">{{ s.heading.eyebrow }}</p>
          <h2 class="network__title" id="network-title">{{ s.heading.title }}</h2>
          <p class="network__subtitle">{{ s.heading.subtitle }}</p>
        </header>
        <ul class="network__grid">
          @for (city of s.locations; track city; let i = $index) {
            <li class="chip" [appReveal]="i * 50">
              <app-icon name="map-pin" [size]="16" />
              <span>{{ city }}</span>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .network {
      padding-block: $section-y-sm;
      color: $white;
      background: $navy;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .network__head {
      max-width: 680px;
      margin-inline: auto;
      text-align: center;
    }
    .network__eyebrow {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $gold;
    }
    .network__title {
      margin-top: 12px;
      font-size: 30px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.01em;

      @include up($bp-md) {
        font-size: 40px;
      }
    }
    .network__subtitle {
      margin-top: 16px;
      font-size: 16px;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.6);

      @include up($bp-md) {
        font-size: 18px;
      }
    }
    .network__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 48px;

      @include up($bp-md) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 24px;
      }
    }
    .chip {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      padding: 16px 12px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;

      app-icon {
        color: $gold;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkSection {
  readonly section = input.required<NetworkContent>();
}
