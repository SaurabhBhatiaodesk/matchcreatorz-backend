import { ChatLibService } from '@app/chat-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, ChatRequest, Service, User, Notification, Support, SupportRequest} from 'common/models';
import { ChatController } from './chat.controller';
import { FcmService } from 'common/utils';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatRequest, Chat, Service, Support, SupportRequest, Notification])],
  controllers: [ChatController],
  providers: [ChatLibService, FcmService],
})
export class ChatModule {}
