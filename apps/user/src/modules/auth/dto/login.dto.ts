import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString , ValidateIf } from 'class-validator';
import {  UserType } from 'common/enums';
export class LoginDto {

  @IsNotEmpty()
  @ApiProperty({
    example: 'SELLER/BUYER',
    required: true,
  })
  type: UserType;

  @ValidateIf((o) => !o.email) 
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '+917014611111/abc@yopmail.com',
    required: false, 
  })
  userName: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  password: string;

  @ApiProperty({
    example: '',
  })
  deviceToken: string;
}
