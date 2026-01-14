import {  Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { Notification } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { ListUserDto } from './dto';

@Injectable()
export class NotificationLibService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    private readonly i18n: I18nService,
  ) {}


async getUserNotifications(listUserDto: ListUserDto, req: any): Promise<any> {
  const {
    pagination = true,
    skip = 0,
    limit = 10,
  } = listUserDto;
  const { user } = req;

  const query = this.notificationRepository
  .createQueryBuilder('notification')
  .leftJoin('notification.sender','user')
  .leftJoin('notification.receiver','receiver')
  .addSelect(['user.id', 'user.fullName', 'user.avatar', 'receiver.id', 'receiver.fullName', 'receiver.avatar'])  
  .where('notification.receiverId = :receiverId', { receiverId: user.id });

   query.orderBy('notification.created', 'DESC');
   
   // get count
   const total = await query.getCount();

   // if pagination then add skip and limit
   if (pagination) {
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit)
   }

   // get records
   const records = await query.getMany();

   const response = {
    total,
    records,
    totalPage : Math.ceil(total / limit),
    page : skip == 0 ? Number(skip) + 1 : Number(skip)
  };
   return new ResponseSuccess(this.i18n.t('test.NOTIFICATION.GET_NOTIFICATION'), response);
}

}
