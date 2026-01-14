import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddConnectDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  connectId: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  userId?: number;
}
