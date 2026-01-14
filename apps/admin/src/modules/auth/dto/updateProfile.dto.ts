import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProfileDto {

  @IsOptional()              
  @IsNotEmpty()              
  @ApiProperty({              
    example: '',        
    required: false,          
  })
  avatar: string;  

  @IsOptional()              
  @IsNotEmpty()              
  @ApiProperty({              
    example: 'Super',        
    required: false,          
  })
  firstName: string;         

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin',
    required: false,
  })
  lastName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()                 
  @ApiProperty({
    example: 'as@yopmail.com',
    required: false,
  })
  email: string;
}
