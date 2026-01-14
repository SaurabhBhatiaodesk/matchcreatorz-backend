import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, User, UserTag, UserFaq, Tag, UserPortfolio, Category, Country, State, City, SocialAccount } from 'common/models';
import { MyAccountController } from './my-account.controller';
import { MyAccountService } from './my-account.service';
import { MailService } from '../../mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, UserTag, UserFaq, Tag, UserPortfolio, Category, Country, State, City, SocialAccount])],
  controllers: [MyAccountController],
  providers: [MyAccountService, MailService],
})
export class MyAccountModule {}
