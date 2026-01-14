import { IsArray, IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddUpdateServiceDto {

  @IsOptional()
  @ApiProperty({
    example: 110,
    required: false,
  })
  id?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Job title',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  categoryId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  countryId: number;

  @IsOptional()
  @ApiProperty({
    example: 110,
    required: false,
  })
  price: number;

  @IsOptional()
  @ApiProperty({
    example: '100-200',
    required: false,
  })
  priceRange: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'This is a job description',
    required: true,
  })
  description: string;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    example: [1, 2],
    required: true,
    type: [Number],
  })
  tagIds: number[];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: [{
      name : 'docs.pdf',
      url : 'docs.pdf'
    },{
        name : 'docs1.pdf',
        url : 'docs1.pdf'
    }],
    required: false,
  })
  documents: [];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: ['doc.png', 'docs.png'],
    required: false,
  })
  images: string[];
}
