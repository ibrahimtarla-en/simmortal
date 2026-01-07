// mail/mail.service.ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { registerMailAdapter } from './mailAdapter';
import { MAIL_TRANSPORTER } from './mail.token';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  constructor(@Inject(MAIL_TRANSPORTER) private readonly tx: Transporter) {}

  onModuleInit() {
    // Make this service accessible to non-DI code (e.g., SuperTokens config)
    registerMailAdapter({
      sendVerification: (to, html, subject) =>
        this.send({
          to,
          subject,
          html,
        }),
      sendPasswordReset: (to, html, subject) =>
        this.send({
          to,
          subject,
          html,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            Importance: 'High',
            Precedence: 'high',
          },
        }),
      sendWelcomeEmail: (to, html, subject) =>
        this.send({
          to,
          subject,
          html,
        }),
    });
  }

  async send(opts: {
    to: string;
    subject: string;
    html: string;
    headers?: Record<string, string>;
  }) {
    try {
      await this.tx.sendMail({
        from: 'Simmortals <no-reply@simmortals.com>',
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        headers: opts.headers,
      });
    } catch (e) {
      this.logger.error(`Email send failed to ${opts.to}: ${e}`);
      throw e;
    }
  }
}
