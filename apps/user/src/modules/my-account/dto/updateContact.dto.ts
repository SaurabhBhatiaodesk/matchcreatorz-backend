import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateContactInfoDto {

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'jhon@yopmail.com',
    required: false,
  })
  email?: string;

  @IsOptional()
  @ApiProperty({
    example: '+91',
    required: false,
  })
  countryCode?: string;

  @IsOptional()
  @ApiProperty({
    example: '9958390949',
    required: false,
  })
  phone?: string;

}
