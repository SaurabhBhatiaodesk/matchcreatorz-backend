import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AllWalletDto {
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    required: false,
  })
  pagination: boolean;

  @ApiProperty({
    example: 0,
    required: false,
  })
  skip: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  limit: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  id: number;
}
