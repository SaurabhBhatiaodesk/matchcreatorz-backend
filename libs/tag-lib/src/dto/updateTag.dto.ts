import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateTagDto {
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 0,
    required: true,
  })
  description: string;
}
