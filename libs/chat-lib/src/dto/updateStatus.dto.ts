import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    enum: ['Accept', 'Reject'],
    example: 'Accept',
    required: false,
  })
  status?: string;
}
