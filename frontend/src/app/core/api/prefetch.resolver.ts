import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable, defaultIfEmpty, forkJoin, map, of } from 'rxjs';
import { ApiService } from './api';

/** Fills `:param` placeholders from the route, e.g. 'jobs/:slug' -> 'jobs/<slug>' (encoded like the services do). */
const fill = (path: string, route: ActivatedRouteSnapshot) =>
  path.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(route.params[name] ?? ''));

const list = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v : []);

/**
 * Loads the API data a page needs (`data.prefetch` = paths, `data.prefetchOrNull` = paths where a 404 means
 * "not found") before the route activates, so the old page stays on screen until the new one can render fully
 * (no empty page with the footer jumping up). ApiService caches the responses, so the page's own requests resolve
 * instantly. A failed request never blocks navigation.
 */
export const prefetchResolver: ResolveFn<boolean> = (route) => {
  const api = inject(ApiService);
  const calls: Observable<unknown>[] = [
    ...list(route.data['prefetch']).map((p) => api.get(fill(p, route)).pipe(defaultIfEmpty(null))),
    ...list(route.data['prefetchOrNull']).map((p) => api.getOrNull(fill(p, route)).pipe(defaultIfEmpty(null))),
  ];
  return calls.length ? forkJoin(calls).pipe(map(() => true)) : of(true);
};
