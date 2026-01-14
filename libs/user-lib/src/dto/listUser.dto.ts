import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class ListUserDto {
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    required: false,
  })
  pagination: boolean;

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
    example: '',
    required: false,
  })
  searchTerm: string;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  countryId?: number;

  @IsOptional()
  @ApiProperty({
    example: "100-200",
    required: false,
  })
  sallary?: string;

  @IsOptional()
  @ApiProperty({
    example: 2,
    required: false,
  })
  responseTime?: number;

  @IsOptional()
  @IsIn(['price'])
  @ApiProperty({
    enum: ['price'],
    example: 'price',
    required: false,
  })
  sortBy?: string;

  @IsOptional()
  @IsIn(['all', 'low_to_high', 'high_to_low'])
  @ApiProperty({
    enum: ['all', 'low_to_high', 'high_to_low'],
    example: 'all',
    required: false,
  })
  sorting?: string;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  categoryId?: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  tagId?: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  userId?: number;
}
