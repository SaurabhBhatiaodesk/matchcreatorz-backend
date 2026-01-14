import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class reviewListDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    required: true,
  })
  userId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: true,
    required: true,
  })
  pagination: boolean;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  skip: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    required: true,
  })
  limit: number;
}
