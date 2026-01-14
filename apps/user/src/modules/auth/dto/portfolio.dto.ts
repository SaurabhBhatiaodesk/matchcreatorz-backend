import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';


export class SignupDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'title',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    example: ['abc.png', 'ced.png'],
    required: true,
  })
  portfolioImage: string;
}
