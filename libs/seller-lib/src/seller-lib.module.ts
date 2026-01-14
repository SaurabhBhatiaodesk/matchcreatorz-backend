import { Module } from '@nestjs/common';
import { SellerLibService } from './seller-lib.service';

@Module({
  providers: [SellerLibService],
  exports: [SellerLibService],
})
export class SellerLibModule {}
