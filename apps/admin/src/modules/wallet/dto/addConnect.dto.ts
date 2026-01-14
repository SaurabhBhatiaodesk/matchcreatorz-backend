import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ConnectDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    required: true,
  })
  userId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 20,
    required: true,
  })
  connectId: number;
}
