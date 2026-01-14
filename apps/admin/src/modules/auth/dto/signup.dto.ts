import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'profile.jpg',
  })
  avatar: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Kanha Restaurant',
    required: true,
  })
  restaurantName: string;

  @IsEmail()
  @ApiProperty({
    example: 'kanha@yopmail.com',
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

  @IsNotEmpty()
  @ApiProperty({
    example: 'ABcd@1234',
    required: true,
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Konstant Infosolutions',
    required: true,
  })
  address: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Jaipur',
    required: true,
  })
  city: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 26.8920435,
    required: true,
  })
  latitude: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 75.6888892,
    required: true,
  })
  longitude: number;

  @ApiProperty({
    example: '',
  })
  deviceToken: string;
}
