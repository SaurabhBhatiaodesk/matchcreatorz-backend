import { 
  WebSocketServer, 
} from '@nestjs/websockets';
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express'
import { ChatService } from './chat.service';
import { Public } from 'common/decorators';
import { ResponseService } from 'common/services/response.service';
import { SocketGateway } from './socket/socket.gateway';
@Controller()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly responseService: ResponseService,
    private readonly socketGateway: SocketGateway,
  ) {}
  @WebSocketServer() server: any;

  @Get()
  getHello(): string {
    return this.chatService.getHello();
  }

  @Public()
  @Post('/push')
  async pushEvents(
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    const { listener,receivers,data } = req.body;
    receivers.forEach( receiver=>{
      const params = {
        to: `${receiver}`,listener,data

      }
      this.socketGateway.sendListener(params)
    })
    this.responseService.sendSuccessResponse(res, {})
    
  }

  @Public()
  @Post('/sendListener')
  async listenerEvents(
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    const { listener,receiver,type, data } = req.body;
    const params = {
      to: receiver, listener, type, data
    }
    this.socketGateway.sendListener(params)
    this.responseService.sendSuccessResponse(res, {})
    
  }
}
