import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'ABcd@1234',
    required: true,
  })
  currentPassword: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'ABcd@123',
    required: true,
  })
  newPassword: string;
}
