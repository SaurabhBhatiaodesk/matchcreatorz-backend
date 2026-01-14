import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber , ValidateIf } from 'class-validator';


export class UpdatePortfolioDto {

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
    example: 2,
    required: true,
  })
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'title',
    required: true,
  })
  title: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abc.png',
  })
  image: string;
}
