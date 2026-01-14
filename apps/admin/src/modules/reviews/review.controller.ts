import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { ReviewLibService } from '@app/review-lib';
import { AllBookingDto } from '@app/booking-lib/dto';
import { UpdateReviewDto } from '@app/review-lib/dto/updateReview.dto';

@ApiTags('Reviews')
@Controller('reviews')
@CustomHeaders()
export class ReviewController {
  constructor(private readonly reviewLibService: ReviewLibService) {}

  // Get the list of reviews
  @ApiOperation({ summary: 'Reviews List' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allBookingDto: AllBookingDto) {
    return this.reviewLibService.all(allBookingDto);
  }

  // Get review details by ID
  @ApiOperation({ summary: 'Review Details' })
  @Get(':id')
  @ApiBearerAuth()
  async get(@Param('id') id: number) {
    return this.reviewLibService.get(id);
  }

  // Update review status by ID
  @ApiOperation({ summary: 'Review Status Update' })
  @Get(':id/update-status')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number) {
    return this.reviewLibService.updateStatus(id);
  }

  // Update or edit a review
  @ApiOperation({ summary: 'Edit/Update Review' })
  @Put('update')
  @ApiBearerAuth()
  async updateReview( 
    @Body() updateDto: UpdateReviewDto
  ) {
    return this.reviewLibService.updateReview(updateDto);
  }

  // Delete a review by ID
  @ApiOperation({ summary: 'Delete Review' })
  @Delete('delete/:id')
  @ApiBearerAuth()
  async deleteReview(@Param('id') id: number) {
    return this.reviewLibService.delete(id);
  }
}
