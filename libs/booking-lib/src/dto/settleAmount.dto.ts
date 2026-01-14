import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class SettleBookingDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  id: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  settleAmount: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  refundAmount: number;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    required: false,
  })
  status: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    required: false,
  })
  bookingStatus: string;
}
