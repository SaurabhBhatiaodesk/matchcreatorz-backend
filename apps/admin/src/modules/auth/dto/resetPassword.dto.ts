import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {

  @IsNotEmpty()
  @ApiProperty({
    example: 'i$2b$10$LpcyH',
    required: true,
  })
  validateString: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@123',
    required: true,
  })
  newPassword: string;
}
