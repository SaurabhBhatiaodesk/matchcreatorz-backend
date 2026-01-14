import { ResourceLibService } from '@app/resource-lib';
import { AllBannerDto } from '@app/resource-lib/dto/bannerListDto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';

@ApiTags('Resources')
@Controller('resource')
@CustomHeaders()
export class ResourceController {
  constructor(
    private readonly resourceLibService: ResourceLibService,
  ) {}

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
  @ApiOperation({ summary: 'Banner list' })
  @Get('get-banners')
  async bannerList(@Query() bannerDto: AllBannerDto) {
    return this.resourceLibService.allBanner(bannerDto);
  }

  @Public()
  @ApiOperation({ summary: 'Testimonial list' })
  @Get('get-testimonials')
  async testimonialsList(@Query() bannerDto: AllBannerDto) {
    return this.resourceLibService.allTestimonial(bannerDto);
  }

  @Public()
  @ApiOperation({ summary: 'Get Admin setting' })
  @Get('get-admin-setting')
  async getAdminSetting() {
    return this.resourceLibService.getAdminSetting();
  }
}
