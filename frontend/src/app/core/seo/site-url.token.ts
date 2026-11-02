import { InjectionToken } from '@angular/core';

/**
 * Optional public origin (no trailing slash) that overrides the one in the SEO data.
 * Provided by the SSR config from the SITE_URL environment variable.
 */
export const SITE_URL_OVERRIDE = new InjectionToken<string | null>('SITE_URL_OVERRIDE', {
  providedIn: 'root',
  factory: () => null,
});
