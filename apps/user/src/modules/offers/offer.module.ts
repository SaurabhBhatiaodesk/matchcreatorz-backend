import { OfferLibService } from '@app/offer-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, User, Service, Country, Category, Tag, UserTag, AdminSetting, OfferImage, Offer, OfferDocument, ChatRequest, Chat, Notification, WalletTransaction, Milestone, Favorite, Report, CompletionProof, UserReviews, Booking, ServiceBids } from 'common/models';
import { OfferController } from './offer.controller';
import { FcmService } from 'common/utils';
import { BookingsLibService } from '@app/booking-lib';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, Service, Country, Offer, OfferDocument, OfferImage, Category, Tag, UserTag, AdminSetting, Chat, ChatRequest, Notification, Offer, WalletTransaction , Milestone, Favorite, Report, ChatRequest, CompletionProof, UserReviews , Booking, ServiceBids])],
  controllers: [OfferController],
  providers: [OfferLibService, FcmService, BookingsLibService],
})
export class OfferModule {}
