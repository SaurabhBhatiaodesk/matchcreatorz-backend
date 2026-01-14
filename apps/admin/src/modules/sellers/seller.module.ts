import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReviews, User , UserPortfolio, UserFaq,  Tag, Category, Country, State, City, UserTag} from 'common/models';
import { SellerLibService } from '@app/seller-lib';

@Module({
  imports: [TypeOrmModule.forFeature([UserReviews,User, UserTag, UserPortfolio, UserFaq, Tag, Category, Country, State, City])],
  controllers: [SellerController],
  providers: [SellerLibService],
})
export class SellerModule {}
