import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api';
import { ServicesPageContent } from '../models/services';

/** Services page content: GET /api/public/pages/services. */
@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly api = inject(ApiService);

  getServices(): Observable<ServicesPageContent> {
    return this.api.get<ServicesPageContent>('pages/services');
  }
}
