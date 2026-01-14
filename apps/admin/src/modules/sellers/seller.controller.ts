// Import necessary modules, services, and DTOs
import { Controller, Delete, Get, Param, Query, Body, Put, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { SellerLibService } from '@app/seller-lib';
import { AllSellerDto, UpdateRequestDto, UpdateFAQDto, UpdatePortfolioDto, UpdateProfileStatusDto } from '@app/seller-lib/dto';
import { UpdateReviewDto } from '@app/seller-lib/dto/updateReview.dto';

// Define the controller for handling seller-related operations
@ApiTags('Sellers')
@Controller('sellers')
@CustomHeaders()
export class SellerController {
  constructor(private readonly sellerLibService: SellerLibService) {}

  // Route to accept or reject seller requests
  @ApiOperation({ summary: 'Accept/Reject Request For Seller' })
  @Put('request/status')
  @ApiBearerAuth()
  async requestStatus(
    @Body() requestDto: UpdateRequestDto
  ) {
    return this.sellerLibService.updateRequest(requestDto);
  }

  // Route to add or update seller details
  @ApiOperation({ summary: 'Add-Update Seller' })
  @Put('add-edit')
  @ApiBearerAuth()
  async addEditBuyer(
    @Body() addUpdateBuyerDto: any
  ) {
    return this.sellerLibService.addUpdateBuyer(addUpdateBuyerDto);
  }

  // Route to retrieve all sellers
  @ApiOperation({ summary: 'Sellers' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allSellerDto: AllSellerDto) {
    return this.sellerLibService.all(allSellerDto);
  }

  // Route to retrieve a specific seller's information by ID
  @ApiOperation({ summary: 'Sellers info' })
  @Get(':id')
  @ApiBearerAuth()
  async get(@Param('id') id: number) {
    return this.sellerLibService.get(id);
  }

  // Route to delete a seller's account by ID
  @ApiOperation({ summary: 'Delete account' })
  @Delete('delete/:id')
  @ApiBearerAuth()
  async deleteAccount(@Param('id') id: number) {
    return this.sellerLibService.delete(id);
  }

  // Route to update seller's status by ID
  @ApiOperation({ summary: 'Sellers status update' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number) {
    return this.sellerLibService.updateStatus(id);
  }

  // Route to retrieve seller's FAQ by ID
  @ApiOperation({ summary: 'Seller"s Faq' })
  @Get('faq/:id')
  @ApiBearerAuth()
  async getFaq(@Param('id') id: number) {
    return this.sellerLibService.getFaq(id);
  }

  // Route to add or update seller's FAQ
  @ApiOperation({ summary: 'Seller"s Add/Edit faq' })
  @Put('faq/update-faq')
  @ApiBearerAuth()
  async updateFAQ(
    @Body() updateFAQDto: UpdateFAQDto
  ) {
    return this.sellerLibService.updateFAQ(updateFAQDto);
  }

  // Route to delete seller's FAQ by ID
  @ApiOperation({ summary: 'Delete FAQ' })
  @Delete('faq/delete/:id')
  @ApiBearerAuth()
  async deleteFAQ(@Param('id') id: number) {
    return this.sellerLibService.deleteFAQ(id);
  }

  // Route to retrieve seller's portfolio by ID
  @ApiOperation({ summary: 'Seller"s Portfolio' })
  @Get('portfolio/get-portfolio/:id')
  @ApiBearerAuth()
  async getPortfolio(@Param('id') id: number) {
    return this.sellerLibService.getPortfolio(id);
  }

  // Route to add or update seller's portfolio
  @ApiOperation({ summary: 'Seller"s Add/Update portfolio' })
  @Put('portfolio/update-portfolio')
  @ApiBearerAuth()
  async updatePortfolio(
    @Body() updatePortfolioDto: UpdatePortfolioDto
  ) {
    return this.sellerLibService.updatePortfolio(updatePortfolioDto);
  }

  // Route to delete seller's portfolio by ID
  @ApiOperation({ summary: 'Delete Portfolio' })
  @Delete('portfolio/delete/:id')
  @ApiBearerAuth()
  async deletePortfolio(@Param('id') id: number) {
    return this.sellerLibService.deletePortfolio(id);
  }

  // Route to retrieve seller reviews
  @ApiOperation({ summary: 'Sellers Reviews List' })
  @Get('reviews/list')
  @ApiBearerAuth()
  async reviewList(@Query() allSellerDto: AllSellerDto) {
    return this.sellerLibService.allReviewList(allSellerDto);
  }

  // Route to retrieve specific seller review details by ID
  @ApiOperation({ summary: 'Seller"s reviews details' })
  @Get('reviews/:id')
  @ApiBearerAuth()
  async getReviews(@Param('id') id: number) {
    return this.sellerLibService.getReviewDetails(id);
  }

  // Route to delete seller's review by ID
  @ApiOperation({ summary: 'Delete reviews' })
  @Delete('reviews/delete/:id')
  @ApiBearerAuth()
  async deleteReviews(@Param('id') id: number) {
    return this.sellerLibService.deleteReviews(id);
  }

  // Route to update seller's review
  @ApiOperation({ summary: 'Update review' })
  @Put('reviews/update-reviews')
  @ApiBearerAuth()
  async updateReview(
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.sellerLibService.updateReviews(updateReviewDto);
  }

  // Route to update seller's profile status
  @ApiOperation({ summary: 'Sellers profile status update' })
  @Post('profile-status')
  @ApiBearerAuth()
  async updateProfileStatus(@Body() updateProfileDto: UpdateProfileStatusDto,) {
    return this.sellerLibService.updateProfileState(updateProfileDto);
  }
}
