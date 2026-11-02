import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

/**
 * Read-only JSON API for the website. No login, GET only, published content only.
 * Page endpoints return the same shapes as the website's models (HomePageContent, AboutPageContent, ...).
 */
@Controller('api/public')
export class PublicController {
  constructor(private readonly pub: PublicService) {}

  // site-wide
  @Get('site') site() { return this.pub.site(); }
  @Get('nav') nav() { return this.pub.nav(); }

  // SEO
  @Get('seo/site') seoSite() { return this.pub.seoSite(); }
  @Get('seo/pages') seoPages() { return this.pub.seoPages(); }
  @Get('seo/pages/:key') seoPage(@Param('key') key: string) { return this.pub.seoPage(key); }
  @Get('seo/articles/:slug') seoArticle(@Param('slug') slug: string) { return this.pub.seoArticle(slug); }

  @Get('seo/jobs/:slug') seoJob(@Param('slug') slug: string) { return this.pub.seoJob(slug); }

  // pages
  @Get('pages/home') home() { return this.pub.home(); }
  @Get('pages/about') about() { return this.pub.about(); }
  @Get('pages/services') services() { return this.pub.services(); }
  @Get('pages/learning') learning() { return this.pub.learning(); }
  @Get('pages/careers') careers() { return this.pub.careers(); }
  @Get('pages/contact') contact() { return this.pub.contact(); }

  // single items
  @Get('learning/:slug') article(@Param('slug') slug: string) { return this.pub.article(slug); }
  @Get('jobs/:slug') job(@Param('slug') slug: string) { return this.pub.job(slug); }
}
