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
  id?: number;

  @ValidateIf((o) => o.userId !== undefined) 
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 11,
    required: false, 
  })
  userId?: number;

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
