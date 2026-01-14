import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateJOBStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  JobId: number;

  @ApiProperty({
    example: 'CLOSED',
    required: true,
  })
  status: string;
}
