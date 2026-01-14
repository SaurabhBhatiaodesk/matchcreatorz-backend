import { IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddBidDto {

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  bidId?: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: true,
  })
  serviceId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    required: true,
  })
  bidAmount: number;
}
