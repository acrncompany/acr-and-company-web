import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, of } from 'rxjs';

/**
 * Origin of the NestJS API (no trailing slash).
 *  - In the browser: the page's own origin (the dev server proxies /api and /uploads; in production one origin serves all).
 *  - On the server (SSR): the API address, see app.config.server.ts (API_URL env, default http://localhost:3000).
 * Requests use absolute URLs on both sides so Angular's transfer cache can reuse the server's responses in the browser.
 */
export const API_BASE = new InjectionToken<string>('API_BASE', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).location?.origin ?? '',
});

/** Read-only access to the public API (/api/public/...). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  /** GET /api/public/<path>. If the API is unreachable the observable completes without a value (the page stays empty). */
  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.base}/api/public/${path}`).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`[api] GET ${path} failed (${err.status})`);
        return EMPTY;
      }),
    );
  }

  /** Like get(), but a 404 yields null (an unknown article or job), so the page can show "not found". */
  getOrNull<T>(path: string): Observable<T | null> {
    return this.http.get<T>(`${this.base}/api/public/${path}`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) return of(null);
        console.error(`[api] GET ${path} failed (${err.status})`);
        return EMPTY;
      }),
    );
  }

  /** POST /api/public/forms/<form> (contact, consultation, application). Errors are passed on: each form decides what to tell the visitor. */
  postForm(form: string, body: object | FormData): Observable<void> {
    return this.http.post(`${this.base}/api/public/forms/${form}`, body).pipe(map(() => undefined));
  }
}
