import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

/**
 * Thin wrapper around HttpClient for the admin API (/api/admin/...). The login cookie is sent automatically (same origin).
 * Every failed call is also reported to `onError` (set by AuthService: expired login -> login page, offline message). This is done
 * here and not with an HttpClient interceptor, because the HTTP setup is shared with the public website and must stay untouched.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  readonly base = '/api/admin';
  onError: ((e: HttpErrorResponse, url: string) => void) | null = null;

  private params(query?: Record<string, unknown>): HttpParams {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(query ?? {})) if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    return p;
  }

  private watch<T>(path: string, call: Observable<T>): Observable<T> {
    return call.pipe(tap({ error: (e: unknown) => e instanceof HttpErrorResponse && this.onError?.(e, this.base + path) }));
  }

  get<T = any>(path: string, query?: Record<string, unknown>): Observable<T> {
    return this.watch(path, this.http.get<T>(this.base + path, { params: this.params(query) }));
  }
  post<T = any>(path: string, body?: unknown): Observable<T> {
    return this.watch(path, this.http.post<T>(this.base + path, body ?? {}));
  }
  patch<T = any>(path: string, body: unknown): Observable<T> {
    return this.watch(path, this.http.patch<T>(this.base + path, body));
  }
  put<T = any>(path: string, body: unknown): Observable<T> {
    return this.watch(path, this.http.put<T>(this.base + path, body));
  }
  delete<T = any>(path: string): Observable<T> {
    return this.watch(path, this.http.delete<T>(this.base + path));
  }
}
