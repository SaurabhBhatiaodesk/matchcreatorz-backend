import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ActiveStatus, SortDirection } from 'common/enums';

export class AllUserDto {
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
}
