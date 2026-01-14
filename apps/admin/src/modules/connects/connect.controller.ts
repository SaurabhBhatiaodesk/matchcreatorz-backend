import { ConnectLibService } from '@app/connect-lib';
import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { AllConnectDto, AddUpdateConnectDto } from '@app/connect-lib/dto';

// Controller for handling connect-related requests
@ApiTags('Connect')
@Controller('connects')
@CustomHeaders()
export class ConnectController {
  constructor(private readonly connectLibService: ConnectLibService) {}

  // Endpoint to retrieve a list of all connections
  @ApiOperation({ summary: 'Retrieve a list of all connections' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allConnetDto: AllConnectDto) {
    return this.connectLibService.all(allConnetDto);
  }

  // Endpoint to add or update a connection
  @ApiOperation({ summary: 'Add or update a connection' })
  @Put('add-edit')
  @ApiBearerAuth()
  async updateConnect(
    @Body() addUpdateConnectDto: AddUpdateConnectDto
  ) {
    return this.connectLibService.addUpdateConnect(addUpdateConnectDto);
  }

  // Endpoint to retrieve connection details by ID
  @ApiOperation({ summary: 'Retrieve connection details by ID' })
  @Get('details/:id')
  @ApiBearerAuth()
  async getDetails(@Param('id') id: number) {
    return this.connectLibService.get(id);
  }

  // Endpoint to update the status of a connection
  @ApiOperation({ summary: 'Update the status of a connection' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number) {
    return this.connectLibService.updateStatus(id);
  }

  // Endpoint to delete a connection by ID
  @ApiOperation({ summary: 'Delete a connection by ID' })
  @Delete('delete/:id')
  @ApiBearerAuth()
  async deleteConnect(@Param('id') id: number) {
    return this.connectLibService.delete(id);
  }
}
