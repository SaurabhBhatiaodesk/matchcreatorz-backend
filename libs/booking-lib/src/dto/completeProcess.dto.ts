import { IsArray, IsOptional} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CompleteProcessDto {

  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    required: true,
  })
  bookingId: number;

  @IsNotEmpty()
  @ApiProperty({
    enum: ['Amidst-Completion-Process'],
    example: 'Amidst-Completion-Process',
    required: true,
  })
  status: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: ['doc.png', 'docs.png'],
    required: false,
    type: [String],
  })
  images: string[];
}
