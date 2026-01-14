import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddUpdateTagDto {
  @ApiProperty({
    example: 2,
    required: false,
  })
  id?: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  categoryId?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'name',
    required: true,
  })
  name: string;
}
