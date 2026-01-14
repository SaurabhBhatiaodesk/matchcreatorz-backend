import { Module } from '@nestjs/common';
import { ResourceLibService } from './resource-lib.service';

@Module({
  providers: [ResourceLibService],
  exports: [ResourceLibService],
})
export class ResourceLibModule {}
