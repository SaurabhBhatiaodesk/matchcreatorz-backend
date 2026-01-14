import { Body, Controller, Get, Post, Query, Request, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  LoginDto,
  SignupDto,
  RequestOtpDto,
  VerifyOtpDto,
  ResetPasswordDto,
  getTokenDto,
  SocialLoginDto
} from './dto';
import { CustomHeaders, Public } from 'common/decorators';
import { ResetPasswordURLDto } from './dto/publicUrl.dto';

@ApiTags('Auth')
@Controller('auth')
@CustomHeaders()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Signup' })
  @Post('signup')
  @UsePipes(new ValidationPipe())
  async register(@Body() signupDto: SignupDto) {
    // Debug logs to verify incoming signup payload and flow
    console.log('[/auth/signup] Received signup request');
    console.log('[/auth/signup] Payload:', signupDto);
    return this.authService.signup(signupDto);
  }

  @Public()
  @ApiOperation({ summary: 'Request otp (sign-up/forget-password)', description: 'Request otp for sign-up and forget password' })
  @ApiBody({ type: RequestOtpDto })
  @Post('request-otp')
  async requestOtp(@Body() requestOtpDto: RequestOtpDto, @Request() req: any) {
    return this.authService.requestOtp(requestOtpDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Verify otp' })
  @ApiBody({ type: VerifyOtpDto })
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Request() req: any) {
    return this.authService.verifyOtp(verifyOtpDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    return this.authService.login(loginDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Social Login' })
  @ApiBody({ type: SocialLoginDto })
  @Post('social-login')
  async socialLogin(@Body() socilaLoginDto: SocialLoginDto, @Request() req: any) {
    return this.authService.socialLogin(socilaLoginDto, req);
  }

  @Public()
  @ApiOperation({ summary: 'Reset password' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Request() req: any) {
    return this.authService.resetPassword(resetPasswordDto, req);
  }

/*   @Public()
  @ApiOperation({ summary: 'Get Token From UserId' })
  @Post('get-token')
  async getToken(@Body() getTokenData: getTokenDto, @Request() req: any) {
    return this.authService.token(getTokenData, req);
  } */

  
  // Public route for password reset
  @Public()
  @ApiOperation({ summary: 'verify email from email' })
  @Get('verify-email-token')
  async resetPasswordFromURL(@Query() resetPasswordURLDto: ResetPasswordURLDto, @Res() res: Response) {
    return this.authService.resetPasswordURL(resetPasswordURLDto, res);
  }
}
