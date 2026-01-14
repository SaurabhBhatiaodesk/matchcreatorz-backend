import { WalletLibService } from '@app/wallet-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserBankAccount, WalletTransaction, WithdrawRequest } from 'common/models';
import { WalletController } from './wallet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, WithdrawRequest, WalletTransaction, UserBankAccount])],
  controllers: [WalletController],
  providers: [WalletLibService],
  exports: [WalletLibService],
})
export class WalletModule {}
