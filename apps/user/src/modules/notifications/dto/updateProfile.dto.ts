import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Gender } from 'common/enums';

export class UpdateProfileDto {

  @IsNotEmpty()
  @ApiProperty({
    example: 'Jugal Kishor',
    required: true,
  })
  fullName: string;

  @IsNotEmpty()
  @ApiProperty({
    example: Gender.MALE,
    required: true,
  })
  gender: Gender;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Konstant',
    required: true,
  })
  companyName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'jugal@yopmail.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'en',
    required: true,
  })
  countrySortName: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '+91',
    required: true,
  })
  countryCode: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '9958390949',
    required: true,
  })
  phone: string;
}
