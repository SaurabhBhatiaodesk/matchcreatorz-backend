import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { User, Admin, Notification, Service, Booking, Chat, ChatRequest, Support, SupportRequest} from 'common/models';

import { ResponseService } from 'common/services/response.service';
import { SocketGateway } from './socket/socket.gateway';
import { SocketService } from './socket/socket.service';
import { ConfigService } from '@nestjs/config';
import { FcmService } from 'common/utils';
@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Notification, Service, Booking,  Chat, ChatRequest, Support, SupportRequest])],
  controllers: [ChatController],
  providers: [
    ChatService, 
    ConfigService,
    ResponseService,
    SocketService,
    SocketGateway,
    FcmService
  ],
})
export class ChatModule {}
