import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    enum: ['Accepted', 'Rejected', 'WithDrawn'],
    example: 'Accepted',
    required: false,
  })
  status?: string;
}
