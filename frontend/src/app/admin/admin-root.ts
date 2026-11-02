import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

/** Class on <html> while /admin is open. The website's global styles (styles.scss) switch themselves off under it. */
const ADMIN_AREA_CLASS = 'admin-area';
const ADMIN_TITLE = 'ACR & Company · Website editor';

/**
 * Root of the /admin section. Its stylesheet is the admin theme (Material theme, admin colours, icon font). Because it belongs to this
 * component, it is downloaded and applied only when /admin is opened, and removed again when the visitor goes back to the website.
 * (ViewEncapsulation.None because the theme is global: CSS variables on <html>, Material overrides, body defaults.)
 *
 * It also makes the section invisible to search engines: `noindex` here, an X-Robots-Tag header from the server, Disallow in
 * robots.txt, and no entry in the sitemap. The website's own tags (description, Open Graph, canonical, JSON-LD) are removed
 * because they belong to the page the visitor came from; SeoService writes them again when the visitor returns to the website.
 */
@Component({
  selector: 'app-admin-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styleUrl: './admin-theme.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AdminRoot implements OnDestroy {
  private readonly doc = inject(DOCUMENT);

  constructor() {
    this.doc.documentElement.classList.add(ADMIN_AREA_CLASS);

    const meta = inject(Meta);
    inject(Title).setTitle(ADMIN_TITLE);
    meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    meta.updateTag({ name: 'theme-color', content: '#0a2342' });
    for (const name of ['description', 'keywords', 'author', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      meta.removeTag(`name="${name}"`);
    }
    for (const property of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
      meta.removeTag(`property="${property}"`);
    }
    this.doc.head.querySelector('link[rel="canonical"]')?.remove();
    this.doc.getElementById('acr-jsonld')?.remove();
  }

  ngOnDestroy(): void {
    this.doc.documentElement.classList.remove(ADMIN_AREA_CLASS);
  }
}
