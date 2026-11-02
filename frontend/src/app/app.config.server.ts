import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE } from './core/api/api';
import { SITE_URL_OVERRIDE } from './core/seo/site-url.token';

const trim = (s: string) => s.replace(/\/+$/, '');

/** Where the NestJS API listens, as seen from this server. */
const apiUrl = trim(process.env['API_URL'] ?? 'http://localhost:3000');
/** The public address of the website, e.g. SITE_URL=https://acrandcompany.com (used for canonical / og:url / JSON-LD). */
const siteUrl = process.env['SITE_URL'] ? trim(process.env['SITE_URL']) : null;

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: SITE_URL_OVERRIDE, useValue: siteUrl },
    // The server calls the API at its internal address; the browser calls it on the page's own origin.
    { provide: API_BASE, useValue: apiUrl },
    // Keeps the two the same cache key, so the browser reuses the server's API responses instead of fetching again.
    { provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP, useValue: { [apiUrl]: siteUrl ?? 'http://localhost:4400' } },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
