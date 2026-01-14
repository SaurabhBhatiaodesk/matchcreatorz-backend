import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, ValidateIf } from 'class-validator';

export class reportDTO {
  @ValidateIf((o) => o.userId !== undefined)
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    required: false,
  })
  userId: number;

  @IsOptional()
  @ApiProperty({
    example: '',
    required: true,
  })
  reason: string;
}
