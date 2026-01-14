import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import {
  User,
  Chat,
  ChatRequest,
  SupportRequest,
  Support,
  Admin,
} from 'common/models';
import { FcmService } from 'common/utils';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationStatus, NotificationType, RequestStatus, UserType, MessageType } from 'common/enums';
interface ConnectedUser {
  socketId: string;
  userId: number;
  user: any;
}

//  @WebSocketGateway()
@WebSocketGateway({
  cors: {
   /*  origin: [
      'http://localhost:7075',
      'http://192.168.0.16:7075',
      'https://konstantlab.com:3180'
    ], */
    origin: true,
    credentials: true,
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
  },
  allowEIO3: true,
})
export class SocketGateway {
  socketUser: any;
  constructor(
    private readonly fcmService: FcmService,
    private readonly socketService: SocketService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ChatRequest)
    private chatRequestRepository: Repository<ChatRequest>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(SupportRequest)
    private supportRequestRepository: Repository<SupportRequest>,
    @InjectRepository(Support) private supportRepository: Repository<Support>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private readonly i18n: I18nService,
  ) {}

  @WebSocketServer() server: Server;
  private connectedUsers: ConnectedUser[] = [];

  async handleConnection(client: any) {
    const { token }: any = client.handshake.query;
    // eslint-disable-next-line no-console
    console.log('connection:::::::');

    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }

    const { success, user }: any = await this.socketService.authUser(token);
    if (success && user?.id) {
      user.isOnline = true;
      await this.userRepository.save(user);
      client.join(user.id);
      this.socketUser = user;

      this.connectedUsers.push({
        socketId: client.id,
        userId: user.id,
        user: user,
      });
    }
  }

  async handleDisconnect(client: any) {
    // eslint-disable-next-line no-console
    console.log('disconnect:::::::');
    const user = this.connectedUsers.find(
      (user) => user.socketId === client.id,
    );
    if (user) {
      const userData = await this.userRepository.findOne({
        where: {
          id: user.userId,
        },
      });
      userData.isOnline = false;
      await this.userRepository.save(userData);
    }
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.socketId !== client.id,
    );
  }

  @SubscribeMessage('chatList')
  async userList(@MessageBody() data: any): Promise<any> {
    if (typeof data == 'string') { 
      data = JSON.parse(data) 
    }
    const { token, page = 1, limit = 10, searchTerm = '' } = data; 
    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }
    const { success, user, message }: any = await this.socketService.authUser(token);
    if (!success) {
      return {success: false, message}
    }  
    const query = this.chatRequestRepository
      .createQueryBuilder('chat-request')
      .leftJoin('chat-request.buyer', 'buyer')
      .addSelect(['buyer.id', 'buyer.fullName', 'buyer.avatar'])
      .leftJoin('chat-request.seller', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatar'])
      .leftJoin('chat-request.chats', 'chat')
      .addSelect(['chat.id', 'chat.senderType', 'chat.receiverType', 'chat.message', 'chat.messageType', 'chat.created', 'chat.isRead', 'chat.isDeleted', 'chat.isDeletedBySeller', 'chat.isDeletedByBuyer'])
      .where('chat-request.status = :status', { status: 'Accept' })
      .andWhere('chat-request.isDeleted = :isDeleted', { isDeleted: false });

    const userType= user.type;  
    if (userType === 'SELLER') {
      query.andWhere('chat-request.sellerId = :sellerId', { sellerId: user.id }); 
      query.andWhere('chat-request.isDeletedBySeller = :isDeletedBySeller', {
        isDeletedBySeller: false,
      });
    } else {
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
    const perPage = page == 0 ? Number(page) + 1 : Number(page);
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
    return { success: true, data: {total, records, hasMore: records.length === limit }};
  }

  getConnectedUsers(): ConnectedUser[] {
    return this.connectedUsers;
  }

  @SubscribeMessage('chatInit')
  async chatInit(@MessageBody() data:any):Promise<any>{
      if (typeof data == 'string') { 
        data = JSON.parse(data) 
      }
      const { token, senderId } = data

      if (!token || token === 'undefined') {
        return { success: false, message: "token rquired" };
      }
      const { success, user, message }: any = await this.socketService.authUser(token);
      if (!success) {
        return {success: false, message}
      }  
      const sender =  await this.userRepository.findOne({
        where: {
          id: senderId,
          isDeleted:false
        },
      });
      const senderInfo = {
        id: sender?.id,
        fullName:sender?.fullName,
        avatar: sender?.avatar,
        isOnline:sender?.isOnline
      }

      // for get chat request id
      const requestInfo = await this.chatRequestRepository.findOne({
        where: [
          {isDeleted: false, sellerId: user.id, buyerId: senderId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
          {isDeleted: false, buyerId: user.id, sellerId: senderId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
        ],
      });

      if (!requestInfo) {
        return { success: false, data: {}, message:'Chat Request not found' };
      } 

      const page=1;
      const limit=10;
      const limitRec = limit || 10
      const skipPage = (page - 1) * limitRec;
      let query = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.buyer', 'buyer')
      .addSelect(['buyer.id', 'buyer.fullName', 'buyer.avatar'])
      .leftJoin('chat.seller', 'seller')
      .addSelect(['seller.id', 'seller.fullName', 'seller.avatar'])
      .leftJoinAndSelect('chat.offer', 'offer')
      .andWhere('chat.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('chat.created', 'DESC');

      if (user?.type === 'SELLER') {
        query.andWhere('chat.sellerId = :sellerId', {
          sellerId: user.id,
        });
        query.andWhere('chat.buyerId = :buyerId', {
          buyerId: senderId,
        });
        query.andWhere('chat.isDeletedBySeller = :isDeletedBySeller', {
          isDeletedBySeller: false,
        });
      } else {
        query.andWhere('chat.buyerId = :buyerId', {
          buyerId: user.id,
        });
        query.andWhere('chat.sellerId = :sellerId', {
          sellerId: senderId,
        });
        query.andWhere('chat.isDeletedByBuyer = :isDeletedByBuyer', {
          isDeletedByBuyer: false,
        });
      }
  
      // if pagination then add skip and limit
      query = query.offset(skipPage).limit(limit);

      // get records
      const records = await query.getMany();

      // Read all message
      if (user?.type === 'SELLER') {
        const updateReadQuey = {isRead:false, buyerId:senderId, sellerId:user.id, receiverType:user.type}
        await this.chatRepository.update(updateReadQuey, { isRead: true });
      }else{
        const updateReadQuey = {isRead:false, buyerId:user.id, sellerId:senderId, receiverType:user.type}
        await this.chatRepository.update(updateReadQuey, { isRead: true });
      }

      return { success: true, data:{ messages:records, senderInfo, chatRequestId:requestInfo.id, hasMore: records.length === limit }, message: "Get chat init" }

  }

  @SubscribeMessage('chatHistory')
  async chatHistory(@MessageBody() data:any):Promise<any>{
      if (typeof data == 'string') { 
        data = JSON.parse(data) 
      }
      const {token, page=1, limit=10, senderId } = data

      if (!token || token === 'undefined') {
        return { success: false, message: "token rquired" };
      }
      const { success, user, message }: any = await this.socketService.authUser(token);
      if (!success) {
        return {success: false, message}
      }  
      const sender =  await this.userRepository.findOne({
        where: {
          id: senderId,
          isDeleted:false
        },
      });
      const senderInfo = {
        id: sender?.id,
        fullName:sender?.fullName,
        avatar: sender?.avatar,
        isOnline:sender?.isOnline
      }

      // for get chat request id
      const requestInfo = await this.chatRequestRepository.findOne({
        where: [
          {isDeleted: false, sellerId: user.id, buyerId: senderId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
          {isDeleted: false, buyerId: user.id, sellerId: senderId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
        ],
      });

      if (!requestInfo) {
        return { success: false, data: {}, message:'Chat Request not found' };
      } 
      
      const limitRec = limit || 10
      const skipPage = (page - 1) * limitRec
      let query = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.buyer', 'buyer')
      .addSelect(['buyer.id', 'buyer.fullName', 'buyer.avatar'])
      .leftJoin('chat.seller', 'seller')
      .addSelect(['seller.id', 'seller.fullName', 'seller.avatar'])
      .leftJoinAndSelect('chat.offer', 'offer')
      .andWhere('chat.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('chat.created', 'DESC');

      if (user?.type === 'SELLER') {
        query.andWhere('chat.sellerId = :sellerId', {
          sellerId: user.id,
        });
        query.andWhere('chat.buyerId = :buyerId', {
          buyerId: senderId,
        });
        query.andWhere('chat.isDeletedBySeller = :isDeletedBySeller', {
          isDeletedBySeller: false,
        });
      } else {
        query.andWhere('chat.buyerId = :buyerId', {
          buyerId: user.id,
        });
        query.andWhere('chat.sellerId = :sellerId', {
          sellerId: senderId,
        });
        query.andWhere('chat.isDeletedByBuyer = :isDeletedByBuyer', {
          isDeletedByBuyer: false,
        });
      }

      // if pagination then add skip and limit
      query = query.offset(skipPage).limit(limit);

      // get records
      const records = await query.getMany();

      // Read all message
      if (user?.type === 'SELLER') {
        const updateReadQuey = {isRead:false, buyerId:senderId, sellerId:user.id, receiverType:user.type}
        await this.chatRepository.update(updateReadQuey, { isRead: true });
      }else{
        const updateReadQuey = {isRead:false, buyerId:user.id, sellerId:senderId, receiverType:user.type}
        await this.chatRepository.update(updateReadQuey, { isRead: true });
      }
      return { success: true, data:{ messages:records, senderInfo, chatRequestId:requestInfo.id, chatRequestStatus:requestInfo.status, hasMore: records.length === limit }, message: "Get History" }

  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket,@MessageBody() data: any): Promise<any> {
    if (typeof data == 'string') { 
      data = JSON.parse(data) 
    }
    const { token, messageTo, messageValue, messageType } = data;
    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }

    const { success, user, message }: any = await this.socketService.authUser(token);
    if (!success) {
      return {success: false, message}
    }

    const conversation:any = await this.chatRequestRepository.findOne({
      where: [
        { status: RequestStatus.ACCEPT, buyerId: messageTo, sellerId: user.id },
        { status: RequestStatus.ACCEPT, buyerId: user.id, sellerId: messageTo },
      ],
    });
   
    if (!conversation) {
      return { success: false, data: {}, message:'Chat Request not found' };
    } 

   
    let buyerId: any;
    let sellerId: any;
    let senderType: any;
    let receiverType: any;

    if (user?.type === 'SELLER') {
      sellerId = user.id;
      buyerId = messageTo;
      senderType = UserType.SELLER;
      receiverType = UserType.BUYER;

      // send push to user for new chat from seller
      const userInfo = await this.userRepository.findOne({ where : { id : messageTo, isDeleted : false, isSuspended:false }})
      await this.fcmService.saveNotification({
        deviceToken : userInfo?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.NEW_CHAT_FROM_SELLER'),
        description : `New message from ${user?.fullName} : ${(messageType === MessageType.IMAGE) ?  "New Image" :  (messageType === MessageType.DOCUMENT) ? "New Document"  : messageValue}`,    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : messageTo,
        senderId : user?.id,
        senderType: user.type,
        receiverType: UserType.BUYER,
        status:NotificationStatus.CHAT,
        metaData : {
          type : NotificationStatus.CHAT,
          userId : messageTo,
          senderId : user?.id,
          receiverId : messageTo
        },
      })

    } else {
      sellerId = messageTo;
      buyerId = user.id;
      senderType = UserType.BUYER;
      receiverType = UserType.SELLER;

      // send push to user for new chat from seller
      const userInfo = await this.userRepository.findOne({ where : { id : messageTo, isDeleted : false, isSuspended:false }})
      await this.fcmService.saveNotification({
        deviceToken : userInfo?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.NEW_CHAT_FROM_BUYER'),
        description : `New message from ${user?.fullName} : ${(messageType === MessageType.IMAGE) ?  "New Image" :  (messageType === MessageType.DOCUMENT) ? "New Document"  : messageValue}`,    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : messageTo,
        senderId : user?.id,
        senderType: user.type,
        receiverType: UserType.SELLER,
        status:NotificationStatus.CHAT,
        metaData : {
          type : NotificationStatus.CHAT,
          userId : messageTo,
          senderId : user?.id,
          receiverId : messageTo
        },
      })
    }

      const chatData = new Chat();
      chatData.buyerId = buyerId;
      chatData.sellerId = sellerId;
      chatData.message = messageValue;
      chatData.messageType = messageType;
      chatData.senderType = senderType;
      chatData.receiverType = receiverType;
      chatData.chatRequestId = conversation.id;
      await this.chatRepository.save(chatData);

      conversation.latestMessage = messageValue;
      conversation.messageType = messageType;
      conversation.isDeletedByBuyer = false;
      conversation.isDeletedBySeller = false;
      await this.chatRequestRepository.save(conversation);

      const response = {
        chatId:chatData.id,
        message:messageValue,
        messageType,
        buyerId,
        sellerId,
        senderType,
        receiverType,
        created:chatData.created,
        sender: {
          id:user.id,
          fullName: user.fullName,
          avatar:user.avatar,
          userType:user.type
        },
      };
      this.server.to(messageTo).emit("new-message", response);
      return { success: true, data: response,  message: "Message sent succesfully" };
 
  }

  @SubscribeMessage('readChat')
  async readChat(client: Socket,@MessageBody() data: any): Promise<any> {
    if (typeof data == 'string') { 
      data = JSON.parse(data) 
    }
    const { token, senderId } = data;
    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }

    const { success, user, message }: any = await this.socketService.authUser(token);
    if (!success) {
      return {success: false, message}
    }

    const sender =  await this.userRepository.findOne({
      where: {
        id: senderId,
        isDeleted:false
      },
    });

    const senderInfo = {
      id: sender?.id,
      fullName:sender?.fullName,
      avatar: sender?.avatar,
      isOnline:sender?.isOnline
    }

    if (user?.type === 'SELLER') {
      const updateReadQuey = {isRead:false, buyerId:senderId, sellerId:user.id, receiverType:user.type}
      await this.chatRepository.update(updateReadQuey, { isRead: true });
    }else{
      const updateReadQuey = {isRead:false, buyerId:user.id, sellerId:senderId, receiverType:user.type}
      await this.chatRepository.update(updateReadQuey, { isRead: true });
    }
    // Response
    return { success: true, data:{ messages:{}, senderInfo, hasMore:false }, message: "Chat read succesfully" }
  }

  @SubscribeMessage('clearChat')
  async clearChat(client: Socket,@MessageBody() data: any): Promise<any> {
    if (typeof data == 'string') { 
      data = JSON.parse(data) 
    }
    const { token, senderId } = data;
    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }

    const { success, user, message }: any = await this.socketService.authUser(token);
    if (!success) {
      return {success: false, message}
    }

    const sender =  await this.userRepository.findOne({
      where: {
        id: senderId,
        isDeleted:false
      },
    });

    const senderInfo = {
      id: sender?.id,
      fullName:sender?.fullName,
      avatar: sender?.avatar,
      isOnline:sender?.isOnline
    }

    if (user?.type === 'SELLER') {
      const updateReadQuey = {isDeletedBySeller:false, buyerId:senderId, sellerId:user.id}
      await this.chatRepository.update(updateReadQuey, { isDeletedBySeller: true });
    }else{
      const updateReadQuey = {isDeletedByBuyer:false, buyerId:user.id, sellerId:senderId}
      await this.chatRepository.update(updateReadQuey, { isDeletedByBuyer: true });
    }
    // Response
    return { success: true, data:{ messages:{}, senderInfo, hasMore:false }, message: "Chat cleared succesfully" }
  }

  @SubscribeMessage('supportHistory')
  async supportHistory(@MessageBody() data:any):Promise<any>{
      if (typeof data == 'string') { 
        data = JSON.parse(data) 
      }
      const {token, page=1, limit=10, senderId, userType } = data
      if (!token || token === 'undefined') {
        return { success: false, message: "token rquired" };
      }
      const { success, user, message }: any = await this.socketService.authUserAdmin(token, userType);
      if (!success) {
        return {success: false, message}
      } 
      let sender:any;
      if(userType === 'ADMIN'){
        sender =  await this.userRepository.findOne({
          where: {
            id: senderId,
            isDeleted:false
          },
        });
      }else{
        sender =  await this.adminRepository.findOne({
          where: {
            id: senderId,
            isDeleted:false
          },
        });
      }
      
      const senderInfo = {
        id: sender?.id,
        fullName:sender?.fullName,
        avatar: sender?.avatar
      }

      const limitRec = limit || 10
      const skipPage = (page - 1) * limitRec
      const query = this.supportRepository
      .createQueryBuilder('support')
      .leftJoin('support.user', 'user')
      .addSelect(['user.id', 'user.fullName', 'user.avatar'])
      .leftJoin('support.admin', 'admin')
      .addSelect(['admin.id', 'admin.fullName', 'admin.avatar'])
      .andWhere('support.isDeleted = :isDeleted', { isDeleted: false })
      

      if (userType === 'ADMIN') {
        query.andWhere('support.adminId = :adminId', {
          adminId: user.id,
        });
        query.andWhere('support.userId = :userId', {
          userId: senderId,
        });
      } else {
        query.andWhere('support.userId = :userId', {
          userId: user.id,
        });
        query.andWhere('support.adminId = :adminId', {
          adminId: senderId,
        });
      }

      // order by 
      query.orderBy('support.created', 'DESC');

      // if pagination then add skip and limit
      query.offset(skipPage).limit(limit);

      // get records
      const records = await query.getMany();

      // Read all message
      if (userType === 'ADMIN') {
        const updateReadQuey = {isRead:false, userId:senderId, adminId:user.id, receiverType:UserType.ADMIN}
        await this.supportRepository.update(updateReadQuey, { isRead: true });
      }else{
        const updateReadQuey = {isRead:false, userId:user.id, adminId:senderId, receiverType:user.type}
        await this.supportRepository.update(updateReadQuey, { isRead: true });
      }
      return { success: true, data:{ messages:records, senderInfo, hasMore: records.length === limit }, message: "Get History" }
  }

  @SubscribeMessage('sendSupport')
  async sendSupport(client: Socket,@MessageBody() data: any): Promise<any> {
    if (typeof data == 'string') { 
      data = JSON.parse(data) 
    }
    const { token, messageTo, messageValue, messageType, userType } = data;
    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }
    const { success, user, message }: any = await this.socketService.authUserAdmin(token, userType);
    if (!success) {
      return {success: false, message}
    }

    let conversation:any = await this.supportRequestRepository.findOne({
      where: [
        { userId: messageTo, adminId: user.id },
        { userId: user.id, adminId: messageTo },
      ],
    });

    if (conversation) {
      conversation.latestMessage = messageValue;
      conversation.messageType = messageType;
      await this.supportRequestRepository.save(conversation);
    }else{
      conversation = new SupportRequest();
      if(userType === 'ADMIN'){
        conversation.adminId = user.id;
        conversation.userId = messageTo;
      }else{
        conversation.adminId = messageTo;
        conversation.userId = user.id;
      }
      conversation.latestMessage = messageValue;
      conversation.messageType = messageType;
      await this.supportRequestRepository.save(conversation);
    } 

   
    let userId: any;
    let adminId: any;
    let senderType: any;
    let receiverType: any;
    let userInfo: any;
    if (userType === 'ADMIN') {
      adminId = user.id;
      userId = messageTo;
      //send push to user for new chat from admin
      userInfo = await this.userRepository.findOne({ where : { id : messageTo, isDeleted : false, isSuspended:false }})

      // Sender  & Receiver
      senderType = UserType.ADMIN;
      receiverType = userInfo?.type;

      // Send Push
      await this.fcmService.saveNotification({
        deviceToken : userInfo?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.NEW_CHAT'),
        description : `New message from admin : ${messageValue}`,    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : messageTo,
        senderId : user?.id,
        senderType: UserType.ADMIN,
        receiverType: userInfo?.type,
        status:NotificationStatus.CHAT,
        metaData : {
          type : NotificationStatus.CHAT,
          userId : messageTo
        },
      })

    } else {
      adminId = messageTo;
      userId = user.id;
      senderType = user.type;
      receiverType = UserType.ADMIN;
      // Send Push to Admin
      await this.fcmService.saveNotification({
        deviceToken : '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.NEW_SUPPORT_CHAT'),
        description : `New message from ${userType} `,    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : messageTo,
        senderId :userId,
        senderType:user.type,
        receiverType:UserType.ADMIN,
        status:NotificationStatus.SUPPORT,
        metaData : {
          type : NotificationStatus.SUPPORT,
          userId : messageTo
        },
      })
    }
      const chatData = new Support();
      chatData.userId = userId;
      chatData.adminId = adminId;
      chatData.message = messageValue;
      chatData.messageType = messageType;
      chatData.senderType = senderType;
      chatData.receiverType = receiverType ?? userInfo.type;;
      chatData.supportRequestId = conversation.id;
      await this.supportRepository.save(chatData);

      const response = {
        chatId:chatData.id,
        message:messageValue,
        messageType,
        userId,
        adminId,
        senderType,
        receiverType: receiverType ?? userInfo.type,
        created:chatData.created,
        sender: {
          id:user.id,
          fullName: user.fullName,
          avatar:user.avatar,
          userType:user?.type ? user.type : 'ADMIN'
        },
      };
      this.server.to(messageTo).emit("new-support", response);
      return { success: true, data: response,  message: "Message sent succesfully" };
 
  }

  @SubscribeMessage('sendListener')
  async sendListener(@MessageBody() data: any): Promise<any> {
    if (data.to) {
      const res = data.data;
      this.server.to(data.to).emit(data.listener, res);
    }
  }

  @SubscribeMessage('getUserList')
  async handlerUserList(@MessageBody() data: any): Promise<any> {
    if (typeof data == 'string') { 
      data = JSON.parse(data) 
    }
    const { token, userType, type,  page = 1, limit = 10, searchTerm = '' } = data;
    if (!token || token === 'undefined') {
      return { success: false, message: "token rquired" };
    }

    const { success, message }: any = await this.socketService.authUserAdmin(token, userType);
    if (!success) {
      return {success: false, message}
    }

    const query = await this.supportRequestRepository.createQueryBuilder('support-request')
    .leftJoin('support-request.user', 'user')
    .addSelect(['user.id', 'user.fullName', 'user.avatar', 'user.type'])
    .leftJoin('support-request.admin', 'admin')
    .addSelect(['admin.id', 'admin.fullName', 'admin.avatar'])
    .leftJoin('support-request.supports', 'support')
    .addSelect(['support.id', 'support.senderType', 'support.receiverType', 'support.message', 'support.messageType', 'support.created', 'support.isRead', 'support.isDeleted'])
    .where('support-request.isDeleted = :isDeleted', { isDeleted : false });

    if(type === 'SELLER'){
      query.andWhere('user.type = :type', { type:  UserType.SELLER}); 
    }else{
      query.andWhere('user.type = :type', { type:  UserType.BUYER}); 
    }

    // Add search functionality
    if (searchTerm) {
      query.andWhere('user.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    // get count
    const total = await query.getCount();

    // order by 
    query.orderBy('support-request.updated', 'DESC');

    // if pagination then add skip and limit
    const perPage = page == 0 ? Number(page) + 1 : Number(page);
    query.skip((perPage - 1) * limit).take(limit);

    // get records
    const records = await query.getMany();

    // Adding custom key 'unreadCount' to each record
    records.forEach(record => {
      const unreadCount = record.supports.filter(support => !support.isRead && support.receiverType === UserType.ADMIN).length;
      record.unreadCount = unreadCount;
      // Delete the chats array from the record
      delete record.supports;
    })
    
    const response = {
      total,
      records,
    };
    this.server.emit("userListResponse", response);
    return { success: true, data: response,  message: "Chat room updated" };
 
  }

}
