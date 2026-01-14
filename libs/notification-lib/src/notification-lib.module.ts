import { Module } from '@nestjs/common';
import { NotificationLibService } from './notification-lib.service';

@Module({
  providers: [NotificationLibService],
  exports: [NotificationLibService],
})
export class NotificationLibModule {}
