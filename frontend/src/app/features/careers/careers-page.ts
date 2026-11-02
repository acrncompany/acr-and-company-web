import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CareersService } from '../../core/services/careers.service';
import { CareersContactSection } from './sections/careers-contact-section';
import { CareersHeroSection } from './sections/careers-hero-section';
import { OpeningsSection } from './sections/openings-section';
import { PerksSection } from './sections/perks-section';

/** Careers page: loads its content through CareersService and hands each part to a section component. */
@Component({
  selector: 'app-careers-page',
  imports: [CareersHeroSection, PerksSection, OpeningsSection, CareersContactSection],
  template: `
    @if (careers(); as c) {
      <app-careers-hero-section [hero]="c.hero" />
      <app-perks-section [title]="c.perksTitle" [perks]="c.perks" />
      <app-openings-section
        [title]="c.openingsTitle"
        [openings]="c.openings"
        [departments]="c.departments"
        [allLabel]="c.allLabel"
        [applyLabel]="c.applyLabel"
        [detailsLabel]="c.detailsLabel"
      />
      <app-careers-contact-section [contact]="c.contact" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareersPage {
  protected readonly careers = toSignal(inject(CareersService).getCareers());
}
