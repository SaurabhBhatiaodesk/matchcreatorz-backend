import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class UpdateProfileStatusDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  id: number;

  @IsOptional()
  @ApiProperty({
    example: 'subject',
    required: false,
  })
  subject: string;

  @IsOptional()
  @ApiProperty({
    example: 'body',
    required: false,
  })
  body: string;
}
