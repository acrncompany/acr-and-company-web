import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay } from 'rxjs';
import { ApiService } from '../api/api';
import { PageSeo, SiteSeo } from '../models/seo';
import { SITE_URL_OVERRIDE } from '../seo/site-url.token';

/** Where per-route SEO comes from: /api/public/seo/* (edited in the admin). */
@Injectable({ providedIn: 'root' })
export class SeoDataService {
  private readonly api = inject(ApiService);
  private readonly urlOverride = inject(SITE_URL_OVERRIDE);

  private readonly site$ = this.api.get<SiteSeo>('seo/site').pipe(
    // The server's SITE_URL (the real public address) wins over the API's value.
    map((s) => ({ ...s, siteUrl: (this.urlOverride || s.siteUrl).replace(/\/+$/, '') })),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getSiteSeo(): Observable<SiteSeo> {
    return this.site$;
  }

  /**
   * @param key "home", "about", ... a fixed page; "learning/<slug>" an article; "careers/<slug>" a job.
   * Emits null for an unknown key (the page is then served as noindex).
   */
  getPageSeo(key: string): Observable<PageSeo | null> {
    if (!key) return of(null);
    const slash = key.indexOf('/');
    if (slash === -1) return this.api.getOrNull<PageSeo>(`seo/pages/${encodeURIComponent(key)}`);
    const kind = key.slice(0, slash);
    const slug = encodeURIComponent(key.slice(slash + 1));
    if (kind === 'learning') return this.api.getOrNull<PageSeo>(`seo/articles/${slug}`);
    if (kind === 'careers') return this.api.getOrNull<PageSeo>(`seo/jobs/${slug}`);
    return of(null);
  }
}
