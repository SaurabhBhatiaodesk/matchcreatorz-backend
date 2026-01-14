import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class NotificationDTO {
  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: [1, 2, 3],
    required: false,
    type: [],
  })
  userId?: number[];

  @IsOptional()
  @ApiProperty({
    example: '',
    required: true,
  })
  title: string;

  @IsOptional()
  @ApiProperty({
    example: '',
    required: true,
  })
  description: string;
}
