import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WalletUpdateStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    required: true,
  })
  id: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'APPROVED/REJECTED',
    required: true,
  })
  status: string;
}
