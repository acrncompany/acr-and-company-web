import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ContactDetail, ContactMapContent } from '../../../core/models/contact';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

/** Office address, business hours and the map. */
@Component({
  selector: 'app-contact-info-section',
  imports: [Icon, Reveal],
  template: `
    <aside [appReveal]="100">
      <section>
        <h2 class="heading">{{ addressTitle() }}</h2>
        <ul class="details">
          @for (d of address(); track d.text) {
            <li>
              <app-icon [name]="d.icon" [size]="18" />
              @if (d.href) {
                <a [href]="d.href">{{ d.text }}</a>
              } @else {
                <span>{{ d.text }}</span>
              }
            </li>
          }
        </ul>
      </section>

      <section class="block">
        <h2 class="heading">{{ hoursTitle() }}</h2>
        <ul class="details">
          @for (d of hours(); track d.text) {
            <li>
              <app-icon [name]="d.icon" [size]="18" />
              <span>{{ d.text }}</span>
            </li>
          }
        </ul>
      </section>

      @let m = map();
      <div class="map">
        <iframe
          class="map__frame"
          [src]="embedUrl()"
          [title]="m.title"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
        <a class="map__open" [href]="openUrl()" target="_blank" rel="noopener">
          {{ m.openLabel }} <app-icon name="external-link" [size]="14" />
        </a>
      </div>
    </aside>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .heading {
      font-size: 18px;
      font-weight: 600;
      color: $navy;
    }
    .details {
      display: grid;
      gap: 14px;
      margin-top: 16px;

      li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-size: 14px;
        line-height: 1.6;
        color: $muted;
      }
      app-icon {
        flex: none;
        margin-top: 2px;
        color: $gold;
      }
      a {
        transition: color 0.2s;

        &:hover {
          color: $navy;
        }
      }
    }
    .block {
      margin-top: 36px;
    }
    .map {
      position: relative;
      margin-top: 36px;
      overflow: hidden;
      border-radius: 12px;
      background: $surface;
    }
    .map__frame {
      display: block;
      width: 100%;
      height: 300px;
      border: 0;
    }
    .map__open {
      position: absolute;
      top: 10px;
      left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 500;
      color: $bright-blue;
      background: $white;
      border-radius: 4px;
      box-shadow: $shadow-sm;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfoSection {
  readonly addressTitle = input.required<string>();
  readonly address = input.required<ContactDetail[]>();
  readonly hoursTitle = input.required<string>();
  readonly hours = input.required<ContactDetail[]>();
  readonly map = input.required<ContactMapContent>();

  private readonly sanitizer = inject(DomSanitizer);

  /** Google Maps embed for the office. Built from our own content, never from visitor input. */
  protected readonly embedUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${encodeURIComponent(this.map().query)}&output=embed`,
    ),
  );

  protected readonly openUrl = computed(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.map().query)}`,
  );
}
