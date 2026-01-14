import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class UpdateReviewDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: false,
  })
  id: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  userId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    required: true,
  })
  reviewMessage: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: false,
  })
  totalStar: number;
}
