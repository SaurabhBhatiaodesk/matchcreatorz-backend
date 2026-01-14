import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePageDto {

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: true,
  })
  id?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'title',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'desc',
    required: true,
  })
  description: string;
}
