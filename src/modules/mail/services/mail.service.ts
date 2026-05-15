import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { getNotificationTemplate } from '../templates/notification.template';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const secure = String(this.config.get('SMTP_SECURE') || 'false') === 'true';
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
  }

  async sendHtml(to: string, subject: string, html: string) {
    const from =
      this.config.get<string>('MAIL_FROM') ??
      `MUB <${this.config.get<string>('SMTP_USER')}>`;
    await this.transporter.sendMail({ from, to, subject, html });
  }

  async sendNotificationEmail(
    to: string,
    name: string,
    title: string,
    message: string,
    type: string,
  ) {
    const appName = this.config.get<string>('APP_NAME') || 'MUB System';
    const html = getNotificationTemplate(appName, name, title, message, type);
    await this.sendHtml(to, title, html);
  }
}
