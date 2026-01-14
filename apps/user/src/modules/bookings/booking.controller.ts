import {BookingsLibService } from '@app/booking-lib';
import { CreateBookingDto, UpdateStatusDto, addMilestoneDto, ListBookingApiDto, CounterProposeDto, CompleteProcessDto, UpdateRequestDto, addReviewDto } from '@app/booking-lib/dto';
import { Controller, Get, Param, Query, Put, Request, Body, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';

@ApiTags('Booking')
@Controller('bookings')
@CustomHeaders()
export class BookingController {
  constructor(private readonly bookingsLibService: BookingsLibService) {}

  @ApiOperation({ summary: 'Create Booking' })
  @Post('create-booking')
  @ApiBearerAuth()
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: any,
  ) {
    return this.bookingsLibService.createBooking(createBookingDto, req);
  }

  @ApiOperation({ summary: 'All Booking list' })
  @Get('get-booking-list')
  @ApiBearerAuth()
  async getServices(@Query() listBookingApiDto: ListBookingApiDto, @Request() req: any) {
    return this.bookingsLibService.getBookingsList(listBookingApiDto, req);
  }

  @ApiOperation({ summary: 'Booking info' })
  @Get('info/:id')
  @ApiBearerAuth()
  async getBookingById(@Param('id') id: number, @Request() req: any) {
    return this.bookingsLibService.getBooking(id, req);
  }

  @ApiOperation({ summary: 'Booking status update' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number, @Query() updateStatusDto: UpdateStatusDto, @Request() req: any) {
    return this.bookingsLibService.updateBookingStatus(id, updateStatusDto, req);
  }

  @ApiOperation({ summary: 'Counter Proposed' })
  @Put('counter-propose')
  @ApiBearerAuth()
  async counterProposed(
    @Body() counterProposeDto: CounterProposeDto,
    @Request() req: any,
  ) {
    return this.bookingsLibService.counterPropose(counterProposeDto, req);
  }

  @ApiOperation({ summary: 'Complete Process' })
  @Put('complete-process')
  @ApiBearerAuth()
  async completeProcess(
    @Body() completeProcessDto: CompleteProcessDto,
    @Request() req: any,
  ) {
    return this.bookingsLibService.completeProcess(completeProcessDto, req);
  }

  @ApiOperation({ summary: 'Booking request update' })
  @Get('update-request/:id')
  @ApiBearerAuth()
  async updateRequest(@Param('id') id: number, @Query() updateRequestDto: UpdateRequestDto, @Request() req: any) {
    return this.bookingsLibService.updateRequest(id, updateRequestDto, req);
  }

  @ApiOperation({ summary: 'Add/Edit milestone for booking' })
  @Post('add-milestone')
  @ApiBearerAuth()
  async addMilestone(
    @Body() addMilestone: addMilestoneDto
  ) {
    return this.bookingsLibService.addMilestone(addMilestone);
  }

  @ApiOperation({ summary: 'Delete milestone' })
  @Delete('delete-milestone/:id')
  @ApiBearerAuth()
  async deleteMilestone(
    @Param('id') id: number
) {
    return this.bookingsLibService.deleteMilestone(id);
  }


  @ApiOperation({ summary: 'Add review for booking' })
  @Post('add-review')
  @ApiBearerAuth()
  async addReview(
    @Body() addReview: addReviewDto,
    @Request() req: any,
  ) {
    return this.bookingsLibService.addReview(addReview, req);
  }

}