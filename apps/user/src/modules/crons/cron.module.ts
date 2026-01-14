import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { JobLibService } from '@app/job-lib';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, User, WalletTransaction, Notification } from 'common/models';
import { FcmService } from 'common/utils';
@Module({
  imports: [TypeOrmModule.forFeature([User, Booking, WalletTransaction, Notification])],
  controllers: [CronController],
  providers: [JobLibService, FcmService],
})
export class CronModule {}
