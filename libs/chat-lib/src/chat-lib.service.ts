import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { User, ChatRequest, Chat, SupportRequest } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository, In } from 'typeorm';
import { ListChatRequestDto, SendChatRequestDto, UpdateStatusDto, ListSupportRequestDto } from './dto';
import { MessageType, NotificationStatus, NotificationType, RequestStatus, UserType } from 'common/enums';
import { FcmService } from 'common/utils';

@Injectable()
export class ChatLibService {
  constructor(
    private readonly fcmService: FcmService,
    @InjectRepository(ChatRequest) private chatRequestRepository: Repository<ChatRequest>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(SupportRequest) private supportRequestRepository: Repository<SupportRequest>,
    private readonly i18n: I18nService,
  ) {}

  async getRequestList(listChatRequestDto: ListChatRequestDto, req: any): Promise<any> {
    const { user } = req; 
    const {
      skip = 0,
      limit = 10,
      searchTerm = ''
    } = listChatRequestDto;
    const query = await this.chatRequestRepository.createQueryBuilder('chat-request')
      .leftJoin('chat-request.buyer', 'buyer')
      .addSelect(['buyer.id', 'buyer.fullName', 'buyer.avatar'])
      .leftJoin('chat-request.seller', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatar'])
      .where('chat-request.status = :status', { status : 'Pending' })
      .andWhere('chat-request.isDeleted = :isDeleted', { isDeleted : false });

      const userType= req.headers['user-type'];
      if(userType === 'SELLER'){
        query.andWhere('chat-request.sellerId = :sellerId', { sellerId: user.id }); 
      }else{
        query.andWhere('chat-request.buyerId = :buyerId', { buyerId: user.id }); 
      }
      
    // Add search functionality
    if (searchTerm) {
      if(userType === 'SELLER'){
        query.andWhere('buyer.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
      }else{
        query.andWhere('user.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
      }
    }

    // get count
    const total = await query.getCount();

    // order by 
    query.orderBy('chat-request.updated', 'DESC');

    // if pagination then add skip and limit
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit);

    // get records
    const records = await query.getMany();

    const response = {
      total,
      records,
    };

    return new ResponseSuccess(this.i18n.t('test.CHAT.ALL_CHAT_REQUEST'), response);
  }

  async getChatList(listChatRequestDto: ListChatRequestDto, req: any): Promise<any> {
    const { user } = req; 
    const {
      skip = 0,
      limit = 10,
      searchTerm = ''
    } = listChatRequestDto;
    const query = await this.chatRequestRepository.createQueryBuilder('chat-request')
      .leftJoin('chat-request.buyer', 'buyer')
      .addSelect(['buyer.id', 'buyer.fullName', 'buyer.avatar'])
      .leftJoin('chat-request.seller', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatar'])
      .leftJoin('chat-request.chats', 'chat')
      .addSelect(['chat.id', 'chat.senderType', 'chat.receiverType', 'chat.message', 'chat.messageType', 'chat.created', 'chat.isRead', 'chat.isDeleted', 'chat.isDeletedBySeller', 'chat.isDeletedByBuyer'])
      .where('chat-request.status = :status', { status : 'Accept' })
      .andWhere('chat-request.isDeleted = :isDeleted', { isDeleted : false });

      const userType= user.type;
      if(userType === 'SELLER'){
        query.andWhere('chat-request.sellerId = :sellerId', { sellerId: user.id }); 
        query.andWhere('chat-request.isDeletedBySeller = :isDeletedBySeller', {
          isDeletedBySeller: false,
        });
      }else{
        query.andWhere('chat-request.buyerId = :buyerId', { buyerId: user.id }); 
        query.andWhere('chat-request.isDeletedByBuyer = :isDeletedByBuyer', {
          isDeletedByBuyer: false,
        });
      }
      
    // Add search functionality
    if (searchTerm) {
      if(userType === 'SELLER'){
        query.andWhere('buyer.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
      }else{
        query.andWhere('user.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
      }
    }

    // get count
    const total = await query.getCount();

    // order by 
    query.orderBy('chat-request.updated', 'DESC');

    // if pagination then add skip and limit
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit);
  
    // get records
    const records = await query.getMany();
    
    // Adding custom key 'unreadCount' to each record
    records.forEach(record => {
      const unreadCount = record.chats.filter(chat => !chat.isRead && chat.receiverType === userType).length;
      record.unreadCount = unreadCount;

      // latest Message count
      const latestMessageCount = record.chats.filter(chat => {
        if (userType === 'SELLER') {
            return !chat.isDeletedBySeller;
        } else {
            return !chat.isDeletedByBuyer;
        }
      }).length;
      record.latestMessageCount = latestMessageCount;
      // Delete the chats array from the record
      delete record.chats;
    });

    const response = {
      total,
      records,
    };

    return new ResponseSuccess(this.i18n.t('test.CHAT.ALL_CHAT_REQUEST'), response);
  }


  async updateStatus(id: number, updateStatusDto:UpdateStatusDto, req:any): Promise<any> {
    const {
      status = ''
    } = updateStatusDto;
    const { user } = req; 
    const requesttData = await this.chatRequestRepository.findOne({
      where: {
        id,
      },
      relations:{
        buyer : true,
        seller : true
      }
    });

    if (!requesttData) {
      throw new BadRequestException(this.i18n.t('test.CHAT.REQUEST_NOT_FOUND'));
    }

    if (requesttData.status !== 'Pending') {
       throw new BadRequestException(this.i18n.t('test.CHAT.STATUS_UPDATED_ALREADY'));
    }

    if (status === 'Accept') {
      requesttData.status = RequestStatus.ACCEPT;

      await this.fcmService.saveNotification({
        deviceToken : requesttData?.buyer?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.ACCEPTE_MESSAGE_REQ'),
        description : this.i18n.t('test.NOTIFICATION.MESSAGE_REQUEST_ACCEPT'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : requesttData?.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: requesttData.buyer.type,
        metaData : {
          // type : NotificationStatus.REQUEST,
          type : NotificationStatus.CHAT,
          id : id,
          userId : requesttData?.buyerId
        },
      })

    }else{
      requesttData.status = RequestStatus.REJECT;

      await this.fcmService.saveNotification({
        deviceToken : requesttData?.seller?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.REJECTE_MESSAGE_REQ'),
        description : this.i18n.t('test.NOTIFICATION.MESSAGE_REQUEST_REJECT'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : requesttData?.sellerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: requesttData.seller.type,
        metaData : {
          type : NotificationStatus.REQUEST,
          id : id,
          userId : requesttData?.sellerId
        },
      })
    }
    await this.chatRequestRepository.save(requesttData);
    return new ResponseSuccess(this.i18n.t('test.CHAT.STATUS_UPDATED'), {
      record: requesttData,
    });
  }

  async withDrawRequest(id: number, req: any): Promise<any> {
    const { user } = req; 
    const requesttData = await this.chatRequestRepository.findOne({
      where: {
        id,
        buyerId:user.id
      },
    });

    if (!requesttData) {
      throw new BadRequestException(this.i18n.t('test.CHAT.REQUEST_NOT_FOUND'));
    }

    if (requesttData.status !== 'Pending') {
       throw new BadRequestException(this.i18n.t('test.CHAT.STATUS_UPDATED_ALREADY'));
    }
    requesttData.status = RequestStatus.WITHDRAW;
    requesttData.isSuspended = true;
    requesttData.isDeleted = true;
    await this.chatRequestRepository.save(requesttData);
    // delete chat request data
    const updateReadQuey = {
      chatRequestId:id,
      buyerId:user.id
    }
    await this.chatRepository.update(updateReadQuey, { 
        isDeletedBySeller: true,
        isDeletedByBuyer: true,
        isDeleted:true });
    return new ResponseSuccess(this.i18n.t('test.CHAT.WITHDRAW_UPDATED'));
  }

  async deleteChatList(id: number, req: any): Promise<any> {
    const { user } = req; 
    const requesttData = await this.chatRequestRepository.findOne({
      where: [
        { id, sellerId: user.id },
        { id, buyerId: user.id, },
      ],
    });

    if (!requesttData) {
      throw new BadRequestException(this.i18n.t('test.CHAT.REQUEST_NOT_FOUND'));
    }

    if (user?.type === 'SELLER') {
      requesttData.isDeletedBySeller = true;
      await this.chatRequestRepository.save(requesttData);
      const updateReadQuey = {isDeletedBySeller:false, buyerId:requesttData.buyerId, sellerId:user.id}
      await this.chatRepository.update(updateReadQuey, { isDeletedBySeller: true });
    }else{
      requesttData.isDeletedByBuyer = true;
      await this.chatRequestRepository.save(requesttData);
      const updateReadQuey = {isDeletedByBuyer:false, buyerId:user.id, sellerId:requesttData.sellerId}
      await this.chatRepository.update(updateReadQuey, { isDeletedByBuyer: true });
    }
   
    return new ResponseSuccess(this.i18n.t('test.CHAT.CHAT_DELETED'));
  }

  async sendChatRequest(
    sendChatRequestDto: SendChatRequestDto,
    req: any,
  ): Promise<any> {
    const { user } = req; 

    const { sellerId, message } = sendChatRequestDto;

    const seller = await this.userRepository.findOne({
      where: {
        id: sellerId,
        isDeleted: false
      },
    });
    if(!seller){
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    if(seller.type !== 'SELLER'){
      throw new BadRequestException(this.i18n.t('test.CHAT.REQUEST_SENT_ONLY'));
    }

    const requestData = await this.chatRequestRepository.findOne({
      where: {
        buyerId: user.id,
        sellerId: seller.id,
        status:In([RequestStatus.PENDING, RequestStatus.ACCEPT]),
        isDeleted: false
      },
    });
    if(requestData){
      throw new BadRequestException(this.i18n.t('test.CHAT.REQUEST_ALREADY_SENT'));
    }
    
    // Save chat rquest
    const request = new ChatRequest();
    request.buyer = user;
    request.seller = seller;
    request.latestMessage = message;
    request.messageType = MessageType.TEXT;
    await this.chatRequestRepository.save(request);

    // save in chat
    const chatData = new Chat();
    chatData.buyer = user;
    chatData.seller = seller;
    chatData.chatRequestId = request.id;
    chatData.message = message;
    chatData.messageType = MessageType.TEXT;
    chatData.senderType = UserType.BUYER;
    chatData.receiverType = UserType.SELLER;
    await this.chatRepository.save(chatData);

    await this.fcmService.saveNotification({
      deviceToken : seller?.deviceToken ?? '',
      deviceType : '',
      title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.NEW_MESSAGE'),
      description : this.i18n.t('test.NOTIFICATION.NEW_MESSAGE'),    
      type : NotificationType.SYSTEM_GENERATED,
      recieverId : seller?.id,
      senderId : user?.id,
      senderType: user.type,
      receiverType: seller.type,
      metaData : {
        // type : NotificationStatus.CHAT,
        type : NotificationStatus.REQUEST,
        userId : seller?.id
      },
      
    })

    return new ResponseSuccess(this.i18n.t('test.CHAT.REQUEST_SENT'));
  }

  async getSupportList(listSupportRequestDto: ListSupportRequestDto): Promise<any> {
    const {
      skip = 0,
      limit = 10,
      userType,
      searchTerm = ''
    } = listSupportRequestDto;
    const query = await this.supportRequestRepository.createQueryBuilder('support-request')
      .leftJoin('support-request.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatar', 'user.type'])
      .leftJoin('support-request.admin', 'admin')
      .addSelect(['admin.id', 'admin.fullName', 'admin.avatar'])
      .leftJoin('support-request.supports', 'support')
      .addSelect(['support.id', 'support.senderType', 'support.receiverType', 'support.message', 'support.messageType', 'support.created', 'support.isRead', 'support.isDeleted'])
      .where('support-request.isDeleted = :isDeleted', { isDeleted : false });

      if(userType === 'SELLER'){
        query.andWhere('user.type = :type', { type:  UserType.SELLER}); 
      }else{
        query.andWhere('user.type = :type', { type:  UserType.BUYER}); 
      }
      
    // Add search functionality
    if (searchTerm) {
      query.andWhere('user.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    // order by 
    query.orderBy('support-request.updated', 'DESC');

    // get count
    const total = await query.getCount();

    // if pagination then add skip and limit
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit);
  
    // get records
    const records = await query.getMany();

    // Adding custom key 'unreadCount' to each record
    records.forEach(record => {
      const unreadCount = record.supports.filter(support => !support.isRead && support.receiverType === UserType.ADMIN).length;
      record.unreadCount = unreadCount;
      // Delete the chats array from the record
      delete record.supports;
    });

    const response = {
      total,
      records,
    };
    return new ResponseSuccess(this.i18n.t('test.SUPPORT.ALL_CHAT_REQUEST'), response);
  }

}
