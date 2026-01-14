import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  JobId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: false,
  })
  bidId?: number;

  @ApiProperty({
    example: 'ACCEPT/REJECT',
    required: true,
  })
  status: string;
}
