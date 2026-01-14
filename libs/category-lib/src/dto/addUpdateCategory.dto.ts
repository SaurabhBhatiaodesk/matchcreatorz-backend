import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddUpdateCategoryDto {
  @ApiProperty({
    example: 2,
    required: false,
  })
  id?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'title',
    required: true,
  })
  title: string;
}
