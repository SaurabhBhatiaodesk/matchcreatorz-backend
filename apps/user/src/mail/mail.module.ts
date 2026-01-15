// import { MailerModule } from '@nestjs-modules/mailer';
// import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
// import { Global, Module } from '@nestjs/common';
// import { MailService } from './mail.service';
// import { join } from 'path';
// import { ConfigService } from '@nestjs/config';

// @Global() // 👈 global module
// @Module({
//   imports: [
//     MailerModule.forRootAsync({
//       useFactory: async (config: ConfigService) => {
//         const smtpUsername = config.get('SMTP_USERNAME');
//         const smtpPassword = config.get('SMTP_PASSWORD');

//         return {
//           transport: {
//             host: config.get('SMTP_HOST'),
//             port: config.get('SMTP_PORT'),
//             secure: config.get('SMTP_SECURE'),
//             ...(smtpUsername && smtpPassword ? {
//               auth: {
//                 user: smtpUsername,
//                 pass: smtpPassword,
//               },
//             } : {}),
//           },
//           defaults: {
//             from: config.get('MAIL_FROM') ?? 'no-replay<match-creator>@gmail.com',
//           },
//           // template: {
//           //   dir: join(__dirname, 'mail/templates'),
//           //   adapter: new EjsAdapter(),
//           //   options: {
//           //     strict: false,
//           //   },
//           // },
//           template: {
//             dir: process.env.NODE_ENV === 'production'
//               ? '/home/ubuntu/MatchcreatorsBackend/dist/apps/user/mail/templates'
//               : 'apps/user/src/mail/templates',
//             adapter: new EjsAdapter(),
//             // options: { strict: true },
//           },

//         };
//       },
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [MailService],
//   exports: [MailService],
// })
// export class MailModule { }


import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const templateDir = join(
          process.cwd(),
          'apps',
          'user',
          'src',
          'mail',
          'templates'
        );

        console.log('[Mailer] Using template directory:', templateDir); // ← Debug line - remove later

        return {
          transport: {
            host: config.get<string>('SMTP_HOST', 'smtp.office365.com'),
            port: config.get<number>('SMTP_PORT', 587),
            secure: false,
            tls: { rejectUnauthorized: false },
            auth: {
              user: config.get<string>('SMTP_USERNAME'),
              pass: config.get<string>('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: `"Match Creators" <${config.get<string>('SMTP_FROM_EMAIL')}>`,
          },
          template: {
            dir: templateDir,
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}