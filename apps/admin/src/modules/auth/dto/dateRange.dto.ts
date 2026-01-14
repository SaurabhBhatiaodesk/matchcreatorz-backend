import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class DateRangeDto {
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
