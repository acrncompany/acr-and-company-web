import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from '../api/api';
import { NavConfig } from '../models/site';

/** Header navigation and the Services mega-menu (built from the services): GET /api/public/nav. Fetched once per page load. */
@Injectable({ providedIn: 'root' })
export class NavService {
  private readonly nav$ = inject(ApiService).get<NavConfig>('nav').pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getNav(): Observable<NavConfig> {
    return this.nav$;
  }
}
