import './load-env'; // must be first: fills process.env from ENV_FILE / backend/.env
import * as path from 'path';

/**
 * Central place for environment settings and filesystem locations (same approach as acr-innovative-web).
 *
 * Where settings come from: real environment variables first, then the file named by ENV_FILE, then backend/.env
 * (local development only, never committed; copy .env.example). Relative paths (UPLOAD_DIR=../../acr-data/...) are
 * resolved from the backend/ folder.
 */
const backendRoot = path.resolve(__dirname, '..', '..'); // dist/config -> the app folder
const isProd = process.env.NODE_ENV === 'production';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name} (see .env.example)`);
  return v;
}

/** True when `child` is the same folder as `parent` or lies inside it. */
const isInside = (child: string, parent: string) => {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

/** A data folder (uploads / CVs). In production it must be set explicitly: guessing could put files where a redeploy deletes them. */
function dataDir(name: string, devDefault: string): string {
  const v = process.env[name]?.trim();
  if (!v && isProd) throw new Error(`${name} is not set. In production it must be an absolute path OUTSIDE the app folder.`);
  return path.resolve(backendRoot, v || devDefault);
}

export const env = {
  isProd,
  port: parseInt(process.env.PORT || '3000', 10),
  /** Public base URL without trailing slash. */
  siteUrl: (process.env.SITE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, ''),
  trustProxy: process.env.TRUST_PROXY ?? '1',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  /** Admin login cookie lifetime. */
  sessionHours: 12,
  /** Cookie "Secure" flag: on in production (HTTPS). Set COOKIE_SECURE=true to force it locally. */
  cookieSecure: isProd || process.env.COOKIE_SECURE === 'true',
  /** NOINDEX_SITE=true: ask search engines to ignore the whole site (a test/staging address). Remove for the real site. */
  noindexSite: (process.env.NOINDEX_SITE ?? '').toLowerCase() === 'true',
  /** Optional comma-separated origins allowed to call the public (GET) API from a browser, e.g. the dev site on :4400. */
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
};

if (isProd && env.jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production.');

/**
 * Outgoing email (Nodemailer) for form alerts. Email is optional: with no SMTP_HOST / SMTP_FROM the forms still save every
 * submission and the server logs a warning instead of sending. SMTP_SECURE=true means TLS from the start (usually port 465);
 * by default it is on only for port 465 (other ports upgrade with STARTTLS when the server offers it).
 */
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
export const smtp = {
  host: process.env.SMTP_HOST?.trim() || '',
  port: smtpPort,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE.toLowerCase() === 'true' : smtpPort === 465,
  user: process.env.SMTP_USER?.trim() || '',
  password: process.env.SMTP_PASSWORD || '',
  /** The From address, e.g. 'ACR & Company <website@acrandcompany.com>'. */
  from: process.env.SMTP_FROM?.trim() || '',
  get configured() { return !!(this.host && this.from); },
};

export const paths = {
  backendRoot,
  /** Admin-uploaded images, served at /uploads. Must live outside the app folder in production. */
  uploadDir: dataDir('UPLOAD_DIR', '../../acr-data/acr-and-company/uploads'),
  /** Private files (CVs, phase 5). Never served statically. */
  privateDir: dataDir('PRIVATE_DIR', '../../acr-data/acr-and-company/private'),
};

if (isInside(paths.privateDir, paths.uploadDir) || isInside(paths.uploadDir, paths.privateDir)) {
  throw new Error('PRIVATE_DIR and UPLOAD_DIR must be two separate folders (neither inside the other).');
}
if (isProd && (isInside(paths.uploadDir, backendRoot) || isInside(paths.privateDir, backendRoot))) {
  throw new Error(`UPLOAD_DIR and PRIVATE_DIR must be OUTSIDE the app folder (${backendRoot}).`);
}
