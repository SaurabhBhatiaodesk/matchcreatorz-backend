import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsOptional } from 'class-validator';

export class AddAmountDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 20,
    required: true,
  })
  amount: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  userId?: number;
}
