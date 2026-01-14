import { Module } from '@nestjs/common';
import { ReviewLibService } from './review-lib.service';

@Module({
  providers: [ReviewLibService],
  exports: [ReviewLibService],
})
export class ReviewLibModule {}
