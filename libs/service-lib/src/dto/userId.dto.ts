import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserIdDto {
  @IsOptional()
  @ApiProperty({
    example: 4,
    required: false,
  })
  userId?: number;
}
