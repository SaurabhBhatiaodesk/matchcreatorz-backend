import { UserLibService } from '@app/user-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, User, Notification, UserTag, Service, UserPortfolio, UserFaq, Category, Tag, Report, ServiceBids, Favorite, ChatRequest, Booking, UserReviews, AdminSetting, Admin, Chat } from 'common/models';
import { UserController } from './user.controller';
import { FcmService } from 'common/utils/fcm.service';
@Module({
  imports: [TypeOrmModule.forFeature([Favorite, ServiceBids, Notification, Report, User, Otp, Notification, UserTag, Service, UserPortfolio, UserFaq, Category, Tag, ChatRequest, Booking, UserReviews, AdminSetting, Admin, Chat])],
  controllers: [UserController],
  providers: [UserLibService, FcmService],
})
export class UserModule {}
