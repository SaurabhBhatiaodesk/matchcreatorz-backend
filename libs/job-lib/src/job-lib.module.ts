import { Module } from '@nestjs/common';
import { JobLibService } from './job-lib.service';

@Module({
  providers: [JobLibService],
  exports: [JobLibService],
})
export class JobLibModule {}
