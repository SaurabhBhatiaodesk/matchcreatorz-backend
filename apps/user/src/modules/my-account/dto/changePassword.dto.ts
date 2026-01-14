import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@1234',
    required: true,
  })
  currentPassword: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  newPassword: string;
}
