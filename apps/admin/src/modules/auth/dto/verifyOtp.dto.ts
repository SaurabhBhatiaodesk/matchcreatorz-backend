import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { OtpType, VerificationType } from 'common/enums';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'SIGN_UP',
    required: true,
  })
  type: OtpType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '+91',
    required: true,
  })
  @ValidateIf((o) => o.verificationType === VerificationType.PHONE)
  countryCode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '9958390949',
    required: true,
  })
  @ValidateIf((o) => o.verificationType === VerificationType.PHONE)
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'jugal@yopmail.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'PHONE',
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
