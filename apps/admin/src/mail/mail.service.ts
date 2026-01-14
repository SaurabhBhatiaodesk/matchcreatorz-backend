import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Admin, User } from 'common/models';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendAdminResetPasswordMail(admin: Admin, hashToken: string) {
    const mailRes = await this.mailerService.sendMail({
      to: admin.email,
      subject: 'Reset Password',
      template: './admin-reset-password',
      context: {
        siteTitle: this.configService.get<string>('SITE_TITLE'),
        emailLogo: this.configService.get<string>('LOGO_PATH'),
        verificationCode: hashToken,
        resetLink: `${this.configService.get<string>('WEB_URL')}reset-password/${hashToken}`,
      },
    });
    return mailRes;
  }

  async sendMailToUser(user: any, password: any) {
    const mailRes = await this.mailerService.sendMail({
      to: user?.email ?? 'admin@yopmail.com',
      subject: 'Registration completed',
      template: './user-registration',
      context: {
        siteTitle: this.configService.get<string>('SITE_TITLE'),
        emailLogo: this.configService.get<string>('LOGO_PATH'),
        subject: 'Registration completed',
        email: user?.email ?? 'admin@yopmail.com',
        user: user,
        password: password
      },
    });
    return mailRes;
  }

  async sendMailToSellerFORProfileStatus(user: User, subject: string, messageBody: string) {
    const mailRes = await this.mailerService.sendMail({
      to: user.email,
      subject: subject,
      template: './user-profile-status',
      context: {
        siteTitle: this.configService.get<string>('SITE_TITLE'),
        emailLogo: this.configService.get<string>('LOGO_PATH'),
        user:user,
        reason: messageBody,
        subject: subject,
        }
    });
    return mailRes;
  }
}
