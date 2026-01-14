import { UserLibService } from '@app/user-lib';
import {
  ListFavoriteDto,
  ListUserDto,
} from '@app/user-lib/dto';
import { reportDTO } from '@app/user-lib/dto/report.dto';
import { reviewListDTO } from '@app/user-lib/dto/reviewList.dto';
import { Body, Controller, Get, Param, Post, Put, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';

@ApiTags('User')
@Controller('users')
@CustomHeaders()
export class UserController {
  constructor(private readonly userLibService: UserLibService) {}

  @ApiOperation({ summary: 'User info' })
  @Get('info/:id')
  @ApiBearerAuth()
  async getUserById(@Param('id') id: number,@Request() req: any) {
    return this.userLibService.getUser(id, req);
  }

   @Public()
   @ApiOperation({ summary: 'User info' })
   @Get('public-info/:id')
   async getPublicUserById(@Param('id') id: number,@Request() req: any) {
     return this.userLibService.getUser(id, req);
   }

  @ApiOperation({ summary: 'User Home' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() listUserDto: ListUserDto,@Request() req: any) {
    return this.userLibService.list(listUserDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Top Seller' })
  @Get('get-top-seller')
  async topSellerNew(@Query() listUserDto: ListUserDto) {
    return this.userLibService.getTopSeller(listUserDto);
  }

  @ApiOperation({ summary: 'User Dashboard' })
  @Get('dashboard')
  @ApiBearerAuth()
  async dashboard(@Request() req: any) {
    return this.userLibService.dashboard(req);
  }

  @ApiOperation({ summary: 'Add Favorite User' })
  @Get('add-favorite-user/:id')
  @ApiBearerAuth()
  async addFavoriteUser(@Param('id') id: number, @Request() req: any) {
    return this.userLibService.addFavoriteUser(id, req);
  }

  @ApiOperation({ summary: 'Remove Favorite User' })
  @Get('remove-favorite-user/:id')
  @ApiBearerAuth()
  async removeFavoriteUser(@Param('id') id: number, @Request() req: any) {
    return this.userLibService.removeFavoriteUser(id, req);
  }

  @ApiOperation({ summary: 'Get Favorite User' })
  @Get('get-favorite-users')
  @ApiBearerAuth()
  async getUserFavoriteUsers(@Query() listUserDto: ListFavoriteDto,@Request() req: any) {
    return this.userLibService.getUserFavoriteUsers(listUserDto, req);
  }
  
  @Public()
  @Get('search-suggestions/:query')
  async getDataBySearch(@Param('query') search: string, @Request() req: any) {
    return this.userLibService.getSearchedData(search, req);
  }

  @ApiOperation({ summary: 'Report to user' })
  @Put('report')
  @ApiBearerAuth()
  async report(
    @Body() report: reportDTO,
    @Request() req: any,
  ) {
    return this.userLibService.report(report, req);
  }

  @Public()
  @ApiOperation({ summary: 'Get all review of user' })
  @Post('get-all-reviews')
  async getReviewsListByUserId(
    @Body() reviewListDto: reviewListDTO,
    @Request() req: any) {
    return this.userLibService.getAllReviews(reviewListDto, req);
  }

}
