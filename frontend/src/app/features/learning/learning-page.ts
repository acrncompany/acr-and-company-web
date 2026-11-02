import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningService } from '../../core/services/learning.service';
import { ArticleListSection } from './sections/article-list-section';
import { LearningHeroSection } from './sections/learning-hero-section';

/** Learning Centre: loads its content through LearningService and hands each part to a section component. */
@Component({
  selector: 'app-learning-page',
  imports: [LearningHeroSection, ArticleListSection],
  template: `
    @if (learning(); as l) {
      <app-learning-hero-section [hero]="l.hero" />
      <app-article-list-section
        [articles]="l.articles"
        [categories]="l.categories"
        [allLabel]="l.allLabel"
        [readLabel]="l.readLabel"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPage {
  protected readonly learning = toSignal(inject(LearningService).getLearning());
}
