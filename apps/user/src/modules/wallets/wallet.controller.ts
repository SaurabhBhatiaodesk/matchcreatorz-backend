import { WalletLibService } from '@app/wallet-lib';
import { Body, Controller, Get, Post, Put, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';
import { AddAmountDto } from './dto/addAmount.dto';
import { successParamsDto } from './dto/successParams.dto';
import {AllTxnsDto, SendWithdrawRequestDto } from '@app/wallet-lib/dto';

@ApiTags('Wallet')
@Controller('wallets')
@CustomHeaders()
export class WalletController {
  constructor(private readonly walletLibService: WalletLibService) {}

  @ApiOperation({ summary: 'Wallet info' })
  @Get('get-wallet')
  @ApiBearerAuth()
  async getwallets(@Request() req: any) {
    return this.walletLibService.getwallets(req);
  }

  @ApiOperation({ summary: 'Wallet withdraw info' })
  @Get('get-withdraw-request')
  @ApiBearerAuth()
  async getWithdrawRequest(@Request() req: any) {
    return this.walletLibService.getWithdrawRequest(req);
  }

  
  @ApiOperation({ summary: "Sned Withdraw request" })
  @Post('send-withdraw-request')
  @ApiBearerAuth()
  async sendWithdrawRequest(
    @Body() sendWithdrawRequestDto: SendWithdrawRequestDto,
    @Request() req: any,
  ) {
    return this.walletLibService.sendWithdrawRequest(sendWithdrawRequestDto, req);
  }

  @ApiOperation({ summary: 'Wallet tranasction' })
  @Get('get-wallet-transaction')
  @ApiBearerAuth()
  async getWalletTransaction(
    @Query() allTxns: AllTxnsDto,
    @Request() req: any) {
    return this.walletLibService.getWalletTransaction(req, allTxns);
  }

  @ApiOperation({ summary: "Add Amount In wallet" })
  @Put('add-amount')
  @ApiBearerAuth()
  async addAmount(
    @Body() addAmount: AddAmountDto,
    @Request() req: any,
  ) {
    return this.walletLibService.addWalletAmount(addAmount, req);
  }

  @ApiOperation({ summary: 'payment success page' })
  @Get('success')
  @ApiBearerAuth()
  async getSuccess(
    @Request() req: any,
    @Query() params: successParamsDto,
  
  ) {
    return this.walletLibService.success(req, params);
  }

  @ApiOperation({ summary: 'payment cancel page' })
  @Get('cancel')
  @ApiBearerAuth()
  async getFailed(
    @Request() req: any,
  @Query() params: successParamsDto,) {
    return this.walletLibService.failed(req, params);
  }

  @Public()
  @ApiOperation({ summary: 'payment webhook page' })
  @Post('webhook')
  async getWebhook(@Request() req: any) {
    return this.walletLibService.webhook(req);
  }

}