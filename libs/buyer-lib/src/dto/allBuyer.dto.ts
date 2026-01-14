import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ActiveStatus, SortDirection } from 'common/enums';

export class AllBuyerDto {
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
  page: number;

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
  search: string;

  @ApiProperty({
    example: 'ALL',
    required: false,
    enum: ActiveStatus,
  })
  activeStatus: ActiveStatus;

  @ApiProperty({
    example: 'id',
    required: false,
  })
  sortBy: string;

  @ApiProperty({
    example: 'DESC',
    required: false,
    enum: SortDirection,
  })
  sortDirection: SortDirection;
  query: any;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '2024-09-16T18:30:00.000Z',
    required: false,
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '2024-09-24T18:30:00.000Z',
    required: false,
  })
  endDate: string;
}
