import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { smtp } from '../config/env';

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/** Plain-text -> safe HTML. Everything a visitor typed goes through this before it is placed in an email. */
export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Sends the alert emails. send() NEVER throws and never blocks a form: when SMTP is not configured, or the mail server
 * refuses, it logs a warning and the submission stays saved in the database (and visible in the admin inbox).
 */
@Injectable()
export class MailService {
  private readonly log = new Logger('Mail');
  private readonly transport = smtp.configured
    ? nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      })
    : null;

  constructor() {
    if (!this.transport) this.log.warn('SMTP is not configured (set SMTP_HOST and SMTP_FROM in .env). Forms still save; email alerts are not sent.');
  }

  async send(mail: Mail): Promise<boolean> {
    // A header can never contain a line break: strip them from anything that ends up in a header.
    const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();
    if (!this.transport) {
      this.log.warn(`SMTP not configured: alert "${oneLine(mail.subject)}" for ${mail.to || '(no recipient)'} was NOT sent. The submission is saved.`);
      return false;
    }
    if (!mail.to) {
      this.log.warn(`No recipient address is set for alert "${oneLine(mail.subject)}". The submission is saved.`);
      return false;
    }
    try {
      await this.transport.sendMail({
        from: smtp.from,
        to: mail.to,
        replyTo: mail.replyTo ? oneLine(mail.replyTo) : undefined,
        subject: oneLine(mail.subject),
        text: mail.text,
        html: mail.html,
      });
      return true;
    } catch (e) {
      this.log.warn(`Could not send alert "${oneLine(mail.subject)}" to ${mail.to}: ${(e as Error).message}. The submission is saved.`);
      return false;
    }
  }
}
