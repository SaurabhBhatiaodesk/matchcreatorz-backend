import { Module } from '@nestjs/common';
import { BuyerLibService } from './buyer-lib.service';

@Module({
  providers: [BuyerLibService],
  exports: [BuyerLibService],
})
export class BuyerLibModule {}
