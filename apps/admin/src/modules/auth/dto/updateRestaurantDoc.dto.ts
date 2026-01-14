import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateRestaurantDocDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  restaurantId: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 'restaurant-doc.pdf',
    required: true,
  })
  restaurantDoc: string;
}
