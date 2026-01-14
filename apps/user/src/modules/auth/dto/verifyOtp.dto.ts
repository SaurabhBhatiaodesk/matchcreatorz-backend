import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { OtpType, VerificationType } from 'common/enums';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'SIGN_UP/FORGOT_PASSWORD/UPDATE_PHONE/UPDATE_EMAIL',
    required: true,
  })
  type: OtpType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '+917014611111',
    required: true,
  })
  @ValidateIf((o) => o.verificationType === VerificationType.PHONE)
  phone: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'user@yopmail.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'PHONE/EMAIL',
    required: true,
  })
  @ValidateIf((o) => o.verificationType === VerificationType.EMAIL)
  verificationType: VerificationType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1234',
    required: true,
  })
  otp: string;
}
