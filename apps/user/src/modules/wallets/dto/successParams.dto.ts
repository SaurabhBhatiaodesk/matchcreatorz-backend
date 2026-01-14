import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class successParamsDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '20',
    required: true,
  })
  orderId: string;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: true,
  })
  userId: number;
}
