import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import {
  User,
  Country,
  Category,
  Tag,
  AdminSetting,
  Offer,
  OfferDocument,
  OfferImage,
  Chat,
  ChatRequest,
  Booking,
} from 'common/models';
import { callSocketApi } from 'common/utils';
import { I18nService } from 'nestjs-i18n';
import { Repository, In } from 'typeorm';
import { AddUpdateOfferDto, CounterOfferDto, UpdateStatusDto } from './dto';
import {
  FileType,
  NotificationType,
  MessageType,
  OfferStatus,
  RequestStatus,
  UserType,
  PaymentStatus,
  NotificationStatus,
} from 'common/enums';
import { FcmService } from 'common/utils';
import { BookingsLibService } from '@app/booking-lib';
@Injectable()
export class OfferLibService {
  constructor(
    private readonly bookingLibService: BookingsLibService,
    private readonly fcmService: FcmService,
    @InjectRepository(Offer) private offerRepository: Repository<Offer>,
    @InjectRepository(Country) private countryRepository: Repository<Country>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AdminSetting)
    private adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(ChatRequest)
    private chatRequestRepository: Repository<ChatRequest>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private readonly i18n: I18nService,
  ) {}

  async getOffer(id: number): Promise<any> {
    const offerData = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.buyer', 'user')
      .addSelect([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.city',
        'user.state',
        'user.country',
        'user.category',
        'user.avgRating',
      ])
      .leftJoin('user.category', 'userCategory')
      .addSelect(['userCategory.id', 'userCategory.title'])
      .leftJoin('user.state', 'userState')
      .addSelect(['userState.id', 'userState.stateName'])
      .leftJoin('user.country', 'userCountry')
      .addSelect(['userCountry.id', 'userCountry.countryName'])
      .leftJoin('offer.seller', 'seller')
      .addSelect([
        'seller.id',
        'seller.fullName',
        'seller.avatar',
        'seller.city',
        'seller.state',
        'seller.country',
        'seller.category',
        'seller.avgRating',
      ])
      .leftJoin('seller.category', 'sellerCategory')
      .addSelect(['sellerCategory.id', 'sellerCategory.title'])
      .leftJoin('seller.state', 'sellerState')
      .addSelect(['sellerState.id', 'sellerState.stateName'])
      .leftJoin('seller.country', 'sellerCountry')
      .addSelect(['sellerCountry.id', 'sellerCountry.countryName'])
      .leftJoinAndSelect('offer.offerDocument', 'document')
      .leftJoinAndSelect('offer.offerImage', 'offer_image')
      .leftJoinAndSelect('offer.category', 'category')
      .leftJoinAndSelect('offer.country', 'country')
      .leftJoin('offer.tags', 'tags')
      .addSelect(['tags.id', 'tags.name'])
      .andWhere('offer.id = :id', { id: id })
      .andWhere('offer.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!offerData) {
      throw new BadRequestException(this.i18n.t('test.OFFER.NOT_FOUND'));
    }

    const getBooking = await this.bookingRepository.findOne({ where : {
      offerId : id,
      isDeleted : false,
      isSuspended: false
    }})

    const result = {
      ...offerData,
      bookingId : getBooking?.id
    };
    return new ResponseSuccess(this.i18n.t('test.SERVICE.INFO'), result);
  }

  async updateStatus(id: number, updateStatusDto:UpdateStatusDto, req:any): Promise<any> {
    const {
      status = ''
    } = updateStatusDto;
    const { user } = req;
    const offerData = await this.offerRepository.findOne({
      where: {
        id,
      },
      relations : {
        buyer : true,
        seller : true
      }
    });

    if (!offerData) {
      throw new BadRequestException(this.i18n.t('test.OFFER.NOT_FOUND'));
    }

    if (offerData.status !== 'Pending') {
      throw new BadRequestException(
        this.i18n.t('test.OFFER.STATUS_UPDATED_ALREADY'),
      );
    }

    if (status === 'Accepted') {
      offerData.status = OfferStatus.ACCEPTED;
      
      const adminSetting = await this.adminSettingRepository.findOne({
        where: { isDeleted: false },
      });
      let platformFee = 0; // default
      if (adminSetting?.platformFee) {
        platformFee = adminSetting.platformFee;
      }

      if(user.type === 'BUYER'){
        offerData.paymentStatus = PaymentStatus.PAID;
        await this.bookingLibService.createBookingFromOffer(user, offerData.id, platformFee);
      }
      await this.fcmService.saveNotification({
        deviceToken :  user.type === 'BUYER' ? offerData?.seller?.deviceToken ?? '' : offerData?.buyer?.deviceToken ?? '',
        deviceType : '',
        title : (status === 'Accepted') ? this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_ACCEPTED') : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_REJECTED'),
        description : (status === 'Accepted') ? this.i18n.t('test.NOTIFICATION.ACCEPT_BID') : this.i18n.t('test.NOTIFICATION.REJECT_BID'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : user.type === 'BUYER' ? offerData.sellerId : offerData.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: user.type === 'BUYER' ? offerData.seller.type : offerData.buyer.type,
        metaData : {
          type : NotificationStatus.BID,
          buyerId : offerData.buyerId,
          sellerId : offerData.sellerId,
          offerId : offerData.id
        },
      })

      await this.fcmService.saveNotification({
        deviceToken :  user.type === 'BUYER' ? offerData?.seller?.deviceToken ?? '' : offerData?.buyer?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.OFFER_ACCEPTED'),
        description : this.i18n.t('test.NOTIFICATION.SELLER_ACCEPT_OFFER'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : user.type === 'BUYER' ? offerData.sellerId : offerData.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: user.type === 'BUYER' ? offerData.seller.type : offerData.buyer.type,
        metaData : {
          type : NotificationStatus.OFFER,
          buyerId : offerData.buyerId,
          sellerId : offerData.sellerId,
          offerId : offerData.id
        },
      })
    } else if (status === 'WithDrawn') {
      offerData.status = OfferStatus.WithDrawn;
    } else {
      offerData.status = OfferStatus.REJECTED;

      await this.fcmService.saveNotification({
        deviceToken :  user.type === 'BUYER' ? offerData?.seller?.deviceToken ?? '' : offerData?.buyer?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.OFFER_REJECTED'),
        description : this.i18n.t('test.NOTIFICATION.SELLER_REJECT_OFFER'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : user.type === 'BUYER' ? offerData.sellerId : offerData.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: user.type === 'BUYER' ? offerData.seller.type : offerData.buyer.type,
        metaData : {
          type : NotificationStatus.OFFER,
          buyerId : offerData.buyerId,
          sellerId : offerData.sellerId,
          offerId : offerData.id
        },
      })
    }
    await this.offerRepository.save(offerData);

    const getBooking = await this.bookingRepository.findOne({ where : {
      offerId : id,
      isDeleted : false,
      isSuspended: false
    }})
    // send offer update on socket emit
    const chatData = await this.chatRepository.findOne({
      where: {
        offerId: offerData.id,
        isDeleted: false,
      },
    });
    if (chatData) {
      if(getBooking?.id){
        const updateOfferQuey = {offerId:offerData.id, isDeleted:false}
        await this.chatRepository.update(updateOfferQuey, { bookingId: getBooking?.id });
      }
      const response = {
        chatId: chatData.id,
        message: '',
        messageType: MessageType.OFFER,
        buyerId: chatData.buyerId,
        sellerId: chatData.sellerId,
        senderType: chatData.senderType,
        receiverType: chatData.receiverType,
        created: chatData.created,
        offer:offerData,
        bookingId:getBooking?.id,
        sender: {
          id: user.id,
          fullName: user.fullName,
          avatar: user.avatar,
          userType: user.type,
        },
      };
      let receiver: any;
      if (user.type === 'SELLER') {
        receiver = offerData.buyerId;
      } else {
        receiver = offerData.sellerId;
      }
      const postData = {
        listener: 'update-message',
        receiver: receiver,
        type: 'offer',
        data: response,
      };
      callSocketApi(postData);
    }
    // End
    return new ResponseSuccess(this.i18n.t('test.CHAT.STATUS_UPDATED'), {
      record: offerData,
    });
  }

  async addUpdateOffer(
    addUpdateOfferDto: AddUpdateOfferDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const {
      id,
      countryId,
      categoryId,
      tagIds,
      images,
      documents,
      price,
      title,
      priceRange,
      description,
      receiverId,
    } = addUpdateOfferDto;

    // get chat request Data
    const requestInfo = await this.chatRequestRepository.findOne({
      where: [
        {
          isDeleted: false,
          sellerId: user.id,
          buyerId: receiverId,
          status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]),
        },
        {
          isDeleted: false,
          buyerId: user.id,
          sellerId: receiverId,
          status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]),
        },
      ],
    });

    // get user Data
    const userInfo = await this.userRepository.findOne({
      where:  {
        isDeleted: false,
        id: receiverId,
      },
    });

    if (id) {
      const offer = await this.offerRepository.findOne({
        where: [
          { id, buyerId: user.id, isDeleted: false },
          { id, sellerId: user.id, isDeleted: false },
        ],
        relations : {
          buyer : true,
          seller : true
        }
      });

      if (!offer) {
        throw new BadRequestException(this.i18n.t('test.OFFER.NOT_FOUND'));
      }

      if (offer.status !== 'Pending') {
        throw new BadRequestException(
          this.i18n.t('test.OFFER.STATUS_UPDATED_ALREADY'),
        );
      }

      if (price) {
        offer.price = price;
      }

      if (priceRange) {
        offer.priceRange = priceRange;
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if (minPrice) {
          offer.minPrice = minPrice;
        }
        if (maxPrice) {
          offer.maxPrice = maxPrice;
        }
      }
      await this.offerRepository.save(offer);

      // send offer update on socket emit
      const chatData = await this.chatRepository.findOne({
        where: {
          offerId: offer.id,
          isDeleted: false,
        },
      });
      if (chatData) {
        const response = {
          chatId: chatData.id,
          message: '',
          messageType: MessageType.OFFER,
          buyerId: chatData.buyerId,
          sellerId: chatData.sellerId,
          senderType: chatData.senderType,
          receiverType: chatData.receiverType,
          created: chatData.created,
          offer,
          sender: {
            id: user.id,
            fullName: user.fullName,
            avatar: user.avatar,
            userType: user.type,
          },
        };
        let receiver: any;
        if (user.type === 'SELLER') {
          receiver = offer.buyerId;
        } else {
          receiver = offer.sellerId;
        }
        const postData = {
          listener: 'update-message',
          receiver: receiver,
          type: 'offer',
          data: response,
        };
        callSocketApi(postData);
      }
      // End
      return new ResponseSuccess(this.i18n.t('test.OFFER.UPDATED'));
    } else {
      const offer = new Offer();
      if (priceRange) {
        offer.priceRange = priceRange;
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if (minPrice) {
          offer.minPrice = minPrice;
        }
        if (maxPrice) {
          offer.maxPrice = maxPrice;
        }
      }
      offer.title = title;
      offer.description = description;
      offer.category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      offer.country = await this.countryRepository.findOne({
        where: { id: countryId },
      });
      offer.price = price;
      // Fetch tags by IDs
      offer.tags = await this.tagRepository.find({
        where: { id: In(tagIds) },
        order: {
          created: 'DESC',
        },
      });
      offer.offerDocument = documents.map((doc:any) => {
        const document = new OfferDocument();
        document.type = FileType.pdf;
        document.url = doc.url;
        document.name = doc.name;
        return document;
      });

      offer.offerImage = images.map((doc:any) => {
        const document = new OfferImage();
        document.type = FileType.png ?? FileType.jpg;
        document.url = doc;
        return document;
      });

      if (user.type === 'SELLER') {
        offer.sellerId = user.id;
        offer.buyerId = receiverId;

        await this.fcmService.saveNotification({
          deviceToken :  userInfo?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.OFFER_NEW_RECIEVED'),
          description : this.i18n.t('test.NOTIFICATION.NEW_OFFER_RECIEVED'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : receiverId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: userInfo.type,
          metaData : {
            type : NotificationStatus.OFFER,
            buyerId : offer.buyerId,
            sellerId : offer.sellerId,
            offerId : offer.id
          },
        })
      }else{
        offer.buyerId = user.id;
        offer.sellerId = receiverId;

        await this.fcmService.saveNotification({
          deviceToken : userInfo?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.OFFER_NEW_RECIEVED'),
          description : this.i18n.t('test.NOTIFICATION.NEW_OFFER_RECIEVED'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : receiverId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: userInfo.type,
          metaData : {
            type : NotificationStatus.OFFER,
            buyerId : offer.buyerId,
            sellerId : offer.sellerId,
            offerId : offer.id
          },
        })
      }
      offer.offerBy = user.type;
      await this.offerRepository.save(offer);

      // save in chat data for offer
      if (requestInfo) {
        const chatData = new Chat();
        if (user.type === 'SELLER') {
          chatData.buyerId = receiverId;
          chatData.sellerId = user.id;
          chatData.senderType = UserType.SELLER;
          chatData.receiverType = UserType.BUYER;
        } else {
          chatData.buyerId = user.id;
          chatData.sellerId = receiverId;
          chatData.senderType = UserType.BUYER;
          chatData.receiverType = UserType.SELLER;
        }
        chatData.chatRequestId = requestInfo.id;
        chatData.messageType = MessageType.OFFER;
        chatData.offerId = offer.id;
        await this.chatRepository.save(chatData);

        // response
        const response = {
          chatId: chatData.id,
          message: '',
          messageType: MessageType.OFFER,
          buyerId: chatData.buyerId,
          sellerId: chatData.sellerId,
          senderType: chatData.senderType,
          receiverType: chatData.receiverType,
          created: chatData.created,
          offer,
          sender: {
            id: user.id,
            fullName: user.fullName,
            avatar: user.avatar,
            userType: user.type,
          },
        };
        // send offer update on socket emit
        let receiver: any;
        if (user.type === 'SELLER') {
          receiver = offer.buyerId;
        } else {
          receiver = offer.sellerId;
        }
        const postData = {
          listener: 'new-message',
          receiver: receiver,
          type: 'offer',
          data: response,
        };
        callSocketApi(postData);
        // End
      }
      return new ResponseSuccess(this.i18n.t('test.OFFER.ADDED'));
    }
  }

  async counterOffer(counterOfferDto: CounterOfferDto, req: any): Promise<any> {
    const { user } = req;
    const { id, price } = counterOfferDto;
    const offer = await this.offerRepository.findOne({
      where: [
        { id, buyerId: user.id, isDeleted: false },
        { id, sellerId: user.id, isDeleted: false },
      ],
      relations : {
        buyer :true,
        seller : true
      }
    });

    if (!offer) {
      throw new BadRequestException(this.i18n.t('test.OFFER.NOT_FOUND'));
    }

    if (offer.status !== 'Pending') {
      throw new BadRequestException(
        this.i18n.t('test.OFFER.STATUS_UPDATED_ALREADY'),
      );
    }

    if (price) {
      offer.counterPrice = price;
    }

    const userType = req.headers['user-type'];
    if (userType === 'SELLER') {
      offer.counterBy = UserType.SELLER;

      await this.fcmService.saveNotification({
        deviceToken : offer?.buyer?.deviceToken ?? '',
        deviceType : '',
        title :  this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.OFFER_COUNTERED'),
        description : this.i18n.t('test.NOTIFICATION.SELLER_SEND_COUNTER_OFFER'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : offer.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: offer.buyer.type,
        metaData : {
          type : NotificationStatus.OFFER,
          buyerId : offer.buyerId,
          sellerId : offer.sellerId,
          offerId : offer.id
        },
      })
    } else {
      offer.counterBy = UserType.BUYER;

      await this.fcmService.saveNotification({
        deviceToken : offer?.seller?.deviceToken ?? '',
        deviceType : '',
        title :  this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.OFFER_COUNTERED'),
        description : this.i18n.t('test.NOTIFICATION.SEND_COUNTEROFFER'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : offer.sellerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: offer.seller.type,
        metaData : {
          type : NotificationStatus.OFFER,
          buyerId : offer.buyerId,
          sellerId : offer.sellerId,
          offerId : offer.id
        },
      })
    }

    await this.offerRepository.save(offer);
    // send offer update on socket emit
    // get chat request Data
    const requestInfo = await this.chatRequestRepository.findOne({
      where: {
        isDeleted: false,
        sellerId: offer.sellerId,
        buyerId: offer.buyerId,
        status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]),
      },
    });
    if (requestInfo) {
      // Save new chat
      const chatData = new Chat();
      chatData.buyerId = offer.buyerId;
      chatData.sellerId = offer.sellerId;
      if (user.type === 'SELLER') {
        chatData.senderType = UserType.SELLER;
        chatData.receiverType = UserType.BUYER;
      } else {
        chatData.senderType = UserType.BUYER;
        chatData.receiverType = UserType.SELLER;
      }
      chatData.chatRequestId = requestInfo.id;
      chatData.messageType = MessageType.OFFER;
      chatData.offerId = offer.id;
      chatData.isCounter = true;
      await this.chatRepository.save(chatData);
    
      const response = {
        chatId: chatData.id,
        message: '',
        messageType: MessageType.OFFER,
        buyerId: chatData.buyerId,
        sellerId: chatData.sellerId,
        senderType: chatData.senderType,
        receiverType: chatData.receiverType,
        created: chatData.created,
        offer:offer,
        sender: {
          id: user.id,
          fullName: user.fullName,
          avatar: user.avatar,
          userType: user.type,
        },
      };
      let receiver: any;
      if (user.type === 'SELLER') {
        receiver = offer.buyerId;
      } else {
        receiver = offer.sellerId;
      }
      const postData = {
        listener: 'new-message',
        receiver: receiver,
        type: 'offer',
        data: response,
      };
      callSocketApi(postData);
    }
    // End
    return new ResponseSuccess(this.i18n.t('test.OFFER.COUNTER_OFFER_SEND'));
  }
}
