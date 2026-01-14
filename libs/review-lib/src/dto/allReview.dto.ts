import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BookingType, SortDirection } from 'common/enums';

export class AllBookingDto {
  @IsOptional()
  @ApiProperty({
    example: 10,
    required: false,
  })
  userId: number;

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
    enum: BookingType,
  })
  bookingType: BookingType;

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

  @ApiProperty({
    example: '',
    required: false,
  })
  BookingId: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  byMonth: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  byYear: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  bookingStatus: string;
}
