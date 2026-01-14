import { ResourceLibService } from '@app/resource-lib';
import { UserLibService } from '@app/user-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country, City, State, User, Category, PriceRange, ResponseTime, Tag, UserTag, Service, UserPortfolio, UserFaq, Report, Notification, ServiceBids, Favorite, Banner, Testimonial, AdminSetting, ChatRequest, Booking, Admin, UserReviews, Chat } from 'common/models';
import { ResourceController } from './resource.controller';
import { FcmService } from 'common/utils/fcm.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Country, State, City, Category, PriceRange, ResponseTime, Tag, UserTag, Service, UserPortfolio, UserFaq, Report, Notification, ServiceBids, Banner, Testimonial, AdminSetting, ChatRequest, Booking, Admin, UserReviews, Chat])],
  controllers: [ResourceController],
  providers: [ResourceLibService, UserLibService, FcmService],
})
export class ResourceModule {}
