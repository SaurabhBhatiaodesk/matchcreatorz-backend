import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class addMilestoneDto {
  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  milestoneId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  bookingId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'title',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'description',
    required: true,
  })
  description: string;

  @IsOptional()
  @ApiProperty({
    example: '2024-09-04',
    required: true,
  })
  startDate: Date;

  @IsOptional()
  @ApiProperty({
    example: '2024-09-04',
    required: true,
  })
  endDate: Date;
}
