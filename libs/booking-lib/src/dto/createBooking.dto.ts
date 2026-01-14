import { IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {

  @IsOptional()
  @ApiProperty({
    example: 19,
    required: false,
  })
  serviceId?: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: true,
  })
  offerId?: number;

}
