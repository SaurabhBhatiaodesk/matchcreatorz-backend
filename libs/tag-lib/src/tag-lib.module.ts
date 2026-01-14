import { Module } from '@nestjs/common';
import { TagLibService } from './tag-lib.service';

@Module({
  providers: [TagLibService],
  exports: [TagLibService],
})
export class TagLibModule {}
