import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Language } from 'common/enums';

export class UpdateLanguageDto {
  @IsNotEmpty()
  @ApiProperty({
    example: Language.EN,
    required: true,
  })
  language: Language;
}
