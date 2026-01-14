import { Module } from '@nestjs/common';
import { OfferLibService } from './offer-lib.service';

@Module({
  providers: [OfferLibService],
  exports: [OfferLibService],
})
export class OfferLibModule {}
