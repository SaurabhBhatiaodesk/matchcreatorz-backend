import { Module } from '@nestjs/common';
import { ChatLibService } from './chat-lib.service';

@Module({
  providers: [ChatLibService],
  exports: [ChatLibService],
})
export class ChatLibModule {}
