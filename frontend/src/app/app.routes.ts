import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

const placeholder = () => import('./features/placeholder/placeholder-page').then((m) => m.PlaceholderPage);

/**
 * `data.seo` is the key into the page SEO served by the API (/api/public/seo/*); SeoService reads it on every navigation.
 * `title` is only a fallback for the browser tab until SeoService writes the final title.
 */
export const routes: Routes = [
  {
    // The admin panel: client-rendered only (app.routes.server.ts), not indexed (AdminRoot / server.ts / robots.txt), and loaded
    // lazily, so Angular Material, the editor and the admin theme are never part of the public website's bundle.
    path: 'admin',
    data: { admin: true },
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
        data: { seo: 'home' },
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about-page').then((m) => m.AboutPage),
        data: { seo: 'about' },
      },
      {
        path: 'services',
        loadComponent: () => import('./features/services/services-page').then((m) => m.ServicesPage),
        data: { seo: 'services' },
      },
      {
        path: 'learning',
        loadComponent: () => import('./features/learning/learning-page').then((m) => m.LearningPage),
        data: { seo: 'learning' },
      },
      {
        path: 'learning/:slug',
        loadComponent: () => import('./features/learning/article-page').then((m) => m.ArticlePage),
        data: { seo: 'learning', seoParam: 'slug' },
      },
      {
        path: 'careers',
        loadComponent: () => import('./features/careers/careers-page').then((m) => m.CareersPage),
        data: { seo: 'careers' },
      },
      {
        path: 'careers/:slug',
        loadComponent: () => import('./features/careers/job-page').then((m) => m.JobPage),
        data: { seo: 'careers', seoParam: 'slug' },
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact-page').then((m) => m.ContactPage),
        data: { seo: 'contact' },
      },
      { path: '**', loadComponent: placeholder, data: { heading: 'Page not found', notFound: true } },
    ],
  },
];
