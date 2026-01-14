import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CounterOfferDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: false,
  })
  id: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 110,
    required: false,
  })
  price: number;
}
