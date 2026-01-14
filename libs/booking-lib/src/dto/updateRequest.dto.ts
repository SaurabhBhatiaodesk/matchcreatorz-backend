import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateRequestDto {
    @IsNotEmpty()
    @ApiProperty({
        enum: ['Cancel', 'Complete'],
        example: 'Cancel',
        required: true,
    })
    type: string;
    
    @IsNotEmpty()
    @ApiProperty({
        enum: ['Accepted', 'Rejected'],
        example: 'Accepted',
        required: true,
    })
    status: string;
}
