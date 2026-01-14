import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateReviewDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: false,
  })
  id: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  reviewMessage: string;
}
