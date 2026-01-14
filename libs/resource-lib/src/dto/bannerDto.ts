import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BannerDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'banner.jpeg',
    required: true,
  })
  image: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'go.google.com',
    required: true,
  })
  url: string;
}


export class TestimoialDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'avatar.png',
    required: true,
  })
  avatar: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    required: true,
  })
  designation: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    required: true,
  })
  totalRating: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    required: true,
  })
  comment: string;
}