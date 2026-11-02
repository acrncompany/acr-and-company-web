import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from '../api/api';
import { SiteConfig } from '../models/site';

/** Site-wide content (brand, contact, WhatsApp settings, CTA, footer): GET /api/public/site. Fetched once per page load. */
@Injectable({ providedIn: 'root' })
export class SiteService {
  private readonly site$ = inject(ApiService).get<SiteConfig>('site').pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getSite(): Observable<SiteConfig> {
    return this.site$;
  }
}
