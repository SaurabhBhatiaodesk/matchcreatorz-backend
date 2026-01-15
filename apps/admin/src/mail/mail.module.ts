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
//             from: config.get('MAIL_FROM'),
//           },
//           template: {
//             dir: join(__dirname, 'mail/templates'),
//             adapter: new EjsAdapter(),
//             options: {
//               strict: false,
//             },
//           },
//         };
//       },
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [MailService],
//   exports: [MailService],
// })
// export class MailModule {}


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
        const isProduction = config.get<string>('NODE_ENV')?.toUpperCase() === 'PRODUCTION';

        // Choose path based on environment
        const templateDir = isProduction
          ? join(process.cwd(), 'dist', 'apps', 'admin', 'mail', 'templates') // change to 'user' for user app
          : join(process.cwd(), 'apps', 'admin', 'src', 'mail', 'templates'); // change to 'user' for user app

        // Optional: Debug line (remove after testing)
        console.log(`[Mailer] Template directory for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}: ${templateDir}`);

        const smtpUsername = config.get('SMTP_USERNAME');
        const smtpPassword = config.get('SMTP_PASSWORD');

        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            secure: config.get('SMTP_SECURE'), // usually false for 587
            tls: {
              rejectUnauthorized: false, // optional - safe for dev
            },
            ...(smtpUsername && smtpPassword ? {
              auth: {
                user: smtpUsername,
                pass: smtpPassword,
              },
            } : {}),
          },
          defaults: {
            from: config.get('MAIL_FROM') ?? '"Match Creators" <matchcreators@matchcreatorz.com>',
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




