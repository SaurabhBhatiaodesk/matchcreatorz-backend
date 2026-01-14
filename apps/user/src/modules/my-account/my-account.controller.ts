import { Body, Controller, Delete, Get, Put,Param, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders, Public } from 'common/decorators';
import {
  ChangePasswordDto,
  UpdateAvatarDto,
  UpdateLanguageDto,
  UpdateProfileDto,
  UpdateFAQDto,
  UpdatePortfolioDto,
  UpdateContactInfoDto
} from './dto';
import { MyAccountService } from './my-account.service';

@ApiTags('My Account')
@Controller('my-account')
@CustomHeaders()
export class MyAccountController {
  constructor(private readonly myAccountService: MyAccountService) {}

  @ApiOperation({ summary: 'User profile' })
  @Get('get-profile')
  @ApiBearerAuth()
  async profile(@Request() req: any) {
    return this.myAccountService.profile(req);
  }

  @ApiOperation({ summary: 'Other Profile info' })
  @Get('other-profile/:userId')
  @ApiBearerAuth()
  async otherProfile(@Param('userId') userId: number) {
    return this.myAccountService.otherProfile(userId);
  }

  @ApiOperation({ summary: 'Update profile' })
  @Put('update-profile')
  @ApiBearerAuth()
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: any,
  ) {
    return this.myAccountService.updateProfile(updateProfileDto, req);
  }

  @ApiOperation({ summary: 'Update email/phone' })
  @Put('update-contact-info')
  @ApiBearerAuth()
  async updateEmailORPhone(
    @Body() updateContactDto: UpdateContactInfoDto,
    @Request() req: any,
  ) {
    return this.myAccountService.updateContact(updateContactDto, req);
  }

  @ApiOperation({ summary: 'User Faq' })
  @Get('get-faq')
  @ApiBearerAuth()
  async getFaq(@Request() req: any) {
    return this.myAccountService.getFaq(req);
  }

  @ApiOperation({ summary: 'Add/Update faq' })
  @Put('update-faq')
  @ApiBearerAuth()
  async updateFAQ(
    @Body() updateFAQDto: UpdateFAQDto,
    @Request() req: any,
  ) {
    return this.myAccountService.updateFAQ(updateFAQDto, req);
  }

  @ApiOperation({ summary: 'Delete faq' })
  @Delete('delete-faq/:id')
  @ApiBearerAuth()
  async deleteFAQ(@Param('id') id: number, @Request() req: any) {
    return this.myAccountService.deleteFAQ(id, req);
  }


  @ApiOperation({ summary: 'User Portfolio' })
  @Get('get-portfolio')
  @ApiBearerAuth()
  async getPortfolio(@Request() req: any) {
    return this.myAccountService.getPortfolio(req);
  }

  @ApiOperation({ summary: 'Add/Update portfolio' })
  @Put('update-portfolio')
  @ApiBearerAuth()
  async updatePortfolio(
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Request() req: any,
  ) {
    return this.myAccountService.updatePortfolio(updatePortfolioDto, req);
  }

  @ApiOperation({ summary: 'Delete portfolio' })
  @Delete('delete-portfolio/:id')
  @ApiBearerAuth()
  async deletePortfolio(@Param('id') id: number, @Request() req: any) {
    return this.myAccountService.deletePortfolio(id, req);
  }

  @ApiOperation({ summary: 'Update avatar' })
  @Put('avatar')
  @ApiBearerAuth()
  async updateAvatar(
    @Body() updateAvatarDto: UpdateAvatarDto,
    @Request() req: any,
  ) {
    return this.myAccountService.updateAvatar(updateAvatarDto, req);
  }

  @ApiOperation({ summary: 'Update language' })
  @Put('language')
  @ApiBearerAuth()
  async updateLanguage(
    @Body() updateLanguageDto: UpdateLanguageDto,
    @Request() req: any,
  ) {
    return this.myAccountService.updateLanguage(updateLanguageDto, req);
  }

  @ApiOperation({ summary: 'Update notification status' })
  @Put('notification-toggle')
  @ApiBearerAuth()
  async notificationToggle(@Request() req: any) {
    return this.myAccountService.notificationToggle(req);
  }

  @ApiOperation({ summary: 'Delete account' })
  @Delete('delete-account')
  @ApiBearerAuth()
  async deleteAccount(@Request() req: any) {
    return this.myAccountService.deleteAccount(req);
  }

  @Public()
  @ApiOperation({ summary: 'Delete account' })
  @Get('delete-account')
  async deleteGetAccount() {
    return {"success":true,"message":"Unauthorized","data":{}};
  }

  @ApiOperation({ summary: 'Change password' })
  @Put('change-password')
  @ApiBearerAuth()
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    return this.myAccountService.changePassword(changePasswordDto, req);
  }

  @ApiOperation({ summary: 'Logout' })
  @Get('logout')
  @ApiBearerAuth()
  async logout(@Request() req) {
    return this.myAccountService.logout(req);
  }
}
