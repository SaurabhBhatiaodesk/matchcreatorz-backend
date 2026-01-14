import { ResourceLibService } from '@app/resource-lib';
import { BannerDto, TestimoialDto } from '@app/resource-lib/dto';
import { AllBannerDto } from '@app/resource-lib/dto/bannerListDto';
import { UserLibService } from '@app/user-lib';
import { AllReportDto, AllUserDto } from '@app/user-lib/dto';
import { NotificationDTO } from '@app/user-lib/dto/sendNotification.dto';
import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';

// Controller for handling resource-related requests
@ApiTags('Resources')
@Controller('resource')
@CustomHeaders()
export class ResourceController {
  constructor(
    private readonly resourceLibService: ResourceLibService,
    private readonly userLibService: UserLibService
  ) {}

  // Public APIs for fetching various data
  @Public()
  @ApiOperation({ summary: 'Get Country Data' })
  @Get('get-country')
  async getCountry() {
    return this.resourceLibService.getCountry();
  }

  @Public()
  @ApiOperation({ summary: 'Get State Data' })
  @Get('get-state')
  async getState(@Query('countryId') id: number) {
    return this.resourceLibService.getStateByCountryId(id);
  }

  @Public()
  @ApiOperation({ summary: 'Get City Data' })
  @Get('get-city')
  async getCity(@Query('stateId') id: number) {
    return this.resourceLibService.getCityByStateId(id);
  }

  @Public()
  @ApiOperation({ summary: 'Get Price Range Data' })
  @Get('get-price-range')
  async getPriceRange() {
    return this.resourceLibService.getPriceRange();
  }

  @Public()
  @ApiOperation({ summary: 'Get Response Time Data' })
  @Get('get-response-time')
  async getResponseTime() {
    return this.resourceLibService.getResponseTime();
  }

  @Public()
  @ApiOperation({ summary: 'Get Category Data' })
  @Get('get-category')
  async getCategory() {
    return this.resourceLibService.getCategory();
  }

  @Public()
  @ApiOperation({ summary: 'Get Tags' })
  @Get('get-tags')
  async getTags(@Query('categoryId') categoryId: number) {
    return this.resourceLibService.getTag(categoryId);
  }

  // Notification APIs
  @ApiOperation({ summary: 'Send notification to user/all' })
  @Put('send-notifications')
  @ApiBearerAuth()
  async sendNotification(
    @Body() notificationDto: NotificationDTO,
  ) {
    return this.userLibService.sendPush(notificationDto);
  }

  @ApiOperation({ summary: 'Notification list' })
  @Get('get-notifications')
  @ApiBearerAuth()
  async notificationList(@Query() allNotificationDto: AllUserDto) {
    return this.userLibService.allNotification(allNotificationDto);
  }

  @ApiOperation({ summary: 'Delete Notification' })
  @Delete('notification/delete/:id')
  @ApiBearerAuth()
  async delete(@Param('id') id: number) {
    return this.userLibService.deleteNotification(id);
  }

  // Banner APIs
  @ApiOperation({ summary: 'Banner list' })
  @Get('get-banners')
  @ApiBearerAuth()
  async getBannerList(@Query() bannerDto: AllBannerDto) {
    return this.resourceLibService.allBanner(bannerDto);
  }

  @ApiOperation({ summary: 'Add banner' })
  @Put('add-banner')
  @ApiBearerAuth()
  async addBanner(
    @Body() bannerDto: BannerDto,
  ) {
    return this.resourceLibService.banner(bannerDto);
  }

  @ApiOperation({ summary: 'Delete banner' })
  @Delete('delete-banner/:id')
  @ApiBearerAuth()
  async deleteBanner(@Param('id') id: number) {
    return this.resourceLibService.deleteBanner(id);
  }

  // Testimonial APIs
  @ApiOperation({ summary: 'Testimonial list' })
  @Get('get-testimonials')
  @ApiBearerAuth()
  async getTestimonialList(@Query() testimonialListDto: AllBannerDto) {
    return this.resourceLibService.allTestimonial(testimonialListDto);
  }

  @ApiOperation({ summary: 'Add testimonial' })
  @Put('add-testimonials')
  @ApiBearerAuth()
  async addTestimonial(
    @Body() addTestimonialDto: TestimoialDto,
  ) {
    return this.resourceLibService.testimonial(addTestimonialDto);
  }

  @ApiOperation({ summary: 'Delete testimonial' })
  @Delete('delete-testimonials/:id')
  @ApiBearerAuth()
  async deleteTestimonial(@Param('id') id: number) {
    return this.resourceLibService.deleteTestimonial(id);
  }

  @ApiOperation({ summary: 'Notification list' })
  @Get('get-dashboard-notifications')
  @ApiBearerAuth()
  async notificationDashList(@Query() allNotificationDto: any) {
    return this.userLibService.allNotification(allNotificationDto);
  }

  @ApiOperation({ summary: 'Report list' })
  @Get('get-reports')
  @ApiBearerAuth()
  async reportList(@Query() allNotificationDto: AllReportDto) {
    return this.userLibService.allReports(allNotificationDto);
  }
}
