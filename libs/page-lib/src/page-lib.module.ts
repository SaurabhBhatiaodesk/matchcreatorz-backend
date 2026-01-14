import { Module } from '@nestjs/common';
import { PageLibService } from './page-lib.service';
@Module({
  providers: [PageLibService],
  exports: [PageLibService],
})
export class PageLibModule {}
