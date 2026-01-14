// Import necessary modules and decorators
import { Body, Controller, Post, Put, Request, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto, ResetPasswordDto, UpdateProfileDto, UpdateAvatarDto, ForgotPasswordDto, ChangePasswordDto } from './dto';
import { CustomHeaders, Public } from 'common/decorators';
import { DateRangeDto } from './dto/dateRange.dto';

// Define AuthController and set custom headers
@ApiTags('Auth')
@Controller('auth')
@CustomHeaders()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Public route for user login
  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    return this.authService.login(loginDto, req);
  }

  // Route to fetch dashboard data (requires authentication)
  @ApiOperation({ summary: 'Dashboard' })
  @Get('dashboard')
  @ApiBearerAuth()
  async dashboard(@Request() req: any, @Query() dateRange: DateRangeDto) {
    return this.authService.dashboard(req, dateRange);
  }

  // Route to fetch user profile (requires authentication)
  @ApiOperation({ summary: 'Profile' })
  @Get('profile')
  @ApiBearerAuth()
  async profile(@Request() req: any) {
    return this.authService.profile(req);
  }

  // Route to update user profile (requires authentication)
  @ApiOperation({ summary: 'Update profile' })
  @Put('update-profile')
  @ApiBearerAuth()
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req: any) {
    return this.authService.updateProfile(updateProfileDto, req);
  }

  // Route to update user avatar (requires authentication)
  @ApiOperation({ summary: 'Update avatar' })
  @Put('avatar')
  @ApiBearerAuth()
  async updateAvatar(@Body() updateAvatarDto: UpdateAvatarDto, @Request() req: any) {
    return this.authService.updateAvatar(updateAvatarDto, req);
  }

  // Route to change user password (requires authentication)
  @ApiOperation({ summary: 'Change password' })
  @Post('change-password')
  @ApiBearerAuth()
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req: any) {
    return this.authService.changePassword(changePasswordDto, req);
  }

  // Public route for forgot password
  @Public()
  @ApiOperation({ summary: 'Forgot password' })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  // Public route for password reset
  @Public()
  @ApiOperation({ summary: 'Reset password' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Route to log out (requires authentication)
  @ApiOperation({ summary: 'Log-Out' })
  @Get('log-out')
  @ApiBearerAuth()
  async logout(@Request() req: any) {
    return this.authService.logout(req);
  }

  // Public route to get country data
  @Public()
  @ApiOperation({ summary: 'Get Country Data' })
  @Get('get-country')
  async getCountry() {
    return this.authService.getCountry();
  }

  // Public route to get state data by country ID
  @Public()
  @ApiOperation({ summary: 'Get State Data' })
  @Get('get-state')
  async getState(@Query('countryId') id: number) {
    return this.authService.getStateByCountryId(id);
  }

  // Public route to get city data by state ID
  @Public()
  @ApiOperation({ summary: 'Get City Data' })
  @Get('get-city')
  async getCity(@Query('stateId') id: number) {
    return this.authService.getCityByStateId(id);
  }

  // Public route to get category data
  @Public()
  @ApiOperation({ summary: 'Get Category Data' })
  @Get('get-category')
  async getCategory() {
    return this.authService.getCategory();
  }
}
