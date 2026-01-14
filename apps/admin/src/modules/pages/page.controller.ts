import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';
import { PageLibService } from '@app/page-lib';
import { AllPageDto, UpdatePageDto } from '@app/page-lib/dto';

// Controller for handling page-related requests
@ApiTags('Page')
@Controller('pages')
@CustomHeaders()
export class PageController {
  constructor(private readonly pageLibService: PageLibService) {}

  // Endpoint to retrieve a list of pages
  @Public()
  @ApiOperation({ summary: 'Retrieve a list of pages' })
  @Get()
  async list(@Query() allPageDto: AllPageDto) {
    return this.pageLibService.list(allPageDto);
  }

  // Endpoint to retrieve page details by ID
  @Public()
  @ApiOperation({ summary: 'Retrieve page details by ID' })
  @Get(':id/info')
  async getById(@Param('id') id: number) {
    return this.pageLibService.getById(id);
  }

  // Endpoint to update a page
  @Public()
  @ApiOperation({ summary: 'Update a page' })
  @Put('edit')
  async update(@Body() updatePageDto: UpdatePageDto) {
    return this.pageLibService.update(updatePageDto);
  }
}
