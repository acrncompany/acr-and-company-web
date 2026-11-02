import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeService } from '../../core/services/home.service';
import { ApproachSectionComponent } from './sections/approach-section';
import { CoreServicesSectionComponent } from './sections/core-services-section';
import { FaqSectionComponent } from './sections/faq-section';
import { HeroSection } from './sections/hero-section';
import { IndustriesSectionComponent } from './sections/industries-section';
import { InsightsSectionComponent } from './sections/insights-section';
import { WhyChooseSectionComponent } from './sections/why-choose-section';

/** Home page: loads its content through HomeService and hands each part to a section component. */
@Component({
  selector: 'app-home-page',
  imports: [
    HeroSection,
    CoreServicesSectionComponent,
    WhyChooseSectionComponent,
    ApproachSectionComponent,
    IndustriesSectionComponent,
    InsightsSectionComponent,
    FaqSectionComponent,
  ],
  template: `
    @if (home(); as h) {
      <app-hero-section [hero]="h.hero" />
      <app-core-services-section [section]="h.coreServices" />
      <app-why-choose-section [section]="h.whyChoose" />
      <app-approach-section [section]="h.approach" />
      <app-industries-section [section]="h.industries" />
      <app-insights-section [section]="h.insights" />
      <app-faq-section [section]="h.faq" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly home = toSignal(inject(HomeService).getHome());
}
