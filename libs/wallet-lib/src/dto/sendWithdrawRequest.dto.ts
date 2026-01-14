import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendWithdrawRequestDto {

  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    required: true,
  })
  amount: number;  

  @IsNotEmpty()
  @ApiProperty({
    example: "1234567",
    required: true,
  })
  accountNumber: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "aasa",
    required: true,
  })
  iban: string;

  
  @IsNotEmpty()
  @ApiProperty({
    example: "aasa",
    required: true,
  })
  swift: string;

  
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  countryId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: "Green",
    required: true,
  })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "Smith",
    required: true,
  })
  lastName: string;
}
