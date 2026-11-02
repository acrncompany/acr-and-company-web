import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { LearningArticleDetail, LearningPageContent } from '../models/learning';

/** Learning Centre: GET /api/public/pages/learning (list) and /api/public/learning/:slug (one article, HTML body). */
@Injectable({ providedIn: 'root' })
export class LearningService {
  private readonly api = inject(ApiService);

  getLearning(): Observable<LearningPageContent> {
    return this.api.get<LearningPageContent>('pages/learning');
  }

  /** null when there is no published article with this slug. */
  getArticle(slug: string): Observable<LearningArticleDetail | null> {
    return this.api.getOrNull<LearningArticleDetail>(`learning/${encodeURIComponent(slug)}`);
  }
}
