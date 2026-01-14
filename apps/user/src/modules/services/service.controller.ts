import { ServiceLibService } from '@app/service-lib';
import {
  ListServiceDto, 
  AddUpdateServiceDto,
  UserIdDto
} from '@app/service-lib/dto';
import { UpdateStatusDto } from '@app/service-lib/dto/updateBidStatus.dto';
import { UpdateJOBStatusDto } from '@app/service-lib/dto/updateJobStatus.dto';
import { Controller, Get, Param, Query, Put, Request, Body, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';

@ApiTags('Service')
@Controller('services')
@CustomHeaders()
export class ServiceController {
  constructor(private readonly serviceLibService: ServiceLibService) {}

  @ApiOperation({ summary: 'Add-Update Service' })
  @Put('add-edit')
  @ApiBearerAuth()
  async addEditBuyer(
    @Body() addUpdateServiceDto: AddUpdateServiceDto,
    @Request() req: any,
  ) {
    return this.serviceLibService.addUpdateService(addUpdateServiceDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'All Service list' })
  @Get('get-services')
  async getServices(@Query() listServiceDto: ListServiceDto, @Request() req: any) {
    return this.serviceLibService.getServicesList(listServiceDto, req);
  }

  @ApiOperation({ summary: 'My Service list' })
  @Get('my-services')
  @ApiBearerAuth()
  async myServices(@Query() listServiceDto: ListServiceDto, @Request() req: any) {
    return this.serviceLibService.myServicesList(listServiceDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Service info' })
  @Get('info/:id')
  async getServiceById(@Param('id') id: number, @Query() userIdDto: UserIdDto, @Request() req: any) {
    return this.serviceLibService.getService(id, userIdDto, req);
  }

  @ApiOperation({ summary: 'Delete Service' })
  @Delete('delete-service/:id')
  @ApiBearerAuth()
  async deleteFAQ(@Param('id') id: number, @Request() req: any) {
    return this.serviceLibService.delete(id, req);
  }

  @ApiOperation({ summary: 'update status for job' })
  @Put('job/update-status')
  @ApiBearerAuth()
  async updateStatus(
    @Body() updateStatusDto: UpdateJOBStatusDto,
    @Request() req: any,
  ) {
    return this.serviceLibService.jobStatus(updateStatusDto, req);
  }

  @ApiOperation({ summary: 'update status for recieved bids on job' })
  @Put('bid/update-status')
  @ApiBearerAuth()
  async updateBidStatus(
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: any,
  ) {
    return this.serviceLibService.bidStatus(updateStatusDto, req);
  }
}