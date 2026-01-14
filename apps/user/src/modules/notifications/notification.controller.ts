import { NotificationLibService } from '@app/notification-lib';
import {
  ListUserDto,
} from '@app/user-lib/dto';
import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHeaders } from 'common/decorators';

@ApiTags('Notifications')
@Controller('notifications')
@CustomHeaders()
export class NotificationController {
  constructor(private readonly notifyLibService: NotificationLibService) {}

  @ApiOperation({ summary: 'Get User Notification' })
  @Get('get-user-notifications')
  @ApiBearerAuth()
  async getUserNotifications(@Query() listUserDto: ListUserDto,@Request() req: any) {
    return this.notifyLibService.getUserNotifications(listUserDto, req);
  }
}
