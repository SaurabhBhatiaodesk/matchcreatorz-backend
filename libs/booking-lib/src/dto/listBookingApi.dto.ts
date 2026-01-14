import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class ListBookingApiDto {

@IsNotEmpty()
@ApiProperty({
    enum: ['Active', 'Completed', 'Cancelled'],
    example: 'Active',
    required: true,
})
type: string;

@IsNotEmpty()
@ApiProperty({
example: false,
required: false,
})
pagination: boolean;

@ApiProperty({
example: 0,
required: false,
})
skip: number;

@ApiProperty({
example: 10,
required: false,
})
limit: number;
  

@ApiProperty({
example: '',
required: false,
})
searchTerm: string;

@IsOptional()
@IsIn(['Ongoing', 'Amidst-Cancellation', 'Amidst-Completion-Process', 'In-dispute'])
@ApiProperty({
enum: ['Ongoing', 'Amidst-Cancellation', 'Amidst-Completion-Process', 'In-dispute'],
example: 'Ongoing',
required: false,
})
filterBy?: string;

@IsOptional()
@IsIn(['all', 'old_to_new', 'new_to_old'])
@ApiProperty({
enum: ['all', 'old_to_new', 'new_to_old'],
example: 'all',
required: false,
})
sorting?: string;
}
