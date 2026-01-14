import { ConnectLibService } from '@app/connect-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connect, User , WalletTransaction, ConnectTransaction} from 'common/models';
import { ConnectController } from './connect.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectTransaction,Connect, User, WalletTransaction])],
  controllers: [ConnectController],
  providers: [ConnectLibService],
})
export class ConnectModule {}
