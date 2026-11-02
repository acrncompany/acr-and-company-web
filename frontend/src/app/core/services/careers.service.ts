import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { CareersPageContent, JobOpening } from '../models/careers';

/** Careers: GET /api/public/pages/careers (page + open positions) and /api/public/jobs/:slug (one position). */
@Injectable({ providedIn: 'root' })
export class CareersService {
  private readonly api = inject(ApiService);

  getCareers(): Observable<CareersPageContent> {
    return this.api.get<CareersPageContent>('pages/careers');
  }

  /** POST /api/public/forms/application (multipart: the fields, the position's slug and the CV file). */
  apply(form: FormData): Observable<void> {
    return this.api.postForm('application', form);
  }

  /** null when there is no open position with this slug (unknown, unpublished or past its closing date). */
  getJob(slug: string): Observable<JobOpening | null> {
    return this.api.getOrNull<JobOpening>(`jobs/${encodeURIComponent(slug)}`);
  }
}
