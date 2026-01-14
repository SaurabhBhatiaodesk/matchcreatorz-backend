import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSetting, Booking, Offer, Service, ServiceBids, Tag, User, WalletTransaction, Milestone, Favorite, Report, ChatRequest, UserReviews, Notification, Chat } from 'common/models';
import { BookingsLibService } from '@app/booking-lib';
import { FcmService } from 'common/utils';
@Module({
  imports: [TypeOrmModule.forFeature([User, Booking, Service, Offer, AdminSetting, Tag, ServiceBids, WalletTransaction, Milestone, Favorite, Report, ChatRequest, UserReviews, Notification, Chat])],
  controllers: [StatisticsController],
  providers: [BookingsLibService, FcmService],
})
export class StatisticsModule {}
