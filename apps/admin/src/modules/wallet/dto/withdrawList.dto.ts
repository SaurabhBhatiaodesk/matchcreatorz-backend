import { ApiProperty } from '@nestjs/swagger';
export class AllWithDrawRequestDto {
  @ApiProperty({
    example: 0,
    required: true,
  })
  page: number;

  @ApiProperty({
    example: 10,
    required: true,
  })
  limit: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  order: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  search: string;
}
