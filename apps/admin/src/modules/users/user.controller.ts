// Import necessary modules, services, and DTOs
import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { UserLibService } from '@app/user-lib';
import { AllUserDto } from '@app/user-lib/dto';

// Define UserController and set custom headers
@ApiTags('User')
@Controller('users')
@CustomHeaders()
export class UserController {
  constructor(private readonly userLibService: UserLibService) {}

  // Route to list all users with filters based on query parameters
  @ApiOperation({ summary: 'Users' })
  @Get()
  @ApiBearerAuth()
  async list(@Query() allUserDto: AllUserDto) {
    return this.userLibService.all(allUserDto);
  }

  // Route to delete a user's account by ID
  @ApiOperation({ summary: 'Delete account' })
  @Delete(':id')
  @ApiBearerAuth()
  async deleteAccount(@Param('id') id: number) {
    return this.userLibService.delete(id);
  }

  // Route to get a user's information by ID
  @ApiOperation({ summary: 'User info' })
  @Get(':id')
  @ApiBearerAuth()
  async get(@Param('id') id: number) {
    return this.userLibService.get(id);
  }

  // Route to update a user's status by ID
  @ApiOperation({ summary: 'User status update' })
  @Get(':id/update-status')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number) {
    return this.userLibService.updateStatus(id);
  }
}
