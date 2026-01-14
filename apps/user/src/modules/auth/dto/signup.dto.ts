import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, ValidateIf  } from 'class-validator';
import {  UserType } from 'common/enums';

export class SignupDto {
  @ApiProperty({
    example: 'profile.jpg',
  })
  avatar: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'SELLER/BUYER',
    required: true,
  })
  type: UserType;
  
  @IsNotEmpty()
  @ApiProperty({
    example: 'Rahul Dubey(Seller)',
    required: true,
  })
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'marketadmin@yopmail.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '+91',
    required: true,
  })
  countryCode: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '7014622222',
    required: true,
  })
  phone: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  password: string;

  @ValidateIf((o) => o.type === 'SELLER')
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  countryId: number;

  @ValidateIf((o) => o.type === 'SELLER')
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  stateId: number;


  @ValidateIf((o) => o.type === 'SELLER')
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Jaipur',
    required: true,
  })
  city: string;

  @ValidateIf((o) => o.type === 'SELLER')
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '421025',
    required: true,
  })
  zipcode: string;

  @ApiProperty({
    example: 'token',
  })
  deviceToken: string;
}
