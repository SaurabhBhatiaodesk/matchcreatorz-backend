import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, WalletTransaction, WithdrawRequest } from 'common/models';
import { BuyerLibService } from '@app/buyer-lib';

@Module({
  imports: [TypeOrmModule.forFeature([User, WalletTransaction, WithdrawRequest])],
  controllers: [BuyerController],
  providers: [BuyerLibService],
})
export class BuyerModule {}
