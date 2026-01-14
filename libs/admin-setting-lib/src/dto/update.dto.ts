import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDto {
  @IsOptional()
  @ApiProperty({
    example: '1.0.0',
    required: false,
  })
  androidAppVersion?: string;

  @IsOptional()
  @ApiProperty({
    example: false,
    required: false,
  })
  androidForceUpdate?: boolean;

  @IsOptional()
  @ApiProperty({
    example: '1.0.0',
    required: false,
  })
  iosAppVersion?: string;

  @IsOptional()
  @ApiProperty({
    example: false,
    required: false,
  })
  iosForceUpdate?: boolean;

  @IsOptional()
  @ApiProperty({
    example: false,
    required: false,
  })
  maintenanceMode?: boolean;

  @IsOptional()
  @ApiProperty({
    example: '1.0.0',
    required: false,
  })
  websiteVersion?: string;

  @IsOptional()
  @ApiProperty({
    example: '2',
    required: false,
  })
  responseTime?: string;

  @IsOptional()
  @ApiProperty({
    example: '100-500',
    required: false,
  })
  priceRange?: string;

  @IsOptional()
  @ApiProperty({
    example: false,
    required: false,
  })
  earningSellerCardVisibility?: boolean;

  @IsOptional()
  @ApiProperty({
    example: false,
    required: false,
  })
  earningBuyerCardVisibility?: boolean;

  @IsOptional()
  @ApiProperty({
    example: '1',
    required: false,
  })
  bookingPercentageForPayment?: string;

  @IsOptional()
  @ApiProperty({
    example: '1',
    required: false,
  })
  bookingPercentage?: string;

  @IsOptional()
  @ApiProperty({
    example: '1',
    required: false,
  })
  cancellationPercentage?: string;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  platformFee?: number;

  @IsOptional()
  @ApiProperty({
    example: 1,
    required: false,
  })
  minPercentForSettle?: number;

}
