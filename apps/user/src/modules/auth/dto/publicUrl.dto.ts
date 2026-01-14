import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordURLDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'i$2b$10$LpcyH',
    required: true,
  })
  validateString: string;
}
