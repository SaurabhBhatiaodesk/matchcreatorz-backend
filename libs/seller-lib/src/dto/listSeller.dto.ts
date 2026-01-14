import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ListSellerDto {
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    required: false,
  })
  pagination: boolean;

  @ApiProperty({
    example: 0,
    required: false,
  })
  skip: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  limit: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  searchTerm: string;
}
