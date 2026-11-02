import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AboutService } from '../../core/services/about.service';
import { AboutHeroSection } from './sections/about-hero-section';
import { FounderSection } from './sections/founder-section';
import { NetworkSection } from './sections/network-section';
import { StorySection } from './sections/story-section';
import { ValuesSection } from './sections/values-section';

/** About Us page: loads its content through AboutService and hands each part to a section component. */
@Component({
  selector: 'app-about-page',
  imports: [AboutHeroSection, StorySection, FounderSection, ValuesSection, NetworkSection],
  template: `
    @if (about(); as a) {
      <app-about-hero-section [hero]="a.hero" />
      <app-story-section [section]="a.story" />
      @if (a.founder; as f) {
        <app-founder-section [section]="f" />
      }
      <app-values-section [section]="a.values" />
      <app-network-section [section]="a.network" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly about = toSignal(inject(AboutService).getAbout());
}
