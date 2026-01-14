import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ListBidDto {
  @ApiProperty({
    example: 0,
    required: false,
  })
  skip?: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  searchTerm?: string;

  @IsOptional()
  @IsIn(['all', 'accepted', 'rejected', 'pending'])
  @ApiProperty({
    enum: ['all', 'accepted', 'rejected', 'pending'],
    example: 'all',
    required: false,
  })
  filter?: string;
}
