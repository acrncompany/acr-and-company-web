import { Controller, Get, Header } from '@nestjs/common';
import { env } from '../config/env';
import { PublicService } from '../public/public.service';

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * /robots.txt and /sitemap.xml, built from the database (fixed pages + published articles + open jobs).
 * The website's server forwards these two URLs here, and in production this app answers them directly.
 * The origin comes from SITE_URL, so set it to the public address of the website.
 */
@Controller()
export class SeoController {
  constructor(private readonly pub: PublicService) {}

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  robots() {
    // On a test/staging address (NOINDEX_SITE=true) everything is closed to search engines.
    const lines = env.noindexSite
      ? ['User-agent: *', 'Disallow: /']
      : ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api', '', `Sitemap: ${env.siteUrl}/sitemap.xml`];
    return lines.join('\n') + '\n';
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  async sitemap() {
    const pages = await this.pub.seoPages();
    const urls = pages
      .map((p) => {
        const loc = escapeXml(env.siteUrl + (p.path === '/' ? '' : p.path));
        const lastmod = p.lastModified ? `<lastmod>${p.lastModified.slice(0, 10)}</lastmod>` : '';
        const priority = p.priority ? `<priority>${p.priority}</priority>` : '';
        return `  <url><loc>${loc}</loc>${lastmod}${priority}</url>`;
      })
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  }
}
