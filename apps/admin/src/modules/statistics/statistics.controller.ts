// Import necessary modules, services, and DTOs
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { BookingsLibService } from '@app/booking-lib';

// Define the controller for managing statistics-related endpoints
@ApiTags('Statistics')
@Controller('statistics')
@CustomHeaders()
export class StatisticsController {
  constructor(private readonly statiscticsLibService: BookingsLibService) {}

  // Route to fetch statistics list, requiring authentication
  @ApiOperation({ summary: 'Statistics List' })
  @Get()
  @ApiBearerAuth()
  async list() {
    // Call the service to retrieve all statistics based on the request context
    return this.statiscticsLibService.allStatistics();
  }
}
