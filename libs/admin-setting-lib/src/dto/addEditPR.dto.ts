import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional
} from 'class-validator';
export class AddEditPRDto {
  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  id?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  min?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  max?: number;
}
