import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateRequestDto {
  @ApiProperty({
    example: 1,
    required: true,
  })
  userId: number;

  @IsOptional()
  @IsIn(['accept', 'reject'])
  @ApiProperty({
    enum: ['accept', 'reject'],
    example: 'accept/reject',
    required: true,
  })
  status: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Reason for rejection',
    required: false,
  })
  reason?: string;
}
