import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class tagDto {
  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  categoryId?: number;
}
