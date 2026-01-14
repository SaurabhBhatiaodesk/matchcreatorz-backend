import { Module } from '@nestjs/common';
import { ServiceLibService } from './service-lib.service';

@Module({
  providers: [ServiceLibService],
  exports: [ServiceLibService],
})
export class ServiceLibModule {}
