import { OfferLibService } from '@app/offer-lib';
import {
  AddUpdateOfferDto, 
  UpdateStatusDto, CounterOfferDto} from '@app/offer-lib/dto';
import { Controller, Get, Param, Query, Put, Request, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';

@ApiTags('Offer')
@Controller('offers')
@CustomHeaders()
export class OfferController {
  constructor(private readonly offerLibService: OfferLibService) {}

  @ApiOperation({ summary: 'Add-Update Offer' })
  @Put('add-edit')
  @ApiBearerAuth()
  async addEditBuyer(
    @Body() addUpdateOfferDto: AddUpdateOfferDto,
    @Request() req: any,
  ) {
    return this.offerLibService.addUpdateOffer(addUpdateOfferDto, req);
  }

  @ApiOperation({ summary: 'Offer info' })
  @Get('info/:id')
  @ApiBearerAuth()
  async getOfferById(@Param('id') id: number) {
    return this.offerLibService.getOffer(id);
  }

  @ApiOperation({ summary: 'Offer status update' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number, @Query() updateStatusDto: UpdateStatusDto, @Request() req: any) {
    return this.offerLibService.updateStatus(id, updateStatusDto, req);
  }

  @ApiOperation({ summary: 'Counter Offer' })
  @Put('counter-offer')
  @ApiBearerAuth()
  async counterOffer(
    @Body() counterOfferDto: CounterOfferDto,
    @Request() req: any,
  ) {
    return this.offerLibService.counterOffer(counterOfferDto, req);
  }


}