import { ConnectLibService } from '@app/connect-lib';
import { Body, Controller, Get, Put, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { AddConnectDto } from './dto/addConnect.dto';

@ApiTags('Connect')
@Controller('connects')
@CustomHeaders()
export class ConnectController {
  constructor(private readonly connectLibService: ConnectLibService) {}

  @ApiOperation({ summary: 'Connect info' })
  @Get('get-connects')
  @ApiBearerAuth()
  async getConnectList() {
    return this.connectLibService.getConnects();
  }

  @ApiOperation({ summary: 'Get Total connects' })
  @Get('get-total-connects')
  @ApiBearerAuth()
  async getTotalConnects(@Request() req: any) {
    return this.connectLibService.getTotalConnects(req);
  }

  @ApiOperation({ summary: 'Get connects transactions' })
  @Get('get-connects-transactions')
  @ApiBearerAuth()
  async getConnectsTxn(@Request() req: any) {
    return this.connectLibService.getConnectsTxns(req);
  }

  @ApiOperation({ summary: "buy connects" })
  @Put('buy-connects')
  @ApiBearerAuth()
  async buyAmount(
    @Body() addConnect: AddConnectDto,
    @Request() req: any,
  ) {
    return this.connectLibService.addConnects(addConnect, req);
  }

}