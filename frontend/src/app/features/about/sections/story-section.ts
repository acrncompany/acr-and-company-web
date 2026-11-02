import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StorySection as StoryContent } from '../../../core/models/about';
import { CountUp } from '../../../shared/count-up/count-up';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-story-section',
  imports: [CountUp, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="story">
      <div class="container story__grid">
        <div [appReveal]="0" revealFrom="left">
          <app-section-heading align="left" [eyebrow]="s.heading.eyebrow" [title]="s.heading.title" />
          <div class="story__text">
            @for (p of s.paragraphs; track $index) {
              <p>{{ p }}</p>
            }
          </div>
        </div>
        <dl class="stats" [appReveal]="150" revealFrom="right">
          @for (st of s.stats; track st.label) {
            <div class="stat">
              <dt class="stat__value"><app-count-up [value]="st.value" /></dt>
              <dd class="stat__label">{{ st.label }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .story {
      padding-block: $section-y-sm;
      overflow-x: clip; // the columns slide in from the sides; never cause a horizontal scrollbar
      background: $white;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .story__grid {
      display: grid;
      gap: 48px;
      align-items: center;

      @include up($bp-lg) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 64px;
      }
    }
    .story__text {
      display: grid;
      gap: 16px;
      margin-top: 24px;
      line-height: 1.7;
      color: $muted;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      margin: 0;
      padding: 32px;
      background: $surface;
      border-radius: 16px;
    }
    .stat {
      padding: 16px;
      text-align: center;
    }
    .stat__value {
      font-size: 30px;
      font-weight: 700;
      line-height: 1.2;
      color: $gold;
    }
    .stat__label {
      margin: 4px 0 0;
      font-size: 14px;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorySection {
  readonly section = input.required<StoryContent>();
}
