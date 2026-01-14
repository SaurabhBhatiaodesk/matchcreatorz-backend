import { Module } from '@nestjs/common';
import { CategoryLibService } from './category-lib.service';

@Module({
  providers: [CategoryLibService],
  exports: [CategoryLibService],
})
export class UserLibModule {}
