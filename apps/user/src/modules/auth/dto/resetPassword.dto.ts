import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { VerificationType } from 'common/enums';

export class ResetPasswordDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '+917014611111',
    required: false,
  })
  phone: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'user@yopmail.com',
    required: false,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'PHONE/EMAIL',
    required: true,
  })
  @ValidateIf((o) => o.verificationType === VerificationType.EMAIL)
  verificationType: VerificationType;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin@1234',
    required: true,
  })
  password: string;
}
