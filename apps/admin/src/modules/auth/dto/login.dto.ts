import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'my-admin@yopmail.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  password: string;
}
