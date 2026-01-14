import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { BookingsLibService } from '@app/booking-lib';
import { AllBookingDto, SettleBookingDto } from '@app/booking-lib/dto';

// Controller for handling booking-related requests
@ApiTags('Bookings')
@Controller('booking')
@CustomHeaders()
export class BookingController {
  constructor(private readonly bookingLibService: BookingsLibService) {}

  // Endpoint to retrieve a list of all bookings
  @ApiOperation({ summary: 'Retrieve a list of all bookings' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allBookingDto: AllBookingDto) {
    return this.bookingLibService.all(allBookingDto);
  }

  // Endpoint to retrieve details of a specific booking by ID
  @ApiOperation({ summary: 'Retrieve booking details by ID' })
  @Get('details/:id')
  @ApiBearerAuth()
  async get(@Param('id') id: number) {
    return this.bookingLibService.get(id);
  }

  // Endpoint to update the status of a booking by ID
  @ApiOperation({ summary: 'Update the status of a booking by ID for disputed amount' })
  @Post('update-status')
  @ApiBearerAuth()
  async updateStatus(@Body() queryParams : SettleBookingDto) {
    return this.bookingLibService.updateStatus(queryParams);
  }
}
