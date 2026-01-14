import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, ValidateIf  } from 'class-validator';

export class UpdateFAQDto {
  @ValidateIf((o) => o.id !== undefined) 
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    required: false, 
  })
  id: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'question',
    required: true,
  })
  question: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'im answer',
  })
  answer: string;
}
