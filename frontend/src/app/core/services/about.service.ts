import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { AboutPageContent } from '../models/about';

/** About Us page content: GET /api/public/pages/about. */
@Injectable({ providedIn: 'root' })
export class AboutService {
  private readonly api = inject(ApiService);

  getAbout(): Observable<AboutPageContent> {
    return this.api.get<AboutPageContent>('pages/about');
  }
}
