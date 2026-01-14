import { BookingsLibService } from '@app/booking-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, User, Service, Country, Category, Tag, UserTag, AdminSetting, OfferImage, Offer, OfferDocument, Booking, ServiceBids, WalletTransaction,Milestone, Favorite, Report, ChatRequest, UserReviews, Notification, Chat } from 'common/models';
import { BookingController } from './booking.controller';
import { FcmService } from 'common/utils';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, Service, Country, Offer, OfferDocument, OfferImage, Category, Tag, UserTag, AdminSetting, Booking, ServiceBids, WalletTransaction, Milestone, Favorite, Report, ChatRequest, UserReviews, Notification, Chat])],
  controllers: [BookingController],
  providers: [BookingsLibService, FcmService],
})
export class BookingModule {}
