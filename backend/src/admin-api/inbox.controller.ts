import {
  Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseIntPipe, Patch, Query, Res, StreamableFile,
} from '@nestjs/common';
import { MessageType, Prisma } from '@prisma/client';
import { IsBoolean } from 'class-validator';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { cvDir } from '../forms/forms.service';
import { PrismaService } from '../prisma/prisma.service';

class ReadDto {
  @IsBoolean() isRead: boolean;
}

const pageOf = (page?: string) => Math.max(1, parseInt(page ?? '1', 10) || 1);
const limitOf = (limit?: string) => Math.min(100, Math.max(1, parseInt(limit ?? '25', 10) || 25));

/** Unread numbers for the sidebar and the dashboard badges. */
@Controller('api/admin/inbox')
export class InboxCountsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('counts')
  async counts() {
    const [contact, consultation, contactUnread, consultationUnread, applications, applicationsUnread] = await Promise.all([
      this.prisma.contactMessage.count({ where: { type: MessageType.CONTACT } }),
      this.prisma.contactMessage.count({ where: { type: MessageType.CONSULTATION } }),
      this.prisma.contactMessage.count({ where: { type: MessageType.CONTACT, isRead: false } }),
      this.prisma.contactMessage.count({ where: { type: MessageType.CONSULTATION, isRead: false } }),
      this.prisma.jobApplication.count(),
      this.prisma.jobApplication.count({ where: { isRead: false } }),
    ]);
    return {
      contact, consultation, contactUnread, consultationUnread, applications, applicationsUnread,
      messages: contact + consultation,
      messagesUnread: contactUnread + consultationUnread,
    };
  }
}

/** Contact + consultation messages (one inbox, filter by type). */
@Controller('api/admin/messages')
export class MessagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('type') type?: string, @Query('status') status?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const where: Prisma.ContactMessageWhereInput = {};
    if (type === MessageType.CONTACT || type === MessageType.CONSULTATION) where.type = type;
    if (status === 'unread') where.isRead = false;
    const take = limitOf(limit);
    const [total, items] = await Promise.all([
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (pageOf(page) - 1) * take, take }),
    ]);
    return { total, page: pageOf(page), limit: take, items };
  }

  @Patch(':id')
  async setRead(@Param('id', ParseIntPipe) id: number, @Body() dto: ReadDto) {
    try {
      return await this.prisma.contactMessage.update({ where: { id }, data: { isRead: dto.isRead } });
    } catch {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.contactMessage.deleteMany({ where: { id } });
  }
}

/** Job applications. The CV files live in private storage and can only be downloaded through this (login-protected) API. */
@Controller('api/admin/applications')
export class ApplicationsController {
  constructor(private readonly prisma: PrismaService) {}

  /** The filter list: every position that has applications (also a removed position, by its saved title), with counts. */
  @Get('jobs')
  async jobs() {
    const rows = await this.prisma.jobApplication.groupBy({ by: ['jobId', 'jobTitle'], _count: { _all: true } });
    const unread = await this.prisma.jobApplication.groupBy({ by: ['jobId', 'jobTitle'], where: { isRead: false }, _count: { _all: true } });
    const key = (r: { jobId: number | null; jobTitle: string | null }) => `${r.jobId}|${r.jobTitle}`;
    const unreadBy = new Map(unread.map((r) => [key(r), r._count._all]));
    const live = await this.prisma.job.findMany({ select: { id: true, title: true } });
    const title = new Map(live.map((j) => [j.id, j.title]));
    // A position that was renamed keeps one entry (its current title); a deleted position keeps its saved title.
    const merged = new Map<string, { jobId: number | null; title: string; total: number; unread: number }>();
    for (const r of rows) {
      const k = r.jobId === null ? `none:${r.jobTitle}` : `id:${r.jobId}`;
      const cur = merged.get(k) ?? { jobId: r.jobId, title: (r.jobId !== null && title.get(r.jobId)) || r.jobTitle || 'Removed position', total: 0, unread: 0 };
      cur.total += r._count._all;
      cur.unread += unreadBy.get(key(r)) ?? 0;
      merged.set(k, cur);
    }
    return [...merged.values()].sort((a, b) => a.title.localeCompare(b.title));
  }

  @Get()
  async list(@Query('jobId') jobId?: string, @Query('status') status?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const where: Prisma.JobApplicationWhereInput = {};
    if (jobId === 'none') where.jobId = null;
    else if (jobId && /^\d+$/.test(jobId)) where.jobId = parseInt(jobId, 10);
    if (status === 'unread') where.isRead = false;
    const take = limitOf(limit);
    const [total, items] = await Promise.all([
      this.prisma.jobApplication.count({ where }),
      this.prisma.jobApplication.findMany({
        where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (pageOf(page) - 1) * take, take,
        // The stored file name is internal: it is never sent to the browser.
        select: { id: true, jobId: true, jobTitle: true, name: true, email: true, phone: true, message: true, cvOriginalName: true, cvMimeType: true, isRead: true, createdAt: true },
      }),
    ]);
    return { total, page: pageOf(page), limit: take, items };
  }

  @Patch(':id')
  async setRead(@Param('id', ParseIntPipe) id: number, @Body() dto: ReadDto) {
    try {
      const { cvFile: _cv, ...rest } = await this.prisma.jobApplication.update({ where: { id }, data: { isRead: dto.isRead } });
      return rest;
    } catch {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const app = await this.prisma.jobApplication.findUnique({ where: { id } });
    if (!app) return;
    await this.prisma.jobApplication.delete({ where: { id } });
    await fs.promises.rm(this.cvPath(app.cvFile), { force: true }); // the CV goes with the application
  }

  @Get(':id/cv')
  async cv(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response) {
    const app = await this.prisma.jobApplication.findUnique({ where: { id } });
    const file = app && this.cvPath(app.cvFile);
    if (!app || !file || !fs.existsSync(file)) throw new NotFoundException('The CV file was not found.');
    const ascii = app.cvOriginalName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
    res.set({
      'Content-Type': app.cvMimeType,
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(app.cvOriginalName)}`,
      'Content-Length': String(fs.statSync(file).size),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    });
    return new StreamableFile(fs.createReadStream(file));
  }

  /** The stored name is generated by the server (a UUID + extension); this still refuses anything that would leave the CV folder. */
  private cvPath(stored: string): string {
    const full = path.resolve(cvDir(), path.basename(stored));
    return full.startsWith(path.resolve(cvDir()) + path.sep) ? full : '';
  }
}
