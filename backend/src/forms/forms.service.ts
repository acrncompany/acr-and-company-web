import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessageType, Status } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { env, paths } from '../config/env';
import { escapeHtml, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { checkCv } from './cv';
import { ApplicationDto, ConsultationDto, ContactDto } from './dto';

/** Where CVs are stored: inside PRIVATE_DIR, which is never served by the web server. */
export const cvDir = () => path.join(paths.privateDir, 'cvs');

type Row = [label: string, value: string | undefined | null];

/** The alert email: a small table of what the visitor sent, plus a link to the admin inbox. */
function alertMail(heading: string, rows: Row[], adminPath: string) {
  const shown = rows.filter(([, v]) => v);
  const link = `${env.siteUrl}${adminPath}`;
  const text = `${heading}\n\n${shown.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nOpen in the admin: ${link}\n`;
  const html =
    `<h2 style="font-family:sans-serif;color:#0a2342">${escapeHtml(heading)}</h2>` +
    `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">` +
    shown
      .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#5b6b7b;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v!)}</td></tr>`)
      .join('') +
    `</table><p style="font-family:sans-serif;font-size:14px"><a href="${escapeHtml(link)}">Open in the admin</a></p>`;
  return { text, html };
}

@Injectable()
export class FormsService {
  private readonly log = new Logger('Forms');

  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  private settings() {
    return this.prisma.siteSettings.findUnique({ where: { id: 1 }, select: { notificationEmail: true, careersEmail: true } });
  }

  /** Honeypot filled in: pretend it worked, keep nothing. */
  private isBot(dto: { website?: string }, form: string): boolean {
    if (!dto.website) return false;
    this.log.warn(`Honeypot filled in on the ${form} form: submission dropped.`);
    return true;
  }

  async contact(dto: ContactDto) {
    if (this.isBot(dto, 'contact')) return { ok: true };
    const m = await this.prisma.contactMessage.create({
      data: { type: MessageType.CONTACT, name: dto.name, company: dto.company || null, email: dto.email, phone: dto.phone, service: dto.service || null, message: dto.message },
    });
    const s = await this.settings();
    const subject = `New contact message from ${dto.name}`;
    const { text, html } = alertMail(subject, [
      ['Name', dto.name], ['Company', dto.company], ['Email', dto.email], ['Phone', dto.phone], ['Service', dto.service], ['Message', dto.message],
    ], `/admin/inbox/messages?open=${m.id}`);
    void this.mail.send({ to: s?.notificationEmail ?? '', subject, text, html, replyTo: dto.email });
    return { ok: true };
  }

  async consultation(dto: ConsultationDto) {
    if (this.isBot(dto, 'consultation')) return { ok: true };
    const m = await this.prisma.contactMessage.create({
      data: { type: MessageType.CONSULTATION, name: dto.name, phone: dto.phone, service: dto.service || null, preferredTime: dto.preferredTime || null },
    });
    const s = await this.settings();
    const subject = `New consultation request from ${dto.name}`;
    const { text, html } = alertMail(subject, [
      ['Name', dto.name], ['Phone', dto.phone], ['Service', dto.service], ['Preferred time', dto.preferredTime],
    ], `/admin/inbox/messages?open=${m.id}`);
    void this.mail.send({ to: s?.notificationEmail ?? '', subject, text, html });
    return { ok: true };
  }

  async application(dto: ApplicationDto, file: Express.Multer.File | undefined) {
    if (this.isBot(dto, 'application')) return { ok: true };

    // Only a position that is open on the website can be applied to.
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const job = await this.prisma.job.findFirst({
      where: { slug: dto.jobSlug, status: Status.PUBLISHED, OR: [{ closingDate: null }, { closingDate: { gte: startOfToday } }] },
    });
    if (!job) throw new NotFoundException({ code: 'job_closed', message: 'This position is no longer open.' });

    // The CV is optional: the website form no longer asks for one, but a file that is sent is still checked and stored.
    const cv = file ? checkCv(file) : null;
    const stored = cv ? `${randomUUID()}${cv.ext}` : '';
    if (cv) {
      fs.mkdirSync(cvDir(), { recursive: true });
      await fs.promises.writeFile(path.join(cvDir(), stored), file!.buffer, { flag: 'wx' });
    }

    let app;
    try {
      app = await this.prisma.jobApplication.create({
        data: {
          jobId: job.id, jobTitle: job.title, name: dto.name, email: dto.email, phone: dto.phone, message: dto.message || null,
          cvFile: stored, cvOriginalName: cv?.originalName ?? '', cvMimeType: cv?.mimeType ?? '',
        },
      });
    } catch (e) {
      if (stored) await fs.promises.rm(path.join(cvDir(), stored), { force: true }); // no database row: do not keep an orphan file
      throw e;
    }

    const s = await this.settings();
    const subject = `New application: ${job.title} - ${dto.name}`;
    const { text, html } = alertMail(`New application for ${job.title}`, [
      ['Position', job.title], ['Name', dto.name], ['Email', dto.email], ['Phone', dto.phone], ['Cover note', dto.message], ['CV', cv?.originalName ?? ''],
    ], `/admin/inbox/applications?open=${app.id}`);
    // The CV is not attached: it stays in private storage and is downloaded from the admin inbox by a logged-in admin.
    void this.mail.send({ to: job.applyEmail || s?.careersEmail || '', subject, text, html, replyTo: dto.email });
    return { ok: true };
  }
}
