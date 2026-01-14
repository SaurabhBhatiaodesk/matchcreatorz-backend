import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class addReviewDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  bookingId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 5,
    required: true,
  })
  rating: number;

  @IsOptional()
  @ApiProperty({
    example: 'Good All',
    required: false,
  })
  review: string;
}
