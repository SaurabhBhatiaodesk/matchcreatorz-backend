import { ApiProperty } from '@nestjs/swagger';
export class getTokenDto {
  @ApiProperty({
    example: 1,
    required: false,
  })
  userId: number;
}
