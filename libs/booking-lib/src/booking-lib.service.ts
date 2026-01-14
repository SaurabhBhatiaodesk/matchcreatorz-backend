import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { User, Booking, Service, Offer, AdminSetting, Tag, ServiceBids, BookingDocument, BookingImage, WalletTransaction, Milestone, Favorite, Report, ChatRequest, CompletionProof, UserReviews, Chat } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Brackets, In, Repository } from 'typeorm';
import { AllBookingDto, CompleteProcessDto, CounterProposeDto, CreateBookingDto, ListBookingApiDto, ListBookingDto, SettleBookingDto, UpdateRequestDto, UpdateStatusDto, addMilestoneDto, addReviewDto } from './dto';
import { BidStatus, BookingStatus, CompletionProcess, FileType, MessageType, NotificationStatus, NotificationType, PaymentStatus, RequestStatus, SettlementStatus, UserType, WalletTransactionType } from 'common/enums';
import { PayoutTransactionType } from 'common/enums/payoutType.enum';
import { ServiceStatusType } from 'common/enums/serviceStatus.enum';
import { callSocketApi, FcmService } from 'common/utils';
@Injectable()
export class BookingsLibService {
  constructor(
    private readonly fcmService: FcmService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Offer) private offerRepository: Repository<Offer>,
    @InjectRepository(AdminSetting) private adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(ServiceBids)private bidRepository: Repository<ServiceBids>,
    @InjectRepository(WalletTransaction)private walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(Milestone)private milestoneRepository: Repository<Milestone>,
    @InjectRepository(Favorite) private userfavoriteRepository: Repository<Favorite>,
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    @InjectRepository(ChatRequest) private chatRequestRepository: Repository<ChatRequest>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(UserReviews) private reviewRepository: Repository<UserReviews>,
    private readonly i18n: I18nService,
  ) {}

  async createBookingFromService(user: User, serviceId: number, platformFee: number) {
    if (!serviceId) {
      throw new BadRequestException('Service ID is required.');
    }

    // Step 1: Fetch Service
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, isDeleted: false },
      relations: ['tags', 'documents', 'images', 'user']
    });

    if (!service) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.NOT_FOUND'));
    }

    // Step 2: Initialize Booking
    const booking = new Booking();
    booking.title = service.title;
    booking.categoryId = service.categoryId;
    booking.countryId = service.countryId;
    booking.serviceId = service.id;
    booking.buyerId = user.id;
    booking.description = service.description;

    // Step 3: Update Tags
    if (service.tags.length > 0) {
      const tagIds = service.tags.map(d => d.id);
      booking.tags = await this.tagRepository.find({
        where: { id: In(tagIds) },
        order: { created: 'DESC' },
      });
    }

    // Step 4: Update Documents
    if (service.documents && service.documents.length > 0) {
      booking.documents = service.documents.map((doc) => {
        const document = new BookingDocument();
        document.type = doc.type;
        document.name = doc.name;
        document.url = doc.url;
        return document;
      });
    }

    // Step 5: Update Images
    if (service.images && service.images.length > 0) {
      booking.images = service.images.map((img) => {
        const image = new BookingImage();
        image.type = img.type;
        image.url = img.url;
        return image;
      });
    }

    // Step 6: Calculate Amount and Seller Information
    let totalAmount = 0;
    if (service.type === 'Service') {
      booking.sellerId = service.userId;
      booking.price = service.price;
      booking.platformFee = platformFee;
      totalAmount = Number(service.price) + Number(platformFee);
    } else {
      const bidService = await this.bidRepository.findOne({
        where: { serviceId: service.id, type: BidStatus.ACCEPTED, isDeleted: false }
      });

      if (!bidService) {
        throw new BadRequestException(this.i18n.t('test.SERVICE.NO_ACCEPTED_BID_FOUND_JOB'));
      }

      booking.sellerId = bidService.userId;
      booking.price = bidService.bidAmount;
      booking.platformFee = platformFee;
      totalAmount = Number(bidService.bidAmount) + Number(platformFee);
    }

    // Step 7: Check Wallet Balance
    if (totalAmount > user.walletAmount) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.INSUFFICIENT_AMOUNT'));
    }

    // Step 8: Save Booking
    booking.totalAmount = totalAmount;
    booking.status = BookingStatus.PENDING;
    booking.paymentStatus = PaymentStatus.PENDING;
    await this.bookingRepository.save(booking);

    // Step 9: Create Wallet Transaction
    const transactionId = `txn_${user.id}${new Date().valueOf()}`;
    const walletTransaction = new WalletTransaction();
    walletTransaction.user = user;
    walletTransaction.userId = user.id;
    walletTransaction.bookingId = booking.id;
    walletTransaction.transactionId = transactionId;
    walletTransaction.amount = totalAmount;
    walletTransaction.paymentStatus = PaymentStatus.PAID;
    walletTransaction.type = WalletTransactionType.DEBIT;
    walletTransaction.payoutType = PayoutTransactionType.BOOKING;

    // Step 10: Debit Amount in User Wallet
    user.walletAmount -= totalAmount;
    await this.userRepository.save(user);
    await this.walletTransactionRepository.save(walletTransaction);

    // Step 11: Update Booking Status to Ongoing
    booking.status = BookingStatus.ONGOING;
    booking.paymentStatus = PaymentStatus.PAID;
    booking.walletTransactionId = walletTransaction.id;
    await this.bookingRepository.save(booking);

    // Step 12: Update Service Status if the User is the Seller
    if (service.userId === user.id) {
      service.status = ServiceStatusType.BOOKED;
      await this.serviceRepository.save(service);
    }

    // sent notify
    await this.fcmService.saveNotification({
      deviceToken : service?.user?.deviceToken ?? '',
      deviceType : '',
      title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.CREATE_BOOKING'),
      description : this.i18n.t('test.BOOKING.CREATED'),    
      type : NotificationType.SYSTEM_GENERATED,
      recieverId : service.userId,
      senderId : user?.id,
      senderType: user.type,
      receiverType: service.user.type,
      metaData : {
        type : NotificationStatus.BOOKING,
        bookingId : booking.id
      },
    })

    return new ResponseSuccess(this.i18n.t('test.BOOKING.CREATED'));
  }

  async createBookingFromOffer(user: User, offerId: number, platformFee: number) {
    if (!offerId) {
      throw new BadRequestException('Offer ID is required.');
    }
  
    // Step 1: Fetch Offer
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, isDeleted: false },
      relations: ['tags', 'offerDocument', 'offerImage']
    });
  
    if (!offer) {
      throw new BadRequestException(this.i18n.t('test.OFFER.NOT_FOUND'));
    }

    // Step 2: Initialize Booking
    const booking = new Booking();
    booking.title = offer.title;
    booking.categoryId = offer.categoryId;
    booking.countryId = offer.countryId;
    booking.offerId = offer.id;
    booking.buyerId = user.id;
    booking.description = offer.description;
  
    // Step 3: Update Tags
    if (offer.tags.length > 0) {
      const tagIds = offer.tags.map(d => d.id);
      booking.tags = await this.tagRepository.find({
        where: { id: In(tagIds) },
        order: { created: 'DESC' },
      });
    }
  
    // Step 4: Update Documents
    if (offer.offerDocument && offer.offerDocument.length > 0) {
      booking.documents = offer.offerDocument.map((doc) => {
        const document = new BookingDocument();
        document.type = doc.type;
        document.name = doc.name;
        document.url = doc.url;
        return document;
      });
    }
  
    // Step 5: Update Images
    if (offer.offerImage && offer.offerImage.length > 0) {
      booking.images = offer.offerImage.map((img) => {
        const image = new BookingImage();
        image.type = img.type;
        image.url = img.url;
        return image;
      });
    }
  
    // Step 6: Calculate Total Amount
    let totalAmount = 0;
    if (offer.counterPrice && offer.counterPrice !== undefined) {
      booking.sellerId = offer.sellerId;
      booking.price = offer.counterPrice;
      booking.platformFee = platformFee;
      totalAmount = Number(offer.counterPrice) + Number(platformFee);
    } else {
      booking.sellerId = offer.sellerId;
      booking.price = offer.price;
      booking.platformFee = platformFee;
      totalAmount = Number(offer.price) + Number(platformFee);
    }
    
    booking.totalAmount = totalAmount;
  
    // Step 7: Check Wallet Balance
    if (totalAmount > user.walletAmount) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.INSUFFICIENT_BALANCE'));
    }

     // Step 8: Save Booking
    booking.status = BookingStatus.PENDING;
    booking.paymentStatus = PaymentStatus.PENDING;
    await this.bookingRepository.save(booking);
  
    // Step 9: Create Wallet Transaction
    const transactionId = `txn_${user.id}${new Date().valueOf()}`;
    const walletTransaction = new WalletTransaction();
    walletTransaction.user = user;
    walletTransaction.userId = user.id;
    walletTransaction.bookingId = booking.id;
    walletTransaction.transactionId = transactionId;
    walletTransaction.amount = totalAmount;
    walletTransaction.paymentStatus = PaymentStatus.PAID;
    walletTransaction.type = WalletTransactionType.DEBIT;
    walletTransaction.payoutType = PayoutTransactionType.BOOKING;
  
    // Step 10: Debit Amount from User's Wallet
    user.walletAmount -= totalAmount;
    await this.userRepository.save(user);
    await this.walletTransactionRepository.save(walletTransaction);
  
    // Step 11: Update Booking
    booking.status = BookingStatus.ONGOING;
    booking.paymentStatus = PaymentStatus.PAID;
    booking.walletTransactionId = walletTransaction.id;
    await this.bookingRepository.save(booking);

    // Update offer status marked paid
    const offerData = await this.offerRepository.findOne({
      where: {
        id:offerId,
        isDeleted:false
      },
      relations : {
        buyer : true,
        seller : true
      }
    });
    offerData.paymentStatus = PaymentStatus.PAID;
    await this.offerRepository.save(offerData);
    
    // Update chat data booking id
    const updateOfferChatQuey = {offerId:offerId, isDeleted:false}
    await this.chatRepository.update(updateOfferChatQuey, { bookingId: booking?.id });

     // send offer update on socket emit
     const chatData = await this.chatRepository.findOne({
      where: {
        offerId: offerId,
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
        offer:offerData,
        bookingId:booking?.id,
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
  
    return new ResponseSuccess(this.i18n.t('test.BOOKING.CREATED'));
  }

  async list(listBookingDto: ListBookingDto): Promise<any> {
    const  {
      pagination = true,
      limit = 10,
      searchTerm = '',
    } = listBookingDto;
    let {
      skip = 0
    } = listBookingDto;

    let query = this.bookingRepository
      .createQueryBuilder('booking')

    // if search term not empty then apply search
    if (searchTerm) {
      query = query.andWhere(`fullName LIKE :searchTerm`, {
        searchTerm: `%${searchTerm}%`,
      });

      skip = 0;
    }
    // get count
    const total = await query.getCount();

    // if pagination then add skip and limit
    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
      query.skip((perPage - 1) * limit).take(limit)
    }

    // get records
    const records = await query.getRawMany();
    const response = {
      total,
      records,
    };
    return new ResponseSuccess('', response);
  }

  async all(allBookingDto: AllBookingDto): Promise<any> {
    const {
      pagination = true,
      skip = 0,
      limit = 10,
      searchTerm = '',
      bookingType = 'ALL',
      bookingSubStatus=''
    } = allBookingDto;

    const query = await this.bookingRepository
    .createQueryBuilder('booking')
    .leftJoin('booking.buyer', 'user')
    .addSelect([
      'user.id',
      'user.fullName',
      'user.avatar'
    ])
    .leftJoin('booking.seller', 'seller')
    .addSelect([
      'seller.id',
      'seller.fullName',
      'seller.avatar'
    ])
    .leftJoinAndSelect('booking.documents', 'document')
    .leftJoinAndSelect('booking.images', 'booking_image')
    .leftJoinAndSelect('booking.category', 'category')
    .leftJoinAndSelect('booking.country', 'country')
    .leftJoin('booking.tags', 'tags')
    .addSelect(['tags.id', 'tags.name'])
    .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false });

    // search filter
    if (searchTerm) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.fullName LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
          .orWhere('seller.fullName LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
          .orWhere('category.title LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('booking.title LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('booking.paymentStatus LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('booking.status LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('booking.id LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
        }),
      );
    }

    // check active status
    if (bookingType === 'ALL') {
      query.andWhere('booking.isSuspended = :isSuspended', { isSuspended: false });
    }else if (bookingType === 'Active') {
      if(bookingSubStatus === 'PENDING'){
        query.andWhere('booking.status = :status', { status: BookingStatus.PENDING });
      }else if(bookingSubStatus == 'ONGOING'){
        query.andWhere('booking.status = :status', { status: BookingStatus.ONGOING });
      } else if(bookingSubStatus == 'Amidst Cancellation'){
        query.andWhere('booking.status = :status', { status: BookingStatus.AMIDST_CANCELLATION });
      }else if(bookingSubStatus == 'Amidst Completion Process'){
        query.andWhere('booking.status = :status', { status: BookingStatus.AMIDST_COMPLETION_PROCESS });
      }else {
        query.andWhere('booking.isSuspended = :isSuspended', { isSuspended: false });
      }
    }else if (bookingType == 'Cancelled') {
      query.andWhere('booking.status = :status', { status: 'Cancelled' });
    } else if (bookingType == 'Completed') {
      query.andWhere('booking.status = :status', { status: 'Completed' });
    } else if (bookingType == 'In-dispute') {
      query.andWhere('booking.status = :status', { status: 'In-dispute' });
    }else {
      query.andWhere('booking.isSuspended = :isSuspended', { isSuspended: false });
    }

    query.orderBy('booking.created', 'DESC');
    
    
    // total records
    const total = await query.getCount();

    // if pagination true
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
      totalRecords : records,
      page : Number(skip)
    };

    return new ResponseSuccess('', response);
  }

  async get(id: number): Promise<any> {
    const query = await this.bookingRepository
    .createQueryBuilder('booking')
    .leftJoin('booking.buyer', 'user')
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
    .leftJoin('booking.seller', 'seller')
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
    .leftJoinAndSelect('booking.documents', 'document')
    .leftJoinAndSelect('booking.images', 'booking_image')
    .leftJoinAndSelect('booking.milestones', 'booking_milestone')
    .leftJoinAndSelect('booking.category', 'category')
    .leftJoinAndSelect('booking.country', 'country')
    .leftJoinAndSelect('booking.completionProof', 'completion_proof')
    .leftJoinAndSelect('booking.walletTransaction', 'wallet_transaction')
    .leftJoinAndSelect('booking.review', 'user_reviews')
    .leftJoin('booking.tags', 'tags')
    .addSelect(['tags.id', 'tags.name'])
    .andWhere('booking.id = :id', { id: id })
    .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false })

    const bookingData = await query.getOne();

    if (!bookingData) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.BOOKING.INFO'), {
      ...bookingData
    });
  }

  async updateStatus(queryParams : SettleBookingDto): Promise<any> {
    try {
      const { id , status, settleAmount, refundAmount, bookingStatus } = queryParams
      const bookingData = await this.bookingRepository.findOne({
        where: {
          id : id,
          isDeleted : false,
          isSuspended : false
        },
      });
  
      if (!bookingData) {
        throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
      }

      if(status === 'settled'){
        bookingData.settlementAmount = settleAmount;
        bookingData.refundAmount = refundAmount;
  
        if(bookingStatus){
          bookingData.status =  bookingStatus === 'completed' ? BookingStatus.COMPLETED : BookingStatus.CANCELLED;
        }
  
        // save wallet txn
        const transactionId = `txn_${bookingData?.id}${new Date().valueOf()}`;
        const wallet = new WalletTransaction();
        wallet.user = bookingData?.buyer;
        wallet.userId = bookingData?.buyerId
        wallet.bookingId = bookingData?.id;
        wallet.transactionId = transactionId;
        wallet.amount = refundAmount;
        wallet.paymentStatus = PaymentStatus.PAID;
        wallet.type = WalletTransactionType.CREDIT;
        wallet.payoutType = PayoutTransactionType.BOOKING;
  
  
        const wallets = new WalletTransaction();
        wallets.user = bookingData?.seller;
        wallets.userId = bookingData?.sellerId
        wallets.bookingId = bookingData?.id;
        wallets.transactionId = transactionId;
        wallets.amount = settleAmount;
        wallets.paymentStatus = PaymentStatus.PAID;
        wallets.type = WalletTransactionType.CREDIT;
        wallets.payoutType = PayoutTransactionType.BOOKING;
  
        // credit ammount in buyer wallet
        const buyer = await this.userRepository.findOne({ where : { id :  bookingData?.buyerId , isDeleted : false, isSuspended:false }})
        buyer.walletAmount += refundAmount;
        await this.userRepository.save(buyer);
  
        // credit ammount in buyer wallet
        const seller = await this.userRepository.findOne({ where : { id :  bookingData?.sellerId , isDeleted : false, isSuspended:false }})
        seller.walletAmount += settleAmount;
        await this.userRepository.save(seller);
        await this.bookingRepository.save(bookingData);
        await this.walletTransactionRepository.save(wallet);
        await this.walletTransactionRepository.save(wallets);

          return new ResponseSuccess(this.i18n.t('test.BOOKING.STATUS_UPDATED'), {
        ...bookingData,
      });
      }
    } catch (error) {
        return error;
    }
  }

  async getUser(id: number): Promise<any> {
    const user = await this.validateActiveUserById(id);
    ['password', 'authTokenIssuedAt'].forEach(
      key => delete user[key]
    );
    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), { user });
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });
    return user;
  }

  async validateActiveUserById(id: number) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.ACCOUNT_SUSPENDED'));
    }

    return user;
  }

  async createBooking(
    createBookingDto: CreateBookingDto,
    req: any,
  ): Promise<any> {
    const { user } = req;

    const {
      offerId,
      serviceId
    } = createBookingDto;

    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    let platformFee = 0; // default
    if (adminSetting?.platformFee) {
      platformFee = adminSetting.platformFee;
    }

    if (serviceId) { 
      await this.createBookingFromService(user, serviceId, platformFee)
      // Send push to admin
      await this.fcmService.saveNotification({
        deviceToken : '',
        deviceType : '',
        title : `New Booking Made Through Service From : ${user?.fullName ?? 'User'}`,
        description : `You have new booking from(${user.fullName}).`,    
        type : NotificationType.BROADCAST,
        status : NotificationStatus.NEW_BOOKING_MADE,
        receiverId : 1,
        senderType: user.type,
        receiverType: UserType.ADMIN,
        metaData : {
          type : NotificationStatus.BOOKING,
          serviceId : serviceId
        },
      })
      return new ResponseSuccess(this.i18n.t('test.BOOKING.CREATED'));
    } else if (offerId) {
      await this.createBookingFromOffer(user, offerId, platformFee)
      // Send push to admin
      await this.fcmService.saveNotification({
        deviceToken : '',
        deviceType : '',
        title : `New Booking Made Through Offer From : ${user?.fullName ?? 'User'}`,
        description : `You have new booking from(${user.fullName}).`,    
        type : NotificationType.BROADCAST,
        status : NotificationStatus.NEW_BOOKING_MADE,
        receiverId : 1,
        senderType: user.type,
        receiverType: UserType.ADMIN,
        metaData : {
          type : NotificationStatus.BOOKING,
          serviceId : offerId
        },
      })
      return new ResponseSuccess(this.i18n.t('test.BOOKING.CREATED'));
    }else{
      return new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }
  }

  async getBooking(id: number, req: any): Promise<any> {
    const { user } = req;
    let isReported = false;
    let isFavourite = false;
    let isChatConnected = false;
    let isChatRequested = false;
    const query = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.buyer', 'user')
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
      .leftJoin('booking.seller', 'seller')
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
      .leftJoinAndSelect('booking.documents', 'document')
      .leftJoinAndSelect('booking.images', 'booking_image')
      .leftJoinAndSelect('booking.milestones', 'booking_milestone')
      .leftJoinAndSelect('booking.category', 'category')
      .leftJoinAndSelect('booking.country', 'country')
      .leftJoinAndSelect('booking.completionProof', 'completion_proof')
      .leftJoinAndSelect('booking.walletTransaction', 'wallet_transaction')
      .leftJoinAndSelect('booking.review', 'user_reviews')
      .leftJoin('booking.tags', 'tags')
      .addSelect(['tags.id', 'tags.name'])
      .andWhere('booking.id = :id', { id: id })
      .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false });

      const userType = req.headers['user-type'];
      if (userType === 'SELLER') {
        query.andWhere('booking.sellerId = :sellerId', { sellerId: user.id }); 
      } else {
        query.andWhere('booking.buyerId = :buyerId', { buyerId: user.id }); 
      }
      
    const bookingData = await query.getOne();
    if (!bookingData) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }

    let toFavId = 0;
    if (userType === 'SELLER') {
      toFavId =  bookingData.buyerId;
    } else {
      toFavId =  bookingData.sellerId;
    }

    // User Favorite
    const favorite = await this.userfavoriteRepository.findOne({
      where: {
        favoriteBy: { id: user.id },
        favoriteTo: { id: toFavId },
        isDeleted: false,
      },
    });

    if (favorite) {
      isFavourite = true;
    }

    // User Reporetd
    const reportInfo = await this.reportRepository.findOne({
      where: {
        reportedBy:{ id: user.id },
        reportedToId: toFavId,
        isDeleted: false
      }
    });
    if(reportInfo){
      isReported = true;
    }

     // User chat
     const requestInfo = await this.chatRequestRepository.findOne({
      where: [
        {isDeleted: false, sellerId: user.id, buyerId: toFavId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
        {isDeleted: false, buyerId: user.id, sellerId: toFavId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
      ],
    });

    if(requestInfo && requestInfo.status === RequestStatus.ACCEPT){
      isChatConnected = true;
    }

    if(requestInfo && requestInfo.status === RequestStatus.PENDING){
      isChatRequested = true;
    }

    const result = {
      ...bookingData,
      isFavourite,
      isReported,
      isChatRequested,
      isChatConnected
    };

    return new ResponseSuccess(this.i18n.t('test.BOOKING.INFO'), result);
  }

  async updateBookingStatus(id: number, updateStatusDto:UpdateStatusDto, req: any): Promise<any> {
    const { user } = req;
    const {
      status,
      reason,
      settlementAmountProposed
    } = updateStatusDto;
    const bookingData = await this.bookingRepository.findOne({
      where: {
        id,
      },
      relations : {
        buyer : true,
        seller : true
      }
    });

    if (!bookingData) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }

    if(bookingData.status === 'Cancelled') {
      throw new BadRequestException(this.i18n.t('test.BOOKING.ALREADY_CANCELLED'));
    }

    if(bookingData.status === 'Completed') {
      throw new BadRequestException(this.i18n.t('test.BOOKING.ALREADY_COMPLTED'));
    }
    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    let minPercentForSettle = 0; // default
    if (adminSetting?.minPercentForSettle) {
      minPercentForSettle = adminSetting.minPercentForSettle;
    }

    if (status === 'In-dispute') {
      bookingData.status = BookingStatus.IN_DISPUTE;
      bookingData.disputeReason = reason;
      if (user.type === 'SELLER') {
        bookingData.disputeByType = UserType.SELLER;
        await this.fcmService.saveNotification({
          deviceToken : bookingData?.buyer?.deviceToken ?? 'Token',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.RAISE_DISPUTE'),
          description : this.i18n.t('test.NOTIFICATION.RAISED_DISPUTE'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : bookingData.buyerId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: bookingData.buyer.type,
          metaData : {
            type : NotificationStatus.BOOKING,
            bookingId : bookingData.id
          },
        })
      } else {
        bookingData.disputeByType = UserType.BUYER;
        await this.fcmService.saveNotification({
          deviceToken : bookingData?.seller?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.RAISE_DISPUTE'),
          description : this.i18n.t('test.NOTIFICATION.BUYER_RAISE_DISPUTE'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : bookingData.sellerId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: bookingData.seller.type,
          metaData : {
            type : NotificationStatus.BOOKING,
            bookingId : bookingData.id
          },
        })
      }
    }else if (status === 'Amidst-Cancellation') {
      const minimumSettleAmmount = bookingData.price*minPercentForSettle/100;
      if(settlementAmountProposed && settlementAmountProposed < minimumSettleAmmount){
        throw new BadRequestException(this.i18n.t('test.BOOKING.MINIMUMSETTLEAMOUNT'));
      }
      bookingData.status = BookingStatus.AMIDST_CANCELLATION;
      bookingData.reason = reason;
      bookingData.settlementAmountProposed = settlementAmountProposed;
      if (user.type === 'SELLER') {
        bookingData.cancelByType = UserType.SELLER;

        await this.fcmService.saveNotification({
          deviceToken : bookingData?.buyer?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.AMIDT_CANCEL'),
          description : this.i18n.t('test.NOTIFICATION.CANCEL_BOOKING'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : bookingData.buyerId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: bookingData.buyer.type,
          metaData : {
            type : NotificationStatus.BOOKING,
            bookingId : bookingData.id
          },
        })

      } else {
        bookingData.cancelByType = UserType.BUYER;

        await this.fcmService.saveNotification({
          deviceToken : bookingData?.seller?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.AMIDT_CANCEL'),
          description : this.i18n.t('test.NOTIFICATION.BUYER_CANCEL_BOOKING'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : bookingData.sellerId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: bookingData.seller.type,
          metaData : {
            type : NotificationStatus.BOOKING,
            bookingId : bookingData.id
          },
        })
      }
      bookingData.settlementStatus = SettlementStatus.PENDING;
    }else if (status === 'WithDrawn') {
      if(bookingData.status === 'In-dispute'){
        bookingData.disputeStatus = SettlementStatus.WITHDRAWN;

        await this.fcmService.saveNotification({
          deviceToken : bookingData?.seller?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.DISPUTE_WITHDRAWN'),
          description : this.i18n.t('test.NOTIFICATION.WITHDRAW_DISPUTE'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : user?.id,
          senderId : user?.id,
          senderType: user.type,
          receiverType: bookingData.seller.type,
          metaData : {
            type : NotificationStatus.BID,
            bookingId : bookingData.id
          },
        })
      }else if(bookingData.status === 'Amidst-Cancellation'){
        bookingData.settlementStatus = SettlementStatus.WITHDRAWN;
        await this.fcmService.saveNotification({
          deviceToken : bookingData?.seller?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.WITHDRAW_SETTLEMENT'),
          description : this.i18n.t('test.NOTIFICATION.WITHDRAW_SELLERMENT'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : user?.id,
          senderId : user?.id,
          senderType: user.type,
          receiverType: bookingData.seller.type,
          metaData : {
            type : NotificationStatus.BID,
            bookingId : bookingData.id
          },
        })
      }
      bookingData.status = BookingStatus.ONGOING;
    }
    await this.bookingRepository.save(bookingData);
    return new ResponseSuccess(this.i18n.t('test.BOOKING.STATUS_UPDATED'), {
      record: bookingData,
    });
  }

  async counterPropose(
    counterProposeDto: CounterProposeDto,
    req: any,
  ): Promise<any> {
    const { user } = req;

    const {
      bookingId,
      amount
    } = counterProposeDto;

 
    const booking = await this.bookingRepository.findOne({
      where: [
        { id:bookingId, buyerId: user.id, isDeleted:false },
        { id:bookingId, sellerId: user.id, isDeleted:false },
      ],
      relations:{
        buyer: true,
        seller : true
      }
    });

    if (!booking) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }

    if (booking.status !== 'Amidst-Cancellation') {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_SEND_CENCELLETION_REQUEST'));
    }

    if (amount) {
      booking.counterAmountProposed = amount;
    }

    const userType = req.headers['user-type'];
    if (userType === 'SELLER') {
      booking.counterBy = UserType.SELLER;

      await this.fcmService.saveNotification({
        deviceToken : booking?.buyer?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.COUNTER_OFFER'),
        description : this.i18n.t('test.NOTIFICATION.COUNTER_SETTLEMENT_AMOUNT'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : booking.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: booking.buyer.type,
        metaData : {
          type : NotificationStatus.BOOKING,
          bookingId : booking.id
        },
      })
    }else{
      booking.counterBy = UserType.BUYER;

      await this.fcmService.saveNotification({
        deviceToken : booking?.seller?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.COUNTER_OFFER'),
        description : this.i18n.t('test.NOTIFICATION.BUYER_SEND_COUNTEROFFER'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : booking.sellerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: booking.seller.type,
        metaData : {
          type : NotificationStatus.BOOKING,
          bookingId : booking.id
        },
      })
    }
    await this.bookingRepository.save(booking);
    return new ResponseSuccess(this.i18n.t('test.BOOKING.COUNTER_OFFER_SEND'));
   

  }

  async completeProcess(
    completeProcessDto: CompleteProcessDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const {
      bookingId,
      images,
    } = completeProcessDto;

 
    const booking = await this.bookingRepository.findOne({
      where: [
        { id:bookingId, buyerId: user.id, isDeleted:false },
        { id:bookingId, sellerId: user.id, isDeleted:false },
      ],
      relations:{
        buyer : true,
        seller : true
      }
    });

    if (!booking) {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
    }

    if (booking.status == 'Amidst-Cancellation' || booking.status == 'Cancelled') {
      throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_SEND_COMPLETION_REQUEST'));
    }

    booking.completionProof = images.map((doc) => {
      const document = new CompletionProof();
      document.type = FileType.png ?? FileType.jpg;
      document.url = doc;
      return document;
    });
    booking.completionProcess = CompletionProcess.PENDING;
    booking.status = BookingStatus.AMIDST_COMPLETION_PROCESS;
    const userType = req.headers['user-type'];
    if (userType === 'SELLER') {
      booking.completeByType = UserType.SELLER;

      await this.fcmService.saveNotification({
        deviceToken : booking?.buyer?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.MARK_BOOKING'),
        description : this.i18n.t('test.NOTIFICATION.MARK_JOB_COMPLETE'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : booking.buyerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: booking.buyer.type,
        metaData : {
          type : NotificationStatus.BOOKING,
          bookingId : booking.id
        },
      })

    }else{
      booking.completeByType = UserType.BUYER;

      await this.fcmService.saveNotification({
        deviceToken : booking?.seller?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.MARK_BOOKING'),
        description : this.i18n.t('test.NOTIFICATION.BUYER_MARK_BOOKING_COMPLETE'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : booking.sellerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: booking.seller.type,
        metaData : {
          type : NotificationStatus.BOOKING,
          bookingId : booking.id
        },
      })
    }
    await this.bookingRepository.save(booking);
    return new ResponseSuccess(this.i18n.t('test.BOOKING.COMPLETION_PROCESS_UPDATE'));
  }

  async updateRequest(id: number, updateRequestDto:UpdateRequestDto, req: any): Promise<any> {
      const { user } = req;
      const {
        type,
        status
      } = updateRequestDto;
      const userType = req.headers['user-type'];
  
      const booking = await this.bookingRepository.findOne({
        where: [
          { id, buyerId: user.id, isDeleted:false },
          { id, sellerId: user.id, isDeleted:false },
        ],
        relations:{
          buyer:true,
          seller:true
        }
      });
  
      if (!booking) {
        throw new BadRequestException(this.i18n.t('test.BOOKING.NOT_FOUND'));
      }

      if(type === 'Cancel' && booking.status === BookingStatus.AMIDST_CANCELLATION){
        if (status === 'Accepted') {
          booking.settlementStatus = SettlementStatus.ACCEPTED;
          booking.status = BookingStatus.CANCELLED;
          if(booking.counterAmountProposed){
            booking.settlementAmount = booking.counterAmountProposed;
            booking.refundAmount = booking.price - booking.counterAmountProposed;
          }else{
            booking.settlementAmount = booking.settlementAmountProposed;
            booking.refundAmount = booking.price - booking.settlementAmountProposed;
          }
          
          if(userType === 'BUYER'){
            await this.fcmService.saveNotification({
              deviceToken : booking?.seller?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_ACCEPTED'),
              description : this.i18n.t('test.NOTIFICATION.ACCEPT_SETTLEMENT'),    
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.sellerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.seller.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }else{
            await this.fcmService.saveNotification({
              deviceToken : booking?.buyer?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_ACCEPTED'),
              description : this.i18n.t('test.NOTIFICATION.ACCEPT_SETTLEMENT'),    
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.buyerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.buyer.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }
         
        }else{
          booking.settlementStatus = SettlementStatus.REJECTED;

          if(userType === 'BUYER'){
            await this.fcmService.saveNotification({
              deviceToken : booking?.seller?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_REJECTED'),
              description : this.i18n.t('test.NOTIFICATION.REJECT_SETTLEMENT'),     
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.sellerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.seller.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }else{
            await this.fcmService.saveNotification({
              deviceToken : booking?.buyer?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_REJECTED'),
              description : this.i18n.t('test.NOTIFICATION.REJECT_SETTLEMENT'),    
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.buyerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.buyer.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }
  
        }
        await this.bookingRepository.save(booking);
        return new ResponseSuccess(this.i18n.t('test.BOOKING.STATUS_UPDATED'));
      }else if(type === 'Complete' && booking.status === BookingStatus.AMIDST_COMPLETION_PROCESS){
        if (status === 'Accepted') {
          booking.completionProcess = CompletionProcess.ACCEPTED;
          booking.status = BookingStatus.COMPLETED;
          booking.settlementAmount = booking.price;

          // completedJob/Service count set to user
          user.totalCompletedJobs += 1;
          await this.userRepository.save(user);

          if(userType === 'BUYER'){
            await this.fcmService.saveNotification({
              deviceToken : booking?.seller?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_ACCEPTED'),
              description : this.i18n.t('test.NOTIFICATION.ACCEPT_SETTLEMENT'),     
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.sellerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.seller.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }else{
            await this.fcmService.saveNotification({
              deviceToken : booking?.buyer?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_ACCEPTED'),
              description : this.i18n.t('test.NOTIFICATION.ACCEPT_SETTLEMENT'),    
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.buyerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.buyer.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }
        }else{
          booking.completionProcess = CompletionProcess.REJECTED;
          if(userType === 'BUYER'){
            await this.fcmService.saveNotification({
              deviceToken : booking?.seller?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_REJECTED'),
              description : this.i18n.t('test.NOTIFICATION.REJECT_SETTLEMENT'),     
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.sellerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.seller.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }else{
            await this.fcmService.saveNotification({
              deviceToken : booking?.buyer?.deviceToken ?? '',
              deviceType : '',
              title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_REJECTED'),
              description : this.i18n.t('test.NOTIFICATION.REJECT_SETTLEMENT'),    
              type : NotificationType.SYSTEM_GENERATED,
              recieverId : booking.buyerId,
              senderId : user?.id,
              senderType: user.type,
              receiverType: booking.buyer.type,
              metaData : {
                type : NotificationStatus.BOOKING,
                bookingId : booking.id
              },
            })
          }
        }
        await this.bookingRepository.save(booking);
        return new ResponseSuccess(this.i18n.t('test.BOOKING.STATUS_UPDATED'));
      }else if(booking.status === BookingStatus.COMPLETED){
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_ALREADY_COMPLETED'));
      } else if(booking.status === BookingStatus.ONGOING){
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_IS_ONGOING_STATE'));
      }else if(booking.status === BookingStatus.IN_DISPUTE){
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_DISPUTED'));
      }else if(booking.status === BookingStatus.CANCELLED){
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_CANCELED'));
      }else {
        throw new BadRequestException(this.i18n.t('test.BOOKING.Not_A_VALID_TYPE'));
      } 
  }

  async getBookingsList(listBookingApiDto: ListBookingApiDto, req: any): Promise<any> {
    const { user } = req;
    const {
      type='Active',
      skip = 1,
      limit = 10,
      searchTerm = '',
      filterBy='',
      sorting = 'all'
    } = listBookingApiDto;

    const query = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.buyer', 'user')
      .addSelect([
        'user.id',
        'user.fullName',
        'user.avatar'
      ])
      .leftJoin('booking.seller', 'seller')
      .addSelect([
        'seller.id',
        'seller.fullName',
        'seller.avatar'
      ])
      .leftJoinAndSelect('booking.documents', 'document')
      .leftJoinAndSelect('booking.images', 'booking_image')
      .leftJoinAndSelect('booking.category', 'category')
      .leftJoinAndSelect('booking.country', 'country')
      .leftJoin('booking.tags', 'tags')
      .addSelect(['tags.id', 'tags.name'])
      .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false });

      const userType = req.headers['user-type'];
      if (userType === 'SELLER') {
        query.andWhere('booking.sellerId = :sellerId', { sellerId: user.id }); 
      } else {
        query.andWhere('booking.buyerId = :buyerId', { buyerId: user.id }); 
      }

      if (searchTerm) {
        query.andWhere(
          new Brackets(qb => {
            qb.where('booking.id LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
          })
        );
      }

     if(type === 'Active'){
       query.andWhere('booking.status IN (:...statuses)', { statuses: ['Pending', 'Ongoing', 'Amidst-Cancellation', 'Amidst-Completion-Process', 'In-dispute'] });
     }else if(type === 'Completed'){
       query.andWhere('booking.status = :status', { status: 'Completed' });
     }else if(type === 'Cancelled'){
       query.andWhere('booking.status = :status', { status: 'Cancelled' });
     }

      // Add filter
      if (filterBy) {
        query.andWhere('booking.status = :status', { status: filterBy }); 
      }
      switch (sorting) {
        case 'old_to_new':
          query.orderBy('booking.created', 'ASC');
          break;
        case 'new_to_old':
          query.orderBy('booking.created', 'DESC');
          break;
        default:
          query.orderBy('booking.created', 'DESC');
          break;
      }

      // if pagination then add skip and limit
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);

      query.skip((perPage - 1) * limit).take(limit)

      // get count
      const total = await query.getCount();
      
      // get records
      const records = await query.getMany();
      const response = {
        totalPage : Math.ceil(total / limit),
        total,
        records,
      };

    return new ResponseSuccess(this.i18n.t('test.BOOKING.LIST'), response);
  }

  async allStatistics(): Promise<any> {
    const matchCriteria = {
      isDeleted : false, 
      isSuspended : false,
      type : In([UserType.SELLER, UserType.BUYER])
    }

    const otherMatchCriteria = {
      isDeleted : false, 
      isSuspended : false,
    }

    const totalUsers = await this.userRepository.count({where: { ...matchCriteria }});

    const totalSum = await this.bookingRepository
    .createQueryBuilder('booking')
    .select('SUM(booking.totalAmount)', 'totalSum')
    .where('booking.status = :status', { status: BookingStatus.COMPLETED })
    .andWhere(otherMatchCriteria)
    .getRawOne();

    const mostBookedCategoryName = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('category.id', 'categoryId')
      .addSelect('category.title', 'categoryName')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .innerJoin('booking.category', 'category')
      .where('booking.status = :status', { status: BookingStatus.COMPLETED })
      .andWhere(otherMatchCriteria) 
      .groupBy('category.id') 
      .orderBy('bookingCount', 'DESC') 
      .addOrderBy('category.created', 'DESC')
      .limit(1)
      .getRawOne();

      const leastBookedCategory = await this.bookingRepository
          .createQueryBuilder('booking')
          .select('category.id', 'categoryId')
          .addSelect('category.title', 'categoryName')
          .addSelect('COUNT(booking.id)', 'bookingCount')
          .innerJoin('booking.category', 'category')
          .where('booking.status = :status', { status: BookingStatus.COMPLETED })
          .andWhere(otherMatchCriteria)
          .groupBy('category.id')
          .orderBy('bookingCount', 'ASC') // First order by booking count (ascending)
          .addOrderBy('category.created', 'ASC') // If counts are the same, order by createdAt (ascending)
          .limit(1)
          .getRawOne();


        const mostBookedSellerByBuyer = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('buyer.id', 'buyerId')
        .addSelect('buyer.fullName', 'fullName')
        .addSelect('COUNT(booking.id)', 'bookingCount')
        .innerJoin('booking.buyer', 'buyer')  // Join with the buyer
        .innerJoin('booking.seller', 'seller')  // Join with the seller
        .where('booking.status = :status', { status: BookingStatus.COMPLETED })  // Filter for completed bookings
        .groupBy('buyer.id')  // Group by buyer to count bookings per buyer
        .orderBy('bookingCount', 'DESC')  // Order by booking count in descending order to get the top buyer
        .limit(1)  // Limit the result to the buyer with the most bookings
        .getRawOne();

        const mostCompleteJobBySeller = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('buyer.id', 'buyerId')
        .addSelect('buyer.fullName', 'fullName')
        .addSelect('COUNT(booking.id)', 'bookingCount')
        .innerJoin('booking.buyer', 'buyer')  // Join with the buyer
        .innerJoin('booking.seller', 'seller')  // Join with the seller
        .where('booking.status = :status', { status: BookingStatus.COMPLETED })  // Filter for completed bookings
        .groupBy('buyer.id')  // Group by buyer to count bookings per buyer
        .orderBy('bookingCount', 'DESC')  // Order by booking count in descending order to get the top buyer
        .limit(1)  // Limit the result to the buyer with the most bookings
        .getRawOne();

        const maxPaymentRCBySeller = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('seller.id', 'sellerId')
        .addSelect('seller.fullName', 'sellerfullName')
        .addSelect('COUNT(booking.id)', 'completedJobCount')
        .addSelect('SUM(booking.totalAmount)', 'totalAmount')  // Calculate sum of total amount
        .innerJoin('booking.seller', 'seller')  // Join with the seller
        .where('booking.status = :status', { status: BookingStatus.COMPLETED })  // Filter for completed bookings
        .andWhere('booking.isSettled = true')  // Filter where settlement is true
        .groupBy('seller.id')  // Group by seller to count completed jobs per seller
        .orderBy('completedJobCount', 'DESC')  // Order by job count in descending order to get the top seller
        .limit(1)  // Limit to the seller with the most completed jobs
        .getRawOne();

        const highestBooking = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('seller.id', 'sellerId')
        .addSelect('seller.fullName', 'sellerfullName')
        .addSelect('COUNT(booking.id)', 'totalBookings')  // Count total bookings for each seller
        .innerJoin('booking.seller', 'seller')  // Join with the seller
        .groupBy('seller.id')  // Group by seller to count bookings per seller
        .orderBy('totalBookings', 'DESC')  // Order by total bookings in descending order
        .limit(1)  // Limit to the seller with the highest number of bookings
        .getRawOne();
      
    const ObjResp = {
      totalUsers: totalUsers,
      totalRevenue: Number(totalSum?.totalSum),
      totalReviews: await this.reviewRepository.count({where: {...otherMatchCriteria, }}),
      totalBookings: await this.bookingRepository.count({where: {...otherMatchCriteria }}),
      totalActiveBookings: await this.bookingRepository.count({where: {...otherMatchCriteria, status: BookingStatus.ONGOING}}),
      totalCanceledBookings: await this.bookingRepository.count({where: {...otherMatchCriteria, status: BookingStatus.CANCELLED }}),
      mostBookedCategory: mostBookedCategoryName?.categoryName ?? 'N/A',
      leastBookedCategory: leastBookedCategory?.categoryName ?? 'N/A',
      highestBooking: highestBooking?.sellerfullName ?? 'N/A',
      totalPayments: Number(totalSum?.totalSum),
      maxPaymentRCBySeller: maxPaymentRCBySeller?.sellerfullName ?? 'N/A' ,
      mostCompleteJobBySeller: mostCompleteJobBySeller?.fullName ?? 'N/A',
      mostBookedSellerByBuyer: mostBookedSellerByBuyer?.fullName ?? 'N/A',
      totalSellers: await this.userRepository.count({where: { ...matchCriteria, type: UserType.SELLER }}),
      totalBuyers: await this.userRepository.count({where: { ...matchCriteria, type: UserType.BUYER }}),
    };

    return new ResponseSuccess('DASHBOARD', {...ObjResp});
  }

  async addMilestone(
    addMilestone: addMilestoneDto
  ): Promise<any> {
    const {
      milestoneId,
      bookingId,
      title,
      description,
      startDate,
      endDate,

    } = addMilestone;

    if(milestoneId){
      const booking = await this.bookingRepository.findOne({
        where:  { id: bookingId, isDeleted:false },
      });

      if (!booking) {
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_NOT_FOUND'));
      }
      const milestone = await this.milestoneRepository.findOne({
        where:  { id: milestoneId, isDeleted:false },
      });

      if (!milestone) {
        throw new BadRequestException(this.i18n.t('test.SERVICE.MILESTONE.NOT_FOUND'));
      }
      // update code
      milestone.title = title;
      milestone.description = description;
      milestone.startDate = startDate;
      milestone.endDate = endDate;

      await this.milestoneRepository.save(milestone)
      return new ResponseSuccess(this.i18n.t('test.SERVICE.MILESTONE.UPDATED'));
    }else{

      const booking = await this.bookingRepository.findOne({
        where:  { id: bookingId, isDeleted:false },
      });

      if (!booking) {
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_NOT_FOUND'));
      }

      // create code
      const milestone = new Milestone();
      milestone.title = title;
      milestone.bookingId = booking.id;
      milestone.booking = booking;
      milestone.description = description;
      milestone.startDate = startDate;
      milestone.endDate = endDate;

      await this.milestoneRepository.save(milestone)

      return new ResponseSuccess(this.i18n.t('test.SERVICE.MILESTONE.ADDED'));
    }
  }

  async deleteMilestone(
    id: number
  ): Promise<any> {
   
    const milestone = await this.milestoneRepository.findOne({
      where: {
        id
      },
    });
    if (!milestone) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.MILESTONE.NOT_FOUND'));
    }
    await this.milestoneRepository.delete(id);
    return new ResponseSuccess(this.i18n.t('test.SERVICE.MILESTONE.DELETED'), {});
  }

  async addReview(
    addReview: addReviewDto,
    req: any,
  ): Promise<any> {
    const { user } = req;
    const {
      bookingId,
      rating,
      review
    } = addReview;
      const booking = await this.bookingRepository.findOne({
        where:  { id: bookingId, isDeleted:false },
        relations : {
          buyer : true,
          seller : true
        }
      });

      if (!booking) {
        throw new BadRequestException(this.i18n.t('test.BOOKING.BOOKING_NOT_FOUND'));
      }

      if (booking.status !== 'Completed') {
        throw new BadRequestException(this.i18n.t('test.BOOKING.COMPLETE_BOOKING_CAN_REVIEW'));
      }

      if (user.type === 'SELLER') {
        throw new BadRequestException(this.i18n.t('test.BOOKING.CUSTOMER_CAN_REVIEW'));
      }

      const reviews = await this.reviewRepository.findOne({
        where: {
          bookingId,
          isDeleted:false
        },
      });

      if(reviews){
        throw new BadRequestException(this.i18n.t('test.BOOKING.ALRADY_REWVIEWD'));
      }

      // create code
      const reviewData = new UserReviews();
      reviewData.totalStar = rating;
      reviewData.bookingId = booking.id;
      reviewData.booking = booking;
      reviewData.reviewMessage = review;
      reviewData.toId = booking.sellerId;
      reviewData.fromId = user.id;
      await this.reviewRepository.save(reviewData);
      // Save key in booking
      booking.isRated = true;
      await this.bookingRepository.save(booking);

      // Save avgRating in user
      const allRating = await this.reviewRepository.find({ where : { toId : booking.sellerId, isDeleted : false, isSuspended:false }})
      const ratings:any = allRating.map(a=> a.totalStar)
    
      const total = ratings.reduce((sum:any, rating:any) => sum + rating, 0);
      const seller = await this.userRepository.findOne({ where : { id : booking.sellerId, isDeleted : false, isSuspended:false }})
      seller.avgRating = total / ratings.length;;
      seller.totalRating = total;
      await this.userRepository.save(seller);

      await this.fcmService.saveNotification({
        deviceToken : booking?.seller?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.REVIEW_SUBMITED'),
        description : this.i18n.t('test.NOTIFICATION.BUYER_SUBMIT_REVIEW_RATING'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : booking.sellerId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: booking.seller.type,
        metaData : {
          type : NotificationStatus.BOOKING,
          bookingId : booking.id
        },
      })

      // Send push to admin
      await this.fcmService.saveNotification({
        deviceToken : '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.NEW_REVIEW_RECIEVED'),
        description : `You have new reviews received from(${user.fullName})`,    
        type : NotificationType.BROADCAST,
        status : NotificationStatus.NEW_REVIEW_ADDED,
        receiverId : 1,
        senderType: user.type,
        receiverType: UserType.ADMIN,
        metaData : {
          type : NotificationStatus.BOOKING,
          bookingId : booking.id
        },
      })


      return new ResponseSuccess(this.i18n.t('test.BOOKING.REVIEW_ADDED'));
    
  }
}
