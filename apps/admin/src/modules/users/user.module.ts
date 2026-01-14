import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserTag, Service, UserPortfolio, UserFaq, WithdrawRequest, Category, Tag, WalletTransaction, Report, UserBankAccount, Notification, ServiceBids, Favorite, ChatRequest, Booking, UserReviews, AdminSetting,Admin, Chat } from 'common/models';
import { UserLibService } from '@app/user-lib';
import { FcmService } from 'common/utils/fcm.service';
@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, UserTag, Service, UserPortfolio, UserFaq, WithdrawRequest, Category, Tag, WalletTransaction, Report, UserBankAccount, Notification, ServiceBids, ChatRequest, Booking, UserReviews, AdminSetting,Admin, Chat])],
  controllers: [UserController],
  providers: [UserLibService, FcmService],
})
export class UserModule {}
