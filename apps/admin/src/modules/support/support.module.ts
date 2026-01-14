import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReviews, User , UserPortfolio, UserFaq,  Tag, Category, Country, State, City, UserTag, Chat, ChatRequest, Support, SupportRequest, Notification} from 'common/models';
import { ChatLibService } from '@app/chat-lib';
import { FcmService } from 'common/utils';


@Module({
  imports: [TypeOrmModule.forFeature([UserReviews,User, UserTag, UserPortfolio, UserFaq, Tag, Category, Country, State, City, Chat, ChatRequest, Support, SupportRequest, Notification])],
  controllers: [SupportController],
  providers: [ChatLibService, FcmService],
})
export class SupportModule {}
