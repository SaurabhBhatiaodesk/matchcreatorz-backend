import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Gender } from 'common/enums';

export class UpdateProfileDto {

  @IsOptional()
  @ApiProperty({
    example: '23 Swaj Farm,',
    required: false,
  })
  address: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Jhon Deo',
    required: true,
  })
  fullName: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: Gender.MALE,
    required: true,
  })
  gender: Gender;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '100-200',
  })
  priceRange: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '2001-05-13',
    required: true,
  })
  dob: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 12,
    required: true,
  })
  countryId: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 25,
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

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'jhon@yopmail.com',
    required: false,
  })
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 5,
    required: true,
  })
  categoryId: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '+91',
    required: false,
  })
  countryCode?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '9958390949',
    required: false,
  })
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({
    example: [1, 2],
    description: 'tag IDs',
    required: true,
  })
  tagId: number[];

  @IsOptional()
  @ApiProperty({
    example: 'hey im ironman',
    required: false,
  })
  bio?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'banner.jpg',
    required: true,
  })
  banner: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'file.pdf',
    required: true,
  })
  resume: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'MY Resume',
    required: true,
  })
  resumeName: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: '15',
    required: true,
  })
  responseTime: string;


}
