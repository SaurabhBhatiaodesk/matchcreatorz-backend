import { ApiProperty } from '@nestjs/swagger';

export class AllBannerDto {

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
}
