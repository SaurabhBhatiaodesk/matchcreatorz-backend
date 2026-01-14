import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendMailToUserForMailUpdate(user: any, hashToken: string) {
    const mailRes = await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: './user-reset-password',
      context: {
        siteTitle: this.configService.get<string>('SITE_TITLE'),
        emailLogo: this.configService.get<string>('LOGO_PATH'),
        verificationCode: hashToken,
        name: user?.fullName ?? 'User'
      },
    });
    return mailRes;
  }

  async sendMailToUserForMailUpdateCheck(user: any, hashToken: string) {
    const mailRes = await this.mailerService.sendMail({
      to: user.tempEmail,
      subject: 'Reset Password',
      template: './user-reset-password',
      context: {
        siteTitle: this.configService.get<string>('SITE_TITLE'),
        emailLogo: this.configService.get<string>('LOGO_PATH'),
        verificationCode: hashToken,
        name: user?.fullName ?? 'User',
        resetLink: `${this.configService.get<string>('WEB_URL')}reset-password/${hashToken}`,
      },
    });
    return mailRes;
  }

  async sendMailToUserForWelComeMail(user: any, hashToken: string, otp:any) {

    console.log('hashToken:::', hashToken);
    const url = `${process.env.HOST}:${process.env.PORT}`;
    const mailRes = await this.mailerService.sendMail({
      to: user.email,
      subject: `WelCome ${user?.fullName ?? 'User'}`,
      template: './welcome-user',
      context: {
        siteTitle: this.configService.get<string>('SITE_TITLE'),
        emailLogo: this.configService.get<string>('LOGO_PATH'),
        verificationCode: otp,
        name: user?.fullName ?? 'User',
        //resetLink: `${this.configService.get<string>('SITE_URL')}/auth/verify-email-token?validateString=${hashToken}`,
        resetLink: `${url}/auth/verify-email-token?validateString=${hashToken}`,
      },
    });
    return mailRes;
  }
}
