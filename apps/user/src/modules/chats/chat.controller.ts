import { ChatLibService } from '@app/chat-lib';
import {
  ListChatRequestDto , SendChatRequestDto, UpdateStatusDto
} from '@app/chat-lib/dto';
import { Controller, Get, Param, Query, Request, Body, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';

@ApiTags('Chat')
@Controller('chat')
@CustomHeaders()
export class ChatController {
  constructor(private readonly chatLibService: ChatLibService) {}

  @ApiOperation({ summary: 'Send chat request' })
  @Post('send-chat-request')
  @ApiBearerAuth()
  async sendRequest(
    @Body() sendChatRequestDto: SendChatRequestDto,
    @Request() req: any,
  ) {
    return this.chatLibService.sendChatRequest(sendChatRequestDto, req);
  }

  @ApiOperation({ summary: 'All Chat request list' })
  @Get('get-chat-request')
  @ApiBearerAuth()
  async getRequest(@Query() listServiceDto: ListChatRequestDto, @Request() req: any) {
    return this.chatLibService.getRequestList(listServiceDto, req);
  }

  @ApiOperation({ summary: 'All Chat request list' })
  @Get('get-chat-list')
  @ApiBearerAuth()
  async getChatList(@Query() listServiceDto: ListChatRequestDto, @Request() req: any) {
    return this.chatLibService.getChatList(listServiceDto, req);
  }

  @ApiOperation({ summary: 'Chat Request status update' })
  @Get('update-status/:id')
  @ApiBearerAuth()
  async updateStatus(@Param('id') id: number, @Query() updateStatusDto: UpdateStatusDto, @Request() req: any) {
    return this.chatLibService.updateStatus(id, updateStatusDto, req);
  }

  @ApiOperation({ summary: 'Chat Request withdraw' })
  @Get('withdraw-chat-request/:id')
  @ApiBearerAuth()
  async withDrawRequest(@Param('id') id: number, @Request() req: any) {
    return this.chatLibService.withDrawRequest(id, req);
  }

  @ApiOperation({ summary: 'Delete Chat' })
  @Delete('delete-chat-list/:id')
  @ApiBearerAuth()
  async deleteChatList(@Param('id') id: number, @Request() req: any) {
    return this.chatLibService.deleteChatList(id, req);
  }

  

}