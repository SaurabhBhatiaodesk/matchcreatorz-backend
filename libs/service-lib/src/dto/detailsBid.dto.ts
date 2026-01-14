import { ApiProperty } from '@nestjs/swagger';

export class DetailsBidDto {
  @ApiProperty({
    example: 0,
    required: true,
  })
  bidId: number;
}
