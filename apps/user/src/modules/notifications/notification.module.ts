import { NotificationLibService } from '@app/notification-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, User, Notification } from 'common/models';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, Notification])],
  controllers: [NotificationController],
  providers: [NotificationLibService],
})
export class NotificationModule {}
