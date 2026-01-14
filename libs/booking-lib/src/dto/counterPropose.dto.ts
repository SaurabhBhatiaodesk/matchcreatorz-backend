import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CounterProposeDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: false,
  })
  bookingId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 110,
    required: false,
  })
  amount: number;
}
