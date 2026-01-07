import { Module } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { MailService } from './mail.service';
import { env } from '../config/env';
import { MAIL_TRANSPORTER } from './mail.token';

@Module({
  providers: [
    {
      provide: MAIL_TRANSPORTER,
      useFactory: (): Transporter => {
        // Uses your static env helper
        return createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'no-reply@simmortals.com',
            clientId: env.mail.googleClientId,
            clientSecret: env.mail.googleClientSecret,
            refreshToken: env.mail.googleRefreshToken,
          },
        });
      },
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
