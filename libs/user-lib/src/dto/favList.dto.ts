import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ListFavoriteDto {
  @IsNotEmpty()
  @ApiProperty({
    example: false,
    required: false,
  })
  pagination: boolean;
  
  @ApiProperty({
    example: 1,
    required: false,
  })
  skip: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  limit: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  searchTerm: string;
}
