import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FileType } from 'common/enums';

export class UploadFilesDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'users',
    required: true,
  })
  location: string;

  @IsNotEmpty()
  @ApiProperty({
    enum: FileType,
    example: FileType.png,
    required: true,
  })
  type: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  count: number;
}
