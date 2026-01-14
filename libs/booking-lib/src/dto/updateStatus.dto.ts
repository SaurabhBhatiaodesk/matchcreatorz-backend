import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    enum: [ 'In-dispute', 'Amidst-Cancellation', 'WithDrawn'],
    example: 'Amidst-Cancellation',
    required: false,
  })
  status?: string;

  @IsOptional()
  @ApiProperty({
    example: '',
    required: false,
  })
  reason?: string;

  @IsOptional()
  @ApiProperty({
    example: 80,
    required: false,
  })
  settlementAmountProposed?: number;
}
