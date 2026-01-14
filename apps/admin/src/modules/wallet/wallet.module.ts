import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connect, ConnectTransaction, User, UserBankAccount, WalletTransaction, WithdrawRequest } from 'common/models';
import { WalletLibService } from '@app/wallet-lib';
import { BuyerLibService } from '@app/buyer-lib';
import { BuyerController } from '../buyers/buyer.controller';
import { ConnectLibService } from '@app/connect-lib';

@Module({
  imports: [TypeOrmModule.forFeature([User, WithdrawRequest, WalletTransaction, UserBankAccount, Connect, ConnectTransaction])],
  controllers: [WalletController, BuyerController],
  providers: [WalletLibService, BuyerLibService, ConnectLibService],
})
export class WalletModule {}
