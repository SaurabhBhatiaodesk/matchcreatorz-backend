import { ServiceLibService } from '@app/service-lib';
import {
  AddBidDto,
  WithdrawBidDto
} from '@app/service-lib/dto';
import { DetailsBidDto } from '@app/service-lib/dto/detailsBid.dto';
import { ListBidDto } from '@app/service-lib/dto/listBid.dto';
import { Controller, Get, Param, Query, Put, Request, Body, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';

@ApiTags('Bid')
@Controller('bid')
@CustomHeaders()
export class BigController {
  constructor(private readonly serviceLibService: ServiceLibService) {}

  @ApiOperation({ summary: 'Add/Edit Bid for job/service' })
  @Put('add-bid')
  @ApiBearerAuth()
  async addBid(
    @Body() addBidDto: AddBidDto,
    @Request() req: any,
  ) {
    return this.serviceLibService.addBidOnJob(addBidDto, req);
  }

  @ApiOperation({ summary: 'My Bid list' })
  @Get('my-bid')
  @ApiBearerAuth()
  async myBid(@Query() listBidDto: ListBidDto, @Request() req: any) {
    return this.serviceLibService.myBidList(listBidDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Bid info' })
  @Get('info/:bidId')
  @ApiBearerAuth()
  async getServiceById(@Param() detailsBidDto: DetailsBidDto) {
    return this.serviceLibService.myBidDetails(detailsBidDto);
  }

  @ApiOperation({ summary: 'Delete Bid' })
  @Delete('delete-bid/:id')
  @ApiBearerAuth()
  async deleteFAQ(@Param() detailsBidDto: DetailsBidDto, @Request() req: any) {
    return this.serviceLibService.deleteBid(detailsBidDto, req);
  }

  @ApiOperation({ summary: 'Withdraw Bid for job/service' })
  @Put('withdraw-bid')
  @ApiBearerAuth()
  async withdrawBid(
    @Body() addBidDto: WithdrawBidDto,
    @Request() req: any,
  ) {
    return this.serviceLibService.withdrawBidOnJob(addBidDto, req);
  }



}