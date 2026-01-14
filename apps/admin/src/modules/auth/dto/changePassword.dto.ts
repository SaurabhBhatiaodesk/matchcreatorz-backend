import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Admin@12345',
    required: true,
  })
  newPassword: string;
}
