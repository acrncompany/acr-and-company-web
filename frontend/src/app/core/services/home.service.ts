import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { HomePageContent } from '../models/home';

/** Home page content: GET /api/public/pages/home. */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly api = inject(ApiService);

  getHome(): Observable<HomePageContent> {
    return this.api.get<HomePageContent>('pages/home');
  }
}
