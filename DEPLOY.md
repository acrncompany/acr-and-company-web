# Deploying the test environment: Neon + Render + Vercel

```
Browser --> Vercel (one origin, e.g. https://acr-test.vercel.app)
              |- pages ............ Angular SSR (Vercel function api/ssr.mjs)
              '- rewrites ......... /api/*  /uploads/*  /sitemap.xml  /robots.txt  /favicon-32x32.png ...
                                      '--> Render (NestJS API) --> Neon (Postgres)
```

The browser only ever talks to the Vercel address, so the admin login cookie (`SameSite=Strict`, `Secure`, `HttpOnly`)
is first-party and works unchanged. The SSR function on Vercel calls the Render API directly for page data.

Postgres is the permanent database (also for the later VPS). Nothing here is Neon-specific except the two connection strings.

## 0. Before you start (one-off)

- The Neon database already has the schema (`init` migration) and the seed content. Render does NOT run the seeds. To
  seed a new empty database, run locally with that database in `backend/.env`: `npm run seed:content`, then `npm run seed:admin`.
- Get both Neon strings: **pooled** (host contains `-pooler`) and **direct** (same host without `-pooler`).

## 1. Render (backend)

New **Web Service**, repo = this repo.

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run start:prod` (runs `prisma migrate deploy`, then the API) |
| Health Check Path | `/health` |
| Auto-Deploy | on |

`--include=dev` is needed because the Nest CLI is a dev dependency. `/health` never touches the database, so the probe does
not keep Neon awake. `/health/ready` also checks the database; open it by hand.

### Render environment variables

| Variable | Required | Value / notes |
|---|---|---|
| `NODE_VERSION` | yes | `22` |
| `NODE_ENV` | yes | `production` (turns on the `Secure` cookie and the strict folder and secret checks) |
| `DATABASE_URL` | yes | Neon **pooled** URL with `&pgbouncer=true` added, e.g. `postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true` |
| `DIRECT_URL` | yes | Neon **direct** URL (no `-pooler`). Used by `prisma migrate deploy` on every start |
| `JWT_SECRET` | yes | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `UPLOAD_DIR` | yes | `/tmp/acr-data/uploads` (must be outside the app folder; see "Uploads") |
| `PRIVATE_DIR` | yes | `/tmp/acr-data/private` (CVs; a different folder from `UPLOAD_DIR`) |
| `SITE_URL` | yes | The Vercel address, no trailing slash: `https://acr-test.vercel.app` (sitemap URLs, links in alert emails) |
| `NOINDEX_SITE` | yes (test) | `true`. `/robots.txt` becomes `Disallow: /`. Remove for the real site |
| `TRUST_PROXY` | optional | Default `1`. Render adds one proxy hop and the Vercel rewrite another. If every visitor shows the same IP (the admin login limit of 5/min is then shared), try `2`. Not verified on the real hosts |
| `CORS_ORIGINS` | no | Leave empty: the browser never calls Render directly |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | optional | Form alert emails. Without `SMTP_HOST` and `SMTP_FROM` the forms still save and the API logs a warning |
| `SEED_ASSETS_DIR` | no | Only if the seed images live somewhere other than `backend/prisma/seed-assets` |
| `PORT` | no | Render sets it |

`ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` are only read by `npm run seed:admin` (a one-off, run locally). Do not set them on Render.

### Uploads (local disk, no cloud storage)

Uploads stay on the instance disk. Render's disk is wiped on every deploy and restart (free tier), so:

- The 4 seeded images (`seed/*.webp`) are re-created from `backend/prisma/seed-assets` at every start, before the API
  answers. The log line is `[SeedImages] Restored N of N missing seed image(s)`.
- Images uploaded through the admin, the favicon set generated from the logo (`/favicon-32x32.png` and the others) and
  CVs sent through the careers form are **lost** on restart. The Media rows stay, so those images show as broken until
  they are uploaded again. That is acceptable for a test site; the VPS will have a real disk.

## 2. Vercel (frontend)

New Project, repo = this repo, **Root Directory = `frontend`**. `frontend/vercel.json` sets the rest (Framework
Preset: Other, build `npm run build`, output `dist/browser`, SSR function `api/ssr.mjs`).

### Edit `frontend/vercel.json` first

Vercel cannot read environment variables inside rewrites. Replace **all six** occurrences of
`https://REPLACE-WITH-RENDER-SERVICE.onrender.com` with the real Render address, then commit.

### Vercel environment variables (Production and Preview)

| Variable | Required | Value / notes |
|---|---|---|
| `API_URL` | yes | Render address, no trailing slash: `https://acr-api.onrender.com`. The SSR function reads page data from it |
| `SITE_URL` | yes | The Vercel address: `https://acr-test.vercel.app` (canonical, og:url, JSON-LD) |
| `NOINDEX_SITE` | yes (test) | `true` (adds `X-Robots-Tag: noindex, nofollow` to every page) |
| `NG_ALLOWED_HOSTS` | only for a custom domain | Comma list of hostnames SSR may serve. `*.vercel.app` is already in `angular.json`; add e.g. `test.acrandcompany.com` |
| `NG_TRUST_PROXY_HEADERS` | only if needed | `x-forwarded-host,x-forwarded-proto` if canonical or og URLs come out with the wrong host |

### What makes Angular SSR run on Vercel (already done in this repo)

1. `frontend/src/server.ts` exports `reqHandler`.
2. `frontend/api/ssr.mjs` re-exports `reqHandler` from the built `dist/server/server.mjs` as a Vercel function. It uses a
   static `import` so Vercel includes `dist/server` and its dependencies in the function.
3. `vercel.json` rewrites: API, uploads, sitemap, robots and favicons go to Render first; every other path goes to
   `/api/ssr`. Static files in `dist/browser` (JS, CSS, images) are served by the CDN before any rewrite.
4. `angular.json` `allowedHosts` includes `*.vercel.app`. Angular answers 400 for hosts that are not listed.
5. `/admin/**` is `RenderMode.Client` (`app.routes.server.ts`): the server sends only an empty shell and the browser
   builds the admin. Those responses also carry `X-Robots-Tag: noindex`.

Not verified on a real Vercel project (no account access from here): the rewrites themselves, the function size limit
(250 MB unzipped), a 5 MB CV upload through the rewrite, and the 30 s function timeout (`maxDuration`). Check these after
the first deploy.

## 3. Checklist after the first deploy

1. `https://<render>/health` returns `{"status":"ok"}`; `/health/ready` returns `"database":"ok"`.
2. `https://<vercel>/` renders (view source shows the page text, not an empty shell).
3. `https://<vercel>/robots.txt` shows `Disallow: /`.
4. `https://<vercel>/uploads/seed/logo.webp` loads (served by Render through the rewrite).
5. `https://<vercel>/admin`: log in. In the browser dev tools the `acr_admin` cookie belongs to the Vercel domain.
6. Submit the contact form and check the inbox in the admin.

## 4. Known limits of the free tiers

- Render free sleeps after about 15 minutes idle. The first visit after that waits for the API (30-60 s), and
  server-rendered pages wait with it. Neon also suspends when idle and adds a short wake-up.
- Every Render restart wipes uploads (see above).
