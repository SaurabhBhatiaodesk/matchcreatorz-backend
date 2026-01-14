// Import necessary modules, services, and DTOs
import { AdminSettingLibService } from '@app/admin-setting-lib';
import { UpdateDto } from '@app/admin-setting-lib/dto';
import { AddEditRTDto } from '@app/admin-setting-lib/dto/addEdit.dto';
import { AddEditPRDto } from '@app/admin-setting-lib/dto/addEditPR.dto';
import { AllDataDto } from '@app/admin-setting-lib/dto/responseTime.dto';
import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';

// Define the controller for managing settings
@ApiTags('Setting')
@Controller('settings')
@CustomHeaders()
export class SettingController {
  constructor(
    private readonly adminSettingLibService: AdminSettingLibService, // Inject the admin settings service
  ) {}

  // Route to retrieve all admin settings
  @ApiOperation({ summary: 'Admin Settings' })
  @Get()
  @ApiBearerAuth()
  async get() {
    return this.adminSettingLibService.get();
  }

  // Route to update admin settings
  @ApiOperation({ summary: 'Admin setting update' })
  @Put()
  @ApiBearerAuth()
  async updateStatus(@Body() updateDto: UpdateDto) {
    return this.adminSettingLibService.update(updateDto);
  }

  // Route to delete a price range by ID
  @ApiOperation({ summary: 'Delete price-range using id' })
  @Delete('price-range/delete/:id')
  @ApiBearerAuth()
  async delete(@Param('id') id: number) {
   return this.adminSettingLibService.deletePR(id);
  }

  // Route to add or update a price range
  @ApiOperation({ summary: 'Add-Update Price-Range' })
  @Put('price-range/add-edit')
  @ApiBearerAuth()
  async addEditPR(
    @Body() addUpdateDto: AddEditPRDto
  ) {
    return this.adminSettingLibService.addUpdatePriceRange(addUpdateDto);
  }

  // Route to retrieve all price ranges
  @ApiOperation({ summary: 'Admin price range' })
  @Get('price-range')
  @ApiBearerAuth()
  async listPriceRange(@Query() allDataDto: AllDataDto) {
    return this.adminSettingLibService.allPriceRange(allDataDto);
  }

  // Route to add or update a response time
  @ApiOperation({ summary: 'Add-Update Response-Time' })
  @Put('response-time/add-edit')
  @ApiBearerAuth()
  async addEditRT(
    @Body() addUpdateDto: AddEditRTDto
  ) {
    return this.adminSettingLibService.addUpdateResponseTime(addUpdateDto);
  }

  // Route to retrieve all response times
  @ApiOperation({ summary: 'Admin response time' })
  @Get('response-time')
  @ApiBearerAuth()
  async listResponseTime(@Query() allDataDto: AllDataDto) {
    return this.adminSettingLibService.allResponseTime(allDataDto);
  }

  // Route to delete a response time by ID
  @ApiOperation({ summary: 'Delete response-time using id' })
  @Delete('response-time/delete/:id')
  @ApiBearerAuth()
  async deleteAccount(@Param('id') id: number) {
   return this.adminSettingLibService.deleteRT(id);
  }
}
