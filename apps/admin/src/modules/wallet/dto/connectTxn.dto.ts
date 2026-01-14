import { ApiProperty } from '@nestjs/swagger';

export class connectListTxnDto {
  @ApiProperty({
    example: 1,
    required: false,
  })
  skip: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  limit: number;

  @ApiProperty({
    example: 1,
    required: true,
  })
  userId: number;
}
