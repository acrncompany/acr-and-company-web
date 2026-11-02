import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ServicesService } from '../../core/services/services.service';
import { ServiceCatalogSection } from './sections/service-catalog-section';
import { ServicesCtaSection } from './sections/services-cta-section';
import { ServicesHeroSection } from './sections/services-hero-section';

/** Services page: loads its content through ServicesService and hands each part to a section component. */
@Component({
  selector: 'app-services-page',
  imports: [ServicesHeroSection, ServiceCatalogSection, ServicesCtaSection],
  template: `
    @if (services(); as s) {
      <app-services-hero-section [hero]="s.hero" />
      <app-service-catalog-section [groups]="s.groups" [allLabel]="s.allLabel" />
      <app-services-cta-section [cta]="s.cta" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {
  protected readonly services = toSignal(inject(ServicesService).getServices());
}
