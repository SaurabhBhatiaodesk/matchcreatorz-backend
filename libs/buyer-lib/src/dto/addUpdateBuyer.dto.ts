import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Gender } from 'common/enums';

export class UpdateBuyerProfileDto {
  @ApiProperty({
    example: 1,
    required: false,
  })
  id?: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Jhon Deo',
    required: true,
  })
  fullName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'jhon@yopmail.com',
    required: true,
  })
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '+91',
    required: true,
  })
  countryCode: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '9958390949',
    required: true,
  })
  phone: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'hey im ironman',
    required: true,
  })
  bio: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: Gender.MALE,
    required: true,
  })
  gender: Gender;

  @IsOptional()
  @ApiProperty({
    example: 'address',
    required: false,
  })
  address: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  countryId: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  stateId: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Jaipur',
    required: true,
  })
  city: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '421025',
    required: true,
  })
  zipcode: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  password: string;
}
