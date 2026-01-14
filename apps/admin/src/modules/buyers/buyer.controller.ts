import { Controller, Delete, Get, Param, Query, Body, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { BuyerLibService } from '@app/buyer-lib';
import { AllBuyerDto, UpdateBuyerProfileDto } from '@app/buyer-lib/dto';

// Controller for handling buyer-related requests
@ApiTags('Buyers')
@Controller('buyers')
@CustomHeaders()
export class BuyerController {
  constructor(private readonly userLibService: BuyerLibService) {}

  // Endpoint to add or update a buyer
  @ApiOperation({ summary: 'Add or update a buyer' })
  @Put('add-edit')
  @ApiBearerAuth()
  async addEditBuyer(
    @Body() addUpdateBuyerDto: UpdateBuyerProfileDto
  ) {
    return this.userLibService.addUpdateBuyer(addUpdateBuyerDto);
  }

  // Endpoint to retrieve a list of all buyers
  @ApiOperation({ summary: 'Retrieve a list of all buyers' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allUserDto: AllBuyerDto) {
    return this.userLibService.all(allUserDto);
  }

  // Endpoint to retrieve details of a specific buyer by ID
  @ApiOperation({ summary: 'Retrieve buyer details by ID' })
  @Get(':id')
  @ApiBearerAuth()
  async get(@Param('id') id: number) {
    return this.userLibService.get(id);
  }

  // Endpoint to delete a buyer account by ID
  @ApiOperation({ summary: 'Delete a buyer account by ID' })
  @Delete(':id')
  @ApiBearerAuth()
  async deleteAccount(@Param('id') id: number) {
    return this.userLibService.delete(id);
  }

  // Endpoint to update the status of a buyer by ID
  @ApiOperation({ summary: 'Update the status of a buyer by ID' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number) {
    return this.userLibService.updateStatus(id);
  }  
}
