import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendChatRequestDto {

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  sellerId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'This is test',
    required: true,
  })
  message: string;

}
