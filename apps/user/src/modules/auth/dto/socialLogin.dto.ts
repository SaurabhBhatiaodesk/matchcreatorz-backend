import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional} from 'class-validator';
import {  UserType } from 'common/enums';

export class SocialLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'SELLER/BUYER',
    required: true,
  })
  type: UserType;
  
  @IsOptional()
  @ApiProperty({
    example: 'Rahul Dubey',
    required: false,
  })
  fullName: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'marketadmin@yopmail.com',
    required: false,
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'GOOGLE/APPLE/FACEBOOK',
    required: true,
  })
  socialType: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '748596',
    required: true,
  })
  socialId: string;

  @ApiProperty({
    example: '1234567',
  })
  deviceToken: string;
}
