import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class ListConnectDto {

  @ApiProperty({
    example: 0,
    required: false,
  })
  id?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: false,
    required: false,
  })
  pagination?: boolean;

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
  @IsIn(['all', 'new_to_old', 'old_to_new'])
  @ApiProperty({
    enum: ['all', 'new_to_old', 'old_to_new'],
    example: 'all',
    required: false,
  })
  sorting?: string;
}
