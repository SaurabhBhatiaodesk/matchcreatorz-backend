import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Global() // 👈 global module
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const smtpUsername = config.get('SMTP_USERNAME');
        const smtpPassword = config.get('SMTP_PASSWORD');

        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            secure: config.get('SMTP_SECURE'),
            ...(smtpUsername && smtpPassword ? {
              auth: {
                user: smtpUsername,
                pass: smtpPassword,
              },
            } : {}),
          },
          defaults: {
            from: config.get('MAIL_FROM') ?? 'no-replay<match-creator>@gmail.com',
          },
          // template: {
          //   dir: join(__dirname, 'mail/templates'),
          //   adapter: new EjsAdapter(),
          //   options: {
          //     strict: false,
          //   },
          // },
          template: {
            dir: process.env.NODE_ENV === 'production'
              ? '/home/ubuntu/MatchcreatorsBackend/dist/apps/user/mail/templates'
              : 'apps/user/src/mail/templates',
            adapter: new EjsAdapter(),
            // options: { strict: true },
          },

        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
