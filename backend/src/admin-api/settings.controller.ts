import { BadRequestException, Body, Controller, Get, HttpCode, Logger, Patch, Post } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { generateFaviconSet, removeFaviconSet } from '../common/favicon';
import { paths } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { faviconDir } from '../seo/favicon.controller';
import { UpdateSettingsDto } from './dto';

const include = { logo: true, favicon: true, defaultOg: true };

/** Global site settings (single row): identity, contact details, WhatsApp, CTA band, header/footer, site SEO. */
@Controller('api/admin/settings')
export class SettingsController {
  private readonly log = new Logger('Settings');
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  get() {
    return this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 }, include });
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto) {
    const before = await this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
    // Rebuild the favicon set BEFORE saving, so a bad image is rejected without changing the settings.
    if (dto.faviconId !== undefined && dto.faviconId !== before.faviconId) await this.rebuildFavicon(dto.faviconId);
    return this.prisma.siteSettings.update({ where: { id: 1 }, data: dto, include });
  }

  /** "Make the browser icon from my logo": uses the current logo as the favicon and generates every size. */
  @Post('favicon/from-logo')
  async fromLogo() {
    const s = await this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
    if (!s.logoId) throw new BadRequestException('There is no logo yet. Choose a logo first and save.');
    await this.rebuildFavicon(s.logoId);
    return this.prisma.siteSettings.update({ where: { id: 1 }, data: { faviconId: s.logoId }, include });
  }

  /** Re-create the favicon files from the current favicon image (e.g. after the generator was improved). */
  @Post('favicon/regenerate')
  @HttpCode(204)
  async regenerate() {
    const s = await this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
    await this.rebuildFavicon(s.faviconId);
  }

  private async rebuildFavicon(mediaId: number | null) {
    if (mediaId === null) return removeFaviconSet(faviconDir);
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new BadRequestException('The chosen favicon image does not exist.');
    try {
      const ok = await generateFaviconSet(fs.readFileSync(path.join(paths.uploadDir, media.path)), faviconDir);
      if (!ok) this.log.warn('sharp is unavailable: favicon files were not regenerated.');
    } catch {
      throw new BadRequestException('That image could not be turned into a favicon. Please choose a square PNG/WebP logo.');
    }
  }
}
