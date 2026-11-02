/**
 * The single place that decides how titles and descriptions are built (ported from acr-innovative-web
 * backend/src/seo/seo-rules.ts, so the admin preview and the public pages stay identical).
 *
 * Title rules:
 *   - A custom meta title is used exactly as typed.
 *   - Home without a meta title: just the brand, never "Home — ...".
 *   - Any other page without a meta title: "<Page title> — <brand>".
 */
export interface TitleInput {
  metaTitle?: string | null;
  pageTitle?: string;
  isHome?: boolean;
  siteName: string;
  suffix?: string;
}

export function buildTitle(i: TitleInput): string {
  const custom = i.metaTitle?.trim();
  if (custom) return custom;
  if (i.isHome || !i.pageTitle) return i.siteName;
  return `${i.pageTitle} — ${i.suffix?.trim() || i.siteName}`;
}

export function buildDescription(meta: string | null | undefined, siteDefault: string): string {
  return meta?.trim() || siteDefault;
}
