import { ServiceLibService } from '@app/service-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, User, Service, Country, Category, Tag, UserTag, Document, Images, AdminSetting, ServiceBids, ConnectTransaction, Booking, Notification, Offer, WalletTransaction, Milestone, Favorite, Report, ChatRequest, CompletionProof, UserReviews, Chat } from 'common/models';
import { ServiceController } from './service.controller';
import { FcmService } from 'common/utils';
import { BookingsLibService } from '@app/booking-lib';
@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, Service, Country,Document, Category, Tag, UserTag, Images, AdminSetting, ServiceBids, ConnectTransaction, Booking, Notification, Offer, WalletTransaction , Milestone, Favorite, Report, ChatRequest, CompletionProof, UserReviews, Chat])],
  controllers: [ServiceController],
  providers: [ServiceLibService, FcmService, BookingsLibService],
})
export class ServiceModule {}
