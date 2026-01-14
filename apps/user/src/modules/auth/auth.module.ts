import { UserLibService } from '@app/user-lib';
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtUserAuthGuard } from 'common/guards';
import { City, Country, Otp, State, User, UserTag, Service, UserPortfolio, UserFaq, WithdrawRequest, Category, Tag, WalletTransaction, Report, Notification, ServiceBids, Favorite, ChatRequest, Booking, UserReviews, AdminSetting,Admin, Chat, SocialAccount } from 'common/models';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FcmService } from 'common/utils/fcm.service';
@Module({
  imports: [TypeOrmModule.forFeature([Favorite, ServiceBids, Notification, Report, User, SocialAccount, Otp, Country, State, City, UserTag, Service, UserPortfolio, UserFaq, WithdrawRequest, Category, Tag, WalletTransaction, ChatRequest, Booking, UserReviews, AdminSetting,Admin, Chat])],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtUserAuthGuard,
    },
    Reflector,
    UserLibService,
    AuthService,
    FcmService
  ],
})
export class AuthModule {}
