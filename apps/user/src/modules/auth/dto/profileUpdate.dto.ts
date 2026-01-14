import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Gender } from 'common/enums';

export class SignupDto {
  @ApiProperty({
    example: '100-200',
  })
  priceRange: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '12 Jan 2001',
    required: true,
  })
  dob: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 11,
    required: true,
  })
  country: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 41,
    required: true,
  })
  state: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 55,
    required: true,
  })
  city: number;

  @IsNotEmpty()
  @ApiProperty({
    example: '521402',
    required: true,
  })
  zipcode: string;

  @IsNotEmpty()
  @ApiProperty({
    example: Gender.MALE,
    required: true,
  })
  gender: Gender;


  @IsNotEmpty()
  @ApiProperty({
    example: 5,
    required: true,
  })
  categoryId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: ["Abc", "bcd"],
    required: true,
  })
  tags: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'hey im ironman',
    required: true,
  })
  bio: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'file.pdf',
    required: true,
  })
  resume: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '15',
    required: true,
  })
  responseTime: string;
}
