import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { REDIRECTS } from './app/core/seo/redirects';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Test-address switch (same idea as NOINDEX_SITE in acr-innovative-web): ask search engines to ignore every page.
const noindexSite = process.env['NOINDEX_SITE'] === 'true';
// Where the NestJS API listens, as seen from this server.
const apiUrl = (process.env['API_URL'] ?? 'http://localhost:3000').replace(/\/+$/, '');

/** Permanent redirects live in ONE file: app/core/seo/redirects.ts (query string is kept). */
app.use((req, res, next) => {
  const target = REDIRECTS[req.path];
  if (!target) return next();
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(301, target + qs);
});

/**
 * /robots.txt and /sitemap.xml come from the API (it knows the published articles and open jobs and the NOINDEX_SITE
 * setting). This server only relays them.
 */
async function relayFromApi(path: string, res: express.Response): Promise<void> {
  try {
    const upstream = await fetch(`${apiUrl}${path}`);
    const body = await upstream.text();
    res
      .status(upstream.status)
      .type(upstream.headers.get('content-type') ?? 'text/plain; charset=utf-8')
      .set('Cache-Control', 'public, max-age=3600')
      .send(body);
  } catch {
    res.status(502).type('text/plain; charset=utf-8').send('Temporarily unavailable.\n');
  }
}
/**
 * Until phase 6 puts everything behind one address, this server relays GET /api/public/* and /uploads/* to the API, so
 * the built site works on its own (images, and the browser's own API calls when navigating between pages).
 * The admin API is deliberately NOT relayed: it is never reachable through the website.
 */
app.get(['/api/public/*splat', '/uploads/*splat'], async (req, res) => {
  try {
    const upstream = await fetch(`${apiUrl}${req.originalUrl}`);
    res.status(upstream.status);
    for (const h of ['content-type', 'cache-control', 'etag', 'last-modified']) {
      const v = upstream.headers.get(h);
      if (v) res.set(h, v);
    }
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.status(502).type('text/plain; charset=utf-8').send('Temporarily unavailable.\n');
  }
});

/**
 * The three public forms (contact, consultation, application with a CV) are POSTed to the same address as the page. Until
 * phase 6, this server streams them to the API unchanged and passes the API's answer (and the visitor's IP, for the API's
 * rate limit) back. Nothing else under /api is accepted here.
 */
app.post('/api/public/forms/:form', async (req, res) => {
  try {
    const headers: Record<string, string> = { 'x-forwarded-for': String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '') };
    for (const h of ['content-type', 'content-length']) if (req.headers[h]) headers[h] = String(req.headers[h]);
    const upstream = await fetch(`${apiUrl}${req.originalUrl}`, {
      method: 'POST',
      headers,
      body: Readable.toWeb(req) as ReadableStream,
      duplex: 'half',
    } as RequestInit);
    res.status(upstream.status).type(upstream.headers.get('content-type') ?? 'application/json').send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.status(502).type('application/json').send('{"message":"Temporarily unavailable."}');
  }
});

app.get('/robots.txt', (_req, res) => void relayFromApi('/robots.txt', res));
app.get('/sitemap.xml', (_req, res) => void relayFromApi('/sitemap.xml', res));

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  // The admin panel (/admin) is never indexed, on any address.
  if (noindexSite || req.path === '/admin' || req.path.startsWith('/admin/')) res.set('X-Robots-Tag', 'noindex, nofollow');
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
