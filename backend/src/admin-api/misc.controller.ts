import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Status } from '@prisma/client';
import { slugify } from '../common/slug';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { buildDescription, buildTitle } from '../seo/seo-rules';

/** Numbers and warnings for the admin home screen. */
@Controller('api/admin/dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    const [unreadMessages, unreadApplications, draftPosts, publishedPosts, draftJobs, publishedJobs, services, serviceCategories, settings] = await Promise.all([
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.prisma.jobApplication.count({ where: { isRead: false } }),
      this.prisma.post.count({ where: { status: Status.DRAFT } }),
      this.prisma.post.count({ where: { status: Status.PUBLISHED } }),
      this.prisma.job.count({ where: { status: Status.DRAFT } }),
      this.prisma.job.count({ where: { status: Status.PUBLISHED } }),
      this.prisma.service.count({ where: { status: Status.PUBLISHED } }),
      this.prisma.serviceCategory.count({ where: { status: Status.PUBLISHED } }),
      this.prisma.siteSettings.findUnique({ where: { id: 1 } }),
    ]);
    const digits = (settings?.whatsappNumber ?? '').replace(/\D/g, '');
    return {
      unreadMessages, unreadApplications, draftPosts, publishedPosts, draftJobs, publishedJobs, services, serviceCategories,
      // The website hides the WhatsApp button until a real number is saved: tell the owner.
      whatsappMissing: digits.length < 8 || digits.length > 15,
      faviconMissing: !settings?.faviconId,
    };
  }
}

export class SeoPreviewDto {
  @IsEnum(['page', 'service', 'post', 'job'] as const) kind: 'page' | 'service' | 'post' | 'job';
  /** For kind=page: home, about, ... */
  @IsOptional() @IsString() @MaxLength(50) pageKey?: string;
  @IsOptional() @IsString() @MaxLength(250) title?: string;
  @IsOptional() @IsString() @MaxLength(200) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(400) metaDescription?: string;
  @IsOptional() @IsString() @MaxLength(270) slug?: string;
  /** Text used as the description fallback (excerpt / description). */
  @IsOptional() @IsString() @MaxLength(200000) text?: string;
}

const SECTION: Record<string, string> = { service: 'services', post: 'learning', job: 'careers' };

/**
 * Powers the "Google preview" in every SEO panel. It uses the SAME rules as the public website (seo/seo-rules.ts),
 * so the preview shows exactly the title/description visitors and search engines will get.
 */
@Controller('api/admin/seo')
export class SeoPreviewController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('preview')
  async preview(@Body() dto: SeoPreviewDto) {
    const s = await this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
    let url = env.siteUrl;
    let isHome = false;
    if (dto.kind === 'page') {
      const page = dto.pageKey ? await this.prisma.page.findUnique({ where: { key: dto.pageKey } }) : null;
      isHome = page?.slug === '';
      url += page?.slug ? `/${page.slug}` : '/';
    } else if (dto.kind === 'service') {
      url += '/services'; // services are cards on the Services page, not pages of their own
    } else {
      url += `/${SECTION[dto.kind]}/${slugify(dto.slug || dto.title || '') || '...'}`;
    }
    const title = buildTitle({ metaTitle: dto.metaTitle, pageTitle: dto.title, isHome, siteName: s.siteName, suffix: s.titleSuffix });
    const description = buildDescription(dto.metaDescription, dto.text, s.defaultMetaDescription);
    return {
      title, description, url,
      titleLength: title.length, descriptionLength: description.length,
      // Soft targets for the character counters (Google truncates around these).
      titleTarget: 60, descriptionTarget: 160,
    };
  }
}
