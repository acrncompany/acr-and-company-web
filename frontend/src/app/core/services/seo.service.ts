import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, forkJoin } from 'rxjs';
import { PageSeo, SiteSeo } from '../models/seo';
import { SiteConfig } from '../models/site';
import { organizationJsonLd, toJsonLdScript } from '../seo/jsonld';
import { buildDescription, buildTitle } from '../seo/seo-rules';
import { SeoDataService } from './seo-data.service';
import { SiteService } from './site.service';

const JSONLD_ID = 'acr-jsonld';

/**
 * Writes <title>, meta description, canonical, Open Graph, Twitter tags and JSON-LD into <head>
 * after every navigation. Works during SSR, so the tags are in the server-rendered HTML.
 * The data per route comes from SeoDataService (the route's `data.seo` is the key).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly seoData = inject(SeoDataService);
  private readonly siteService = inject(SiteService);

  private readonly _showCta = signal(true);
  /** Whether the current page shows the footer CTA band (`showCta` in its page data; default true). */
  readonly showCta = this._showCta.asReadonly();

  /** Call once from the root component. */
  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const root = this.router.routerState.snapshot.root;
        // /admin is not a website page: AdminRoot (admin/admin-root.ts) sets its own head tags, and no SEO data is fetched.
        if (root.firstChild?.data['admin']) return;
        const key = this.routeKey(root);
        const path = e.urlAfterRedirects.split(/[?#]/)[0] || '/';
        forkJoin([
          this.seoData.getSiteSeo(),
          this.siteService.getSite(),
          this.seoData.getPageSeo(key ?? ''),
        ]).subscribe(([site, config, page]) => this.apply(site, config, page, path));
      });
  }

  private routeKey(route: ActivatedRouteSnapshot): string | null {
    let r: ActivatedRouteSnapshot | null = route;
    let key: string | null = null;
    while (r) {
      const seo = r.data['seo'] as string | undefined;
      // `seoParam` makes one route serve many pages: seo 'learning' + param 'slug' -> key 'learning/<slug>'.
      const param = r.data['seoParam'] as string | undefined;
      if (seo) key = param ? `${seo}/${r.params[param]}` : seo;
      r = r.firstChild;
    }
    return key;
  }

  private apply(
    site: SiteSeo,
    config: SiteConfig,
    page: PageSeo | null,
    requestPath: string,
  ): void {
    // Unknown routes (404) get a noindex page with the site defaults.
    const known = page !== null;
    this._showCta.set(page?.showCta ?? true);
    const canonicalPath = page?.path ?? requestPath;
    const url = site.siteUrl + (canonicalPath === '/' ? '' : canonicalPath);
    const title = buildTitle({
      metaTitle: page?.metaTitle,
      pageTitle: page?.pageTitle ?? 'Page not found',
      isHome: page?.isHome,
      siteName: site.siteName,
      suffix: site.titleSuffix,
    });
    const description = buildDescription(page?.metaDescription, site.defaultDescription);
    const image = page?.ogImage ?? site.defaultOgImage;
    const imageUrl = site.siteUrl + image.src;

    this.title.setTitle(title);
    this.set('name', 'description', description);
    this.set('name', 'keywords', site.keywords);
    this.set('name', 'author', site.author);
    this.set('name', 'theme-color', site.themeColor);
    this.set('name', 'robots', known && !page?.noindex ? null : 'noindex');

    this.set('property', 'og:type', page?.ogType ?? 'website');
    this.set('property', 'og:site_name', config.name);
    this.set('property', 'og:title', title);
    this.set('property', 'og:description', description);
    this.set('property', 'og:url', url);
    this.set('property', 'og:image', imageUrl);
    this.set('property', 'og:image:alt', image.alt);

    this.set('name', 'twitter:card', 'summary_large_image');
    this.set('name', 'twitter:title', title);
    this.set('name', 'twitter:description', description);
    this.set('name', 'twitter:image', imageUrl);

    this.setCanonical(url);
    this.setJsonLd(
      page?.isHome ? toJsonLdScript(organizationJsonLd(site.siteUrl, config, site)) : null,
    );
  }

  /** `null` removes the tag. */
  private set(attr: 'name' | 'property', key: string, content: string | null): void {
    if (content === null) {
      this.meta.removeTag(`${attr}="${key}"`);
      return;
    }
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }

  private setCanonical(href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setJsonLd(json: string | null): void {
    this.doc.getElementById(JSONLD_ID)?.remove();
    if (!json) return;
    const script = this.doc.createElement('script');
    script.id = JSONLD_ID;
    script.type = 'application/ld+json';
    script.textContent = json;
    this.doc.head.appendChild(script);
  }
}
