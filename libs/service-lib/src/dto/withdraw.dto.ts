import { IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawBidDto {

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: true,
  })
  bidId: number;
}
