import { Module } from '@nestjs/common';
import { AdminSettingLibService } from './admin-setting-lib.service';

@Module({
  providers: [AdminSettingLibService],
  exports: [AdminSettingLibService],
})
export class AdminSettingLibModule {}
