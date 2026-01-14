import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { User, Notification, Booking, Service, Chat, ChatRequest, Support, SupportRequest} from 'common/models';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification, Booking, Service, Chat, ChatRequest, Support, SupportRequest])],
  providers: [
    SocketGateway, 
    SocketService
  ]
})
export class SocketModule {}
