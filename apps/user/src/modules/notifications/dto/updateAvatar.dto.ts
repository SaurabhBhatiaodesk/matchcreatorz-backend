import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateAvatarDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'profile.jpg',
    required: true,
  })
  avatar: string;
}
