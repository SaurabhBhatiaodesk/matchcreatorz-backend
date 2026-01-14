import { Module } from '@nestjs/common';
import { ConnectLibService } from './connect-lib.service';

@Module({
  providers: [ConnectLibService],
  exports: [ConnectLibService],
})
export class ConnectLibModule {}
