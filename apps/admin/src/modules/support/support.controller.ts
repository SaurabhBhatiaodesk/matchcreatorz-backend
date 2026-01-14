// Import necessary modules, services, and DTOs
import { Controller, Get, Query} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';
import { ChatLibService } from '@app/chat-lib';
import {  ListSupportRequestDto } from '@app/chat-lib/dto';

// Define SupportController and set custom headers
@ApiTags('Support')
@Controller('support')
@CustomHeaders()
export class SupportController {
  constructor(private readonly chatLibService: ChatLibService) {}

  @ApiOperation({ summary: 'All Support request list' })
  @Get('get-support-list')
  @ApiBearerAuth()
  async getSupportList(@Query() listSupportDto: ListSupportRequestDto) {
    return this.chatLibService.getSupportList(listSupportDto);
  }
}
