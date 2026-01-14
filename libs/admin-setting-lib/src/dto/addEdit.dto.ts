import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
export class AddEditRTDto {
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
  hours?: number;
}
