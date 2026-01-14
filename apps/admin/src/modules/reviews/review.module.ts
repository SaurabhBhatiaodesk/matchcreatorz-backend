import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, User, UserReviews } from 'common/models';
import { ReviewLibService } from '@app/review-lib';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking, UserReviews])],
  controllers: [ReviewController],
  providers: [ReviewLibService],
})
export class ReviewModule {}
