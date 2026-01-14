import { Module } from '@nestjs/common';
import { UserLibService } from './user-lib.service';
import { FcmService } from 'common/utils';

@Module({
  providers: [UserLibService],
  exports: [UserLibService, FcmService],
})
export class UserLibModule {}
