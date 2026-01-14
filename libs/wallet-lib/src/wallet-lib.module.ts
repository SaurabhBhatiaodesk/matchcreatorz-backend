import { Module } from '@nestjs/common';
import { WalletLibService } from './wallet-lib.service';

@Module({
  providers: [WalletLibService],
  exports: [WalletLibService],
})
export class WalletLibModule {}
