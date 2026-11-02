import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactDetail } from '../../core/models/contact';
import { ContactService } from '../../core/services/contact.service';
import { SiteService } from '../../core/services/site.service';
import { whatsappDisplay, whatsappUrl } from '../../core/utils/whatsapp';
import { ContactFormSection } from './sections/contact-form-section';
import { ContactHeroSection } from './sections/contact-hero-section';
import { ContactInfoSection } from './sections/contact-info-section';

/** Contact page: loads its content through ContactService and hands each part to a section component. */
@Component({
  selector: 'app-contact-page',
  imports: [ContactHeroSection, ContactFormSection, ContactInfoSection],
  template: `
    @if (contact(); as c) {
      <app-contact-hero-section [hero]="c.hero" />
      <section class="body">
        <div class="container body__grid">
          <app-contact-form-section [form]="c.form" [services]="c.services" />
          <app-contact-info-section
            [addressTitle]="c.addressTitle"
            [address]="address()"
            [hoursTitle]="c.hoursTitle"
            [hours]="c.hours"
            [map]="c.map"
          />
        </div>
      </section>
    }
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .body {
      padding-block: 40px $section-y-sm;
      background: $white;

      @include up($bp-md) {
        padding-block: 64px $section-y;
      }
    }
    .body__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 48px;

      @include up($bp-lg) {
        grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
        gap: 56px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  protected readonly contact = toSignal(inject(ContactService).getContact());
  private readonly site = toSignal(inject(SiteService).getSite());

  /** The address lines from the API, plus a WhatsApp row built from the site settings (hidden until a real number is set). */
  protected readonly address = computed<ContactDetail[]>(() => {
    const rows = this.contact()?.address ?? [];
    const wa = this.site()?.contact;
    const url = wa ? whatsappUrl(wa.whatsappNumber, wa.whatsappMessage) : null;
    return url && wa
      ? [...rows, { icon: 'chat', text: `WhatsApp: ${whatsappDisplay(wa.whatsappNumber)}`, href: url }]
      : rows;
  });
}
