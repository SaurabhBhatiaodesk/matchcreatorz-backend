// Import necessary modules, services, and DTOs
import { Controller, Get, Param, Query, Request, Body, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { BuyerLibService } from '@app/buyer-lib';
import { ConnectLibService } from '@app/connect-lib';
import { AllWithDrawRequestDto, ConnectDto, WalletDto, WalletUpdateStatusDto } from './dto';
import { AllWalletDto } from '@app/buyer-lib/dto/wallet.dto';

// Define WalletController and set custom headers
@ApiTags('Wallet')
@Controller('wallet')
@CustomHeaders()
export class WalletController {
  constructor(
    private readonly connectLibService: ConnectLibService,
    private readonly userLibService: BuyerLibService
  ) {}

  // Route to add amount in buyer/seller's wallet (requires authentication)
  @ApiOperation({ summary: "Add Amount In Buyer/Seller's wallet" })
  @Put('add-amount')
  @ApiBearerAuth()
  async addUserAmount(@Body() addAmount: WalletDto, @Request() req: any) {
    return this.userLibService.addWalletAmount(addAmount, req);
  }

  // Route to get transaction history for buyer/seller (requires authentication)
  @ApiOperation({ summary: 'Buyer/Seller Transaction history' })
  @Get('transaction-history')
  @ApiBearerAuth()
  async transactionUserHistory(@Query() allWallet: AllWalletDto) {
    return this.userLibService.getTransaction(allWallet);
  }

  // Route to get withdraw request list (requires authentication)
  @ApiOperation({ summary: 'Get withdraw list' })
  @Get('withdraw/withdraw-list')
  @ApiBearerAuth()
  async getWithdrawRequest(@Query() allList: AllWithDrawRequestDto) {
    return this.userLibService.getWithdrawList(allList);
  }

  // Route to update seller's withdraw status (requires authentication)
  @ApiOperation({ summary: 'Sellers status update' })
  @Put('withdraw/update-status')
  @ApiBearerAuth()
  async updateStatus(@Body() updateStatus: WalletUpdateStatusDto) {
    return this.userLibService.updateWithdrawStatus(updateStatus);
  }

  // Route to get withdraw info by ID (requires authentication)
  @ApiOperation({ summary: 'Withdraw info' })
  @Get('withdraw/info/:id')
  @ApiBearerAuth()
  async getWithdrawInfo(@Param() params: any) {
    return this.userLibService.getWithdrawInfo(params);
  }

  // Route to get connect information for the seller (requires authentication)
  @ApiOperation({ summary: 'Connect info' })
  @Get('get-connects')
  @ApiBearerAuth()
  async getConnectList() {
    return this.connectLibService.getConnects();
  }

  // Route to add connects in seller's account (requires authentication)
  @ApiOperation({ summary: "Add Connect In Seller's account" })
  @Put('add-connects')
  @ApiBearerAuth()
  async buyAmount(@Body() addConnect: ConnectDto, @Request() req: any) {
    return this.connectLibService.addConnects(addConnect, req);
  }

  // Route to get transaction history for connects (requires authentication)
  @ApiOperation({ summary: 'Seller Transaction history' })
  @Get('get-connects-transactions')
  @ApiBearerAuth()
  async transactionConnectHistory(@Query() allConnect: any) {
    return this.connectLibService.getConnectsTxns(allConnect);
  }
}
