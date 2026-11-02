import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FounderSection as FounderContent } from '../../../core/models/about';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';
import { SectionHeading } from '../../../shared/section-heading/section-heading';

@Component({
  selector: 'app-founder-section',
  imports: [Icon, Reveal, SectionHeading],
  template: `
    @let s = section();
    <section class="founder">
      <div class="container">
        <app-section-heading [eyebrow]="s.heading.eyebrow" [title]="s.heading.title" />
        <article class="card" [appReveal]="0">
          <div class="card__avatar">
            @if (s.photo; as p) {
              <img [src]="p.src" [alt]="p.alt" width="128" height="128" loading="lazy" />
            } @else {
              <app-icon [name]="s.fallbackIcon" [size]="48" />
            }
          </div>
          <div class="card__body">
            <h3 class="card__name">{{ s.name }}</h3>
            <p class="card__role">{{ s.role }}</p>
            <p class="card__quals">{{ s.qualifications }}</p>
            <p class="card__bio">{{ s.bio }}</p>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .founder {
      padding-block: $section-y-sm;
      background: $surface;

      @include up($bp-md) {
        padding-block: $section-y;
      }
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 32px;
      align-items: center;
      max-width: 768px;
      margin: 48px auto 0;
      padding: 32px;
      background: $white;
      border-radius: 16px;
      box-shadow: $shadow-sm;

      @include up($bp-md) {
        flex-direction: row;
        padding: 48px;
      }
    }
    .card__avatar {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 128px;
      height: 128px;
      overflow: hidden;
      color: $gold;
      background: hsl(213 73% 15% / 0.1);
      border-radius: 50%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .card__body {
      text-align: center;

      @include up($bp-md) {
        text-align: left;
      }
    }
    .card__name {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.25;
      color: $navy;
    }
    .card__role {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 500;
      color: $gold;
    }
    .card__quals {
      margin-top: 4px;
      font-size: 12px;
      color: $muted;
    }
    .card__bio {
      margin-top: 16px;
      line-height: 1.7;
      color: $muted;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FounderSection {
  readonly section = input.required<FounderContent>();
}
