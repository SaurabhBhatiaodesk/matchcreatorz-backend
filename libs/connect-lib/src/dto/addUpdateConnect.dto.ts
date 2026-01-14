import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddUpdateConnectDto {
  @ApiProperty({
    example: 2,
    required: false,
  })
  id?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Basic',
    required: true,
  })
  planName: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    required: true,
  })
  price: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1000,
    required: true,
  })
  connects: number;

  
  @IsOptional()
  @ApiProperty({
    example: "Test Desc",
    required: false,
  })
  description: string;


}
