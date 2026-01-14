import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess, ResponseWarn } from 'common/dto';
import {
  Service,
  User,
  Country,
  Category,
  Tag,
  Document,
  Images,
  AdminSetting,
  ServiceBids,
  ConnectTransaction,
  Booking,
  ChatRequest
} from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository, In, Brackets, Not } from 'typeorm';
import {
  ListServiceDto,
  AddUpdateServiceDto,
  AddBidDto,
  WithdrawBidDto,
  UserIdDto,
} from './dto';
import {
  BidStatus,
  FileType,
  NotificationStatus,
  NotificationType,
  RequestStatus,
  ServiceType,
  WalletTransactionType,
} from 'common/enums';
import { ListBidDto } from './dto/listBid.dto';
import { DetailsBidDto } from './dto/detailsBid.dto';
import { ServiceStatusType } from 'common/enums/serviceStatus.enum';
import { UpdateStatusDto } from './dto/updateBidStatus.dto';
import { UpdateJOBStatusDto } from './dto/updateJobStatus.dto';
import { FcmService } from 'common/utils';
import { BookingsLibService } from '@app/booking-lib';
@Injectable()
export class ServiceLibService {
  constructor(
    private readonly bookingLibService: BookingsLibService,
    private readonly fcmService: FcmService,
    @InjectRepository(Images) private imagesRepository: Repository<Images>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Country) private countryRepository: Repository<Country>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AdminSetting)
    private adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(ServiceBids)
    private bidRepository: Repository<ServiceBids>,
    @InjectRepository(ConnectTransaction)
    private connectTransactionRepository: Repository<ConnectTransaction>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(ChatRequest) private chatRequestRepository: Repository<ChatRequest>,
    private readonly i18n: I18nService,
  ) {}

  async getServicesList(
    listServiceDto: ListServiceDto,
    req: any,
  ): Promise<any> {
    const {
      skip = 1,
      limit = 10,
      searchTerm = '',
      countryId = '',
      sallary = '',
      responseTime = '',
      sorting = 'all',
      categoryId,
      tagId,
      userId
    } = listServiceDto;

    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    let connectRequiredForBid = 20; // default
    if (adminSetting?.connectRequiredForBid) {
      connectRequiredForBid = adminSetting.connectRequiredForBid;
    }

    const query = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoin('service.user', 'user')
      .addSelect([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.bio',
        'user.responseTime',
        'user.category',
        'user.avgRating',
      ])
      .leftJoin('user.category', 'userCategory')
      .addSelect(['userCategory.id', 'userCategory.title'])
      .leftJoinAndSelect('service.documents', 'document')
      .leftJoinAndSelect('service.images', 'service_image')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.country', 'country')
      .leftJoinAndSelect('service.tags', 'tags')
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false });

    const userType = req.headers['user-type'];
    if (userType === 'SELLER') {
      query.andWhere('service.type = :type', { type: ServiceType.JOB })
      if(!userId){
        query.andWhere('service.status = :status', { status: ServiceStatusType.OPEN })
      }else{
        query.andWhere('service.status != :status', { status: ServiceStatusType.BOOKED })
            .andWhere('service.status != :status', { status: ServiceStatusType.CLOSED }); // then Show All Job
      }
    } else {
      query.andWhere('service.type = :type', { type: ServiceType.SERVICE }); // then Show All Services
    }

    if (searchTerm) {
      query.andWhere(
        new Brackets(qb => {
          qb.where('service.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
            .orWhere('userCategory.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
            .orWhere('category.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
            .orWhere('tags.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
            .orWhere('user.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
        })
      );
    }

    // Add tag filter
    if (tagId) {
      query.andWhere('tags.id = :tagId', { tagId: tagId });
    }

    // Add category filter
    if (categoryId) {
      query.andWhere('service.categoryId = :categoryId', {
        categoryId: Number(categoryId),
      });
    }


    // Add country filter
    if (countryId) {
      query.andWhere('country.id = :countryId', { countryId });
    }

    // Add sallary filter
    if (sallary) {
      const [minPrice, maxPrice] = sallary.split('-').map(Number);
      if (userType === 'SELLER') {
        query.andWhere(
          'service.minPrice >= :minPrice AND service.maxPrice <= :maxPrice',
          { minPrice, maxPrice },
        );
      } else {
        query.andWhere(
        'service.price >= :minPrice AND service.price <= :maxPrice',
        { minPrice, maxPrice },
      );
      }
     
    }

    // Add response time filter
    if (responseTime) {
      query.andWhere('user.responseTime <= :responseTime ', {
        responseTime: responseTime,
      });
    }

    if (userType === 'SELLER') {
      switch (sorting) {
        case 'low_to_high':
          query.orderBy('service.minPrice', 'ASC');
          break;
        case 'high_to_low':
          query.orderBy('service.minPrice', 'DESC');
          break;
        default:
          query.orderBy('service.created', 'DESC');
          break;
      }
    } else {
      switch (sorting) { // price for service added for buyer in mb
        case 'low_to_high':
          query.orderBy('service.price', 'ASC');
          break;
        case 'high_to_low':
          query.orderBy('service.price', 'DESC');
          break;
        default:
          query.orderBy('service.created', 'DESC');
          break;
      }
    }


    // if pagination then add skip and limit
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit);

    // get count
    const total = await query.getCount();
    
    // get records
    const result = await query.getMany();

    const records = await Promise.all(
      result.map(async rawUser => {
        const existData = await this.bidRepository.findOne({ 
          where: {
            serviceId: rawUser.id,
            ...(userId ? { 
              userId: Number(userId),
              type: Not(BidStatus.WITHDRAWN)  // if withdrawn then available for again bid 
            } : {}),
          }
        });

        return {
          ...rawUser,
          connectForBid: connectRequiredForBid,
          isBided: (userId && existData) ? true : false, 
        };
      })
    );    

    const response = {
      total,
      records,
    };

    return new ResponseSuccess(
      this.i18n.t('test.SERVICE.ALL_SERVICES'),
      response,
    );
  }

  async myServicesList(listServiceDto: ListServiceDto, req: any): Promise<any> {
    const { user } = req;
    const {
      skip = 1,
      limit = 10,
      searchTerm = '',
      sorting = 'all',
      categoryId,
      tagId,
      filter
    } = listServiceDto;

    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.documents', 'document')
      .leftJoinAndSelect('service.images', 'service_image')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.country', 'country')
      .leftJoinAndSelect('service.tags', 'tags')
      .where('service.user = :id', { id: user.id })
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false });
  
    switch (sorting) {
      case 'new_to_old':
        query.orderBy('service.created', 'DESC');
        break;
      case 'old_to_new':
        query.orderBy('service.created', 'ASC');
        break;
      default:
        query.orderBy('service.created', 'DESC');
    }

    switch (sorting) {
      case 'high_to_old':
        query.orderBy('service.created', 'DESC');
        break;
      case 'low_to_high':
        query.orderBy('service.created', 'ASC');
        break;
      default:
        query.orderBy('service.created', 'DESC');
    }

    switch (filter) {
      case 'open':
        query.andWhere('service.status = :status', { status: ServiceStatusType.OPEN });
        break;
      case 'closed':
        query.andWhere('service.status = :status', { status: ServiceStatusType.CLOSED });
        break;
      case 'booked':
        query.andWhere('service.status = :status', { status: ServiceStatusType.BOOKED });
        break;
      case 'ongoing':
        query.andWhere('service.status = :status', { status: ServiceStatusType.ONGOING });
        break;  
      default:
    }

    const serviceType = user.type === 'SELLER' ? ServiceType.SERVICE : ServiceType.JOB;
    query.andWhere('service.type = :type', { type: serviceType });
  
    if (searchTerm) {
      query.andWhere('service.title LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }
  
    if (tagId) {
      query.andWhere('tags.id = :tagId', { tagId });
    }

    // Add category filter
    if (categoryId) {
      query.andWhere('service.categoryId = :categoryId', {
        categoryId: Number(categoryId),
      });
    }
  
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit);

  //get count
    const total = await query.getCount();
  
    const records = await query.getMany();
  
    const res = records.map(result => ({
      ...result,
      recievedBid: result?.recievedBid ?? 0
    }));
  
    return new ResponseSuccess(
      this.i18n.t('test.SERVICE.ALL_SERVICES'),
      { total, records: res }
    );
  }

  async getService(id: number, userIdDto: UserIdDto, req: any): Promise<any> {
    const {
      userId,
    } = userIdDto;
    let isChatConnected = false;
    let isChatRequested = false;
    const serviceData = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoin('service.user', 'user')
      .addSelect([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.city',
        'user.state',
        'user.country',
        'user.category',
        'user.bio',
        'user.avgRating'
      ])
      .leftJoin('user.category', 'userCategory')
      .addSelect(['userCategory.id', 'userCategory.title'])
      .leftJoin('user.state', 'userState')
      .addSelect(['userState.id', 'userState.stateName'])
      .leftJoin('user.country', 'userCountry')
      .addSelect(['userCountry.id', 'userCountry.countryName'])
      .leftJoinAndSelect('service.documents', 'document')
      .leftJoinAndSelect('service.images', 'service_image')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.country', 'country')
      .leftJoin('service.tags', 'tags')
      .addSelect(['tags.id', 'tags.name'])
      .andWhere('service.id = :id', { id: id })
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!serviceData) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.NOT_FOUND'));
    }

    let query = await this.serviceRepository
      .createQueryBuilder('service')
      .select([
        'service.id',
        'service.title',
        'service.price',
        'service.minPrice',
        'service.maxPrice',
        'service.priceRange',
        'service.status',
        'service.description',
        'service.created',
      ])
      .leftJoinAndSelect('service.country', 'country')
      .leftJoin('service.tags', 'tags')
      .addSelect(['tags.id', 'tags.name'])
      .leftJoinAndSelect('service.bidList', 'service_bids')
      .andWhere('service.id != :id', { id: id })
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false });

    const userType = req.headers['user-type'];
    if (userType === 'SELLER') {
      query.andWhere('service.type = :type', { type: ServiceType.JOB })
      .andWhere('service.status != :status', { status: ServiceStatusType.BOOKED })
      .andWhere('service.status != :status', { status: ServiceStatusType.CLOSED }); // then Show All Job
    } else {
      query.andWhere('service.type = :type', { type: ServiceType.SERVICE }); // then Show All Services
    }

    // if add skip and limit 5
    query = query.offset(0).limit(5);

    // get bid Services
    let bidResponse = [];
    if (userType === 'BUYER') {
      const bidService = await this.bidRepository.find({
        where: { 
          serviceId: id, 
          isDeleted: false,
          type: Not(BidStatus.WITHDRAWN) // added for not list of withdrawn
        },
          relations: {
            user: {
              category: true,
              country: true
            }
          },
          select: {
            user: {
              id: true,
              type: true,
              fullName: true,
              avatar: true,
            },
          },
          order: {
            created: "DESC",
          }
      });
      if(userId && bidService.length > 0){
        const userRequestData = await this.chatRequestRepository.find({
          where: {
            isDeleted: false, 
            buyerId: userId, 
            status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]),
        }});
        // connect and pending list
        const { pendingUserIds, connectedUserIds } = userRequestData.reduce((acc, d) => {
          if (d.sellerId) {
            if (d.status === RequestStatus.ACCEPT) {
              acc.connectedUserIds.push(d.sellerId);
            } else if (d.status === RequestStatus.PENDING) {
              acc.pendingUserIds.push(d.sellerId);
            }
          }
          return acc;
        }, { pendingUserIds: [], connectedUserIds: [] });
          // for key udapte
          bidResponse = bidService.map(result => {
            const connectedUser = connectedUserIds.includes(result.userId);  // Check if userId is in connectedUserIds
            const requestedUser = pendingUserIds.includes(result.userId);    // Check if userId is in pendingUserIds
            
            return {
              ...result,
              isChatConnected: connectedUser,   // Boolean indicating connection status
              isChatRequested: requestedUser    // Boolean indicating request status
            };
          });
      }
    }

    // If userId Exist
    let isBookingCreated = false;
    if(userId){
      const bookingData = await this.bookingRepository.findOne({
        where: {
          buyerId:userId,
          serviceId:id,
          isDeleted:false
        },
      });
      if(bookingData){
        isBookingCreated =true;
      }
    }

    let isBided = false;
    if(userId){
      const biddingData = await this.bidRepository.findOne({
        where: {
          serviceId: id, 
          isDeleted: false,
          userId:userId
        },
      });
      if(biddingData){
        isBided =true;
      }
    }

    const otherServices = await query.getMany();
    let otherRes = [];
    if(userId && otherServices.length > 0){
      otherRes = otherServices.map(result=>{
        const bidUser = result?.bidList?.filter(a => a.userId == userId).length;
        delete result?.bidList;
        return {
          ...result,
          isBided: !!bidUser // Convert to boolean directly
        };
     });
    }

    // buyer history
    let bquery = await this.bookingRepository
    .createQueryBuilder('booking')
    .select([
      'booking.id',
      'booking.title',
      'booking.serviceId',
      'booking.offerId',
      'booking.price',
      'booking.platformFee',
      'booking.totalAmount',
      'booking.created',
    ])
    .leftJoin('booking.buyer', 'user')
    .addSelect([
      'user.id',
      'user.fullName',
      'user.avatar'
    ])
    .andWhere('booking.serviceId = :serviceId', { serviceId: id })
    .andWhere('booking.status = :status', { status: 'Completed' })
    .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false });

    // if add skip and limit 5
    bquery = bquery.offset(0).limit(5);
    const buyerHistory = await bquery.getMany();

    // User chat
    if(userId){
      const toFavId =  serviceData.userId;
      const requestInfo = await this.chatRequestRepository.findOne({
        where: [
          {isDeleted: false, sellerId: userId, buyerId: toFavId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
          {isDeleted: false, buyerId: userId, sellerId: toFavId, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
        ],
      });

      if(requestInfo && requestInfo.status === RequestStatus.ACCEPT){
        isChatConnected = true;
      }

      if(requestInfo && requestInfo.status === RequestStatus.PENDING){
        isChatRequested = true;
      }
    }

    const result = {
      ...serviceData,
      isBookingCreated,
      isBided,
      isChatRequested,
      isChatConnected,
      others: otherRes,
      recievedBids : bidResponse,
      buyerHistory: buyerHistory
    };

    return new ResponseSuccess(this.i18n.t('test.SERVICE.INFO'), result);
  }

  async delete(id: number, req: any): Promise<any> {
    const { user } = req;
    const service = await this.serviceRepository.findOne({
      where: {
        id,
        user: user.id,
        isDeleted: false,
      },
    });

    if (!service) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.NOT_FOUND'));
    }
    if(service?.recievedBid > 0){
      throw new BadRequestException(this.i18n.t('test.SERVICE.SERVICE_NOT_DELETE'));
    }else{
       service.isDeleted = true;
    }
    await this.serviceRepository.save(service);
    return new ResponseSuccess(this.i18n.t('test.SERVICE.DELETED'));
  }

  async addUpdateService(
    addUpdateServiceDto: AddUpdateServiceDto,
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
    } = addUpdateServiceDto;

    if (id) {
      const service = await this.serviceRepository.findOne({
        where: { id, user: user.id, isDeleted: false },
      });

      if(service?.recievedBid > 0){
        throw new BadRequestException(this.i18n.t('test.SERVICE.SERVICE_CANT_EDIT'));
      }

      if (!service) {
        throw new BadRequestException(this.i18n.t('test.SERVICE.NOT_FOUND'));
      }

      if (countryId !== undefined) {
        service.country = await this.countryRepository.findOne({
          where: { id: countryId },
        });
      }

      if (categoryId !== undefined) {
        service.category = await this.categoryRepository.findOne({
          where: { id: categoryId },
        });
      }

      if (title !== undefined) {
        service.title = title;
      }

      if (description !== undefined) {
        service.description = description;
      }

      if (price) {
        service.price = price;
      }

      if(priceRange){
        service.priceRange = priceRange;
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if(minPrice){
          service.minPrice = minPrice;
        }
        if(maxPrice){
          service.maxPrice = maxPrice;
        }
      }

      if (tagIds !== undefined) {
        service.tags = await this.tagRepository.find({
          where: { id: In(tagIds) },
          order: {
            created: "DESC",
          }
        });
      }

      if (documents && documents.length) {
        await this.documentRepository.delete({ service: { id } });
        service.documents = documents.map((doc:any) => {
          const document = new Document();
          document.type = FileType.pdf;
          document.name = doc.name;
          document.url = doc.url;
          return document;
        });
      }

      if (images && images.length) {
        await this.imagesRepository.delete({ service: { id } });
        service.images = images.map((doc:any) => {
          const document = new Images();
          document.type = FileType.png ?? FileType.jpg;
          document.url = doc;
          return document;

        });
      }

      await this.serviceRepository.save(service);

      return new ResponseSuccess(this.i18n.t('test.SERVICE.UPDATED'));
    } else {
      const service = new Service();

      if(priceRange){
        service.priceRange = priceRange;
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if(minPrice){
          service.minPrice = minPrice;
        }
        if(maxPrice){
          service.maxPrice = maxPrice;
        }
      }

      service.user = user;
      service.title = title;
      service.description = description;
      service.category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      service.country = await this.countryRepository.findOne({
        where: { id: countryId },
      });
      service.price = price;
      // Fetch tags by IDs
      service.tags = await this.tagRepository.find({
        where: { id: In(tagIds) },
        order: {
          created: "DESC",
        }
      });
      service.documents = documents.map((doc : any) => {
        const document = new Document();
        document.type = FileType.pdf;
        document.name = doc.name;
        document.url = doc.url;
        return document;
      });

      service.images = images.map((doc:any) => {
        const document = new Images();
        document.type = FileType.png ?? FileType.jpg;
        document.url = doc;
        return document;
      });


      if (user.type === 'SELLER') {
        service.type = ServiceType.SERVICE;
      } else {
        service.type = ServiceType.JOB;
      }
      await this.serviceRepository.save(service);
      return new ResponseSuccess(this.i18n.t('test.SERVICE.ADDED'));
    }
  }

  async addBidOnJob(addBidDto: AddBidDto, req: any): Promise<any> {
    const { user } = req;
    const { bidAmount, serviceId, bidId } = addBidDto;

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, isDeleted: false },
      relations:{
        user : true
      }
    });

    if (service?.status === ServiceStatusType.BOOKED) {
      return new ResponseWarn(this.i18n.t("test.SERVICE.BID.BID_CANT_PLACE"), {});
    }

    if (service?.status === ServiceStatusType.CLOSED) {
      return new ResponseWarn(this.i18n.t("test.SERVICE.BID.BID_SEVICE_CLOSED"), {});
    }

    if(bidId){
      const bidService = await this.bidRepository.findOne({
        where: { id : bidId, serviceId: serviceId, userId : user.id, isDeleted: false },
      });

      if (bidService && bidService.type === BidStatus.WITHDRAWN) {
        return new ResponseWarn(this.i18n.t("test.SERVICE.BID.BID_CANT_WITHDRAWN"), {});
      }

      if (bidService && (!bidId)) {
        return new ResponseWarn(this.i18n.t("test.SERVICE.BID.BID_CANT_RAISED"), {});
      }

    }

    if (bidAmount > user.totalConnects) {
      return new ResponseWarn(
        this.i18n.t(
          'test.SERVICE.BID.INSUFFICIENT_CONNECT',
        ),
        {},
      );
    }



    if (!service) {
      return new ResponseWarn(this.i18n.t('test.SERVICE.NOT_FOUND'), {});
    } else if (bidId && service) { // for edit

      const bid = await this.bidRepository.findOne({ where: { id : bidId, userId : user.id, isDeleted: false } });
      if(!bid){
        return new ResponseWarn(this.i18n.t('test.SERVICE.NOT_FOUND'), {});
      }
      let msg = '';
      if(bid.remainRebidCount <= 0){
        msg = `test.SERVICE.BID.LIMIT_EXCEED`
        return new ResponseWarn(this.i18n.t(msg), {});
      }else{
        bid.bidAmount = bidAmount; // updated
  
        bid.remainRebidCount -= 1; // updated
        msg = `test.SERVICE.BID.UPDATED; ${bid.remainRebidCount} ${this.i18n.t('test.SERVICE.BID.EDIT_REMAINS')}`

        await this.fcmService.saveNotification({
          deviceToken : service?.user?.deviceToken ?? '',
          deviceType : '',
          title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_SUBMIT'),
          description : this.i18n.t('test.NOTIFICATION.RESUBMIT_BID'),    
          type : NotificationType.SYSTEM_GENERATED,
          recieverId : service.userId,
          senderId : user?.id,
          senderType: user.type,
          receiverType: service?.user?.type,
          metaData : {
            type : NotificationStatus.BID_SUBMIT,
            serviceId : service.id,
            bidId : bid.id
          },
        })
      }
      bid.type = BidStatus.PENDING;
      await this.bidRepository.save(bid);
      const txn = await this.connectTransactionRepository.findOne({ where: { serviceId : bid.serviceId, userId : user.id, bidId : bidId } });

      if(!txn){
        return new ResponseWarn(this.i18n.t('test.SERVICE.BID.NO_TXN_AVAILABLE'), {});
      }
      

      txn.amount = bidAmount; // updated
      await this.connectTransactionRepository.save(txn);

      return new ResponseSuccess(this.i18n.t(msg));
      
    } else {
      const adminSetting = await this.adminSettingRepository.findOne({
        where: { isDeleted: false },
      });
      let connectRequiredForBid = 20; // default
      if (adminSetting?.connectRequiredForBid) {
        connectRequiredForBid = adminSetting.connectRequiredForBid;
      }

      // bidcount on service
      service.recievedBid += 1;
      await this.serviceRepository.save(service);

      // bid saved
      const bid = this.bidRepository.create({
        service : service,
        serviceId : serviceId,
        user : user,
        bidAmount : bidAmount,
        connectUsed : connectRequiredForBid,
        type : BidStatus.PENDING
       })

      await this.bidRepository.save(bid);


      // bid txns
      const connectId = `txn_${user.id+serviceId}${new Date().valueOf()}`;
      const connect = new ConnectTransaction();
      connect.user = user;
      connect.userId = user.id;
      connect.bidId = bid.id;
      connect.transactionId = connectId;
      connect.service = service;
      connect.amount = bidAmount;
      connect.numberOfConnects = connectRequiredForBid ?? 20;
      connect.paymentStatus = 'paid';
      connect.type = WalletTransactionType.DEBIT;
      await this.connectTransactionRepository.save(connect);

      user.totalConnects -= connectRequiredForBid;
      await this.userRepository.save(user);

      await this.fcmService.saveNotification({
        deviceToken : service.user?.deviceToken ?? '',
        deviceType : '',
        title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_SUBMIT'),
        description : this.i18n.t('test.NOTIFICATION.SUBMIT_BID'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : service.userId,
        senderId : user?.id,
        senderType: user.type,
        receiverType: service?.user?.type,
        metaData : {
          type : NotificationStatus.BID_UPDATE,
          serviceId : service.id,
          bidId : bid.id
        },
      })

      return new ResponseSuccess(this.i18n.t('test.SERVICE.BID.RAISED'));
    }
  }

  async myBidList(listBidDto: ListBidDto, req: any): Promise<any> {
    const { user } = req;
    const {
      skip = 1,
      limit = 10,
      filter = 'all',
      searchTerm = ''
    } = listBidDto;

    const query = await this.bidRepository
      .createQueryBuilder('service_bids')
      .andWhere('service_bids.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('service_bids.type != :withdrawnType', { withdrawnType: BidStatus.WITHDRAWN })
      .andWhere('service_bids.userId = :userId', { userId: user.id })
      .leftJoinAndSelect('service_bids.service', 'service')
      .leftJoinAndSelect('service.documents', 'document')
      .leftJoinAndSelect('service.images', 'service_image')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.country', 'country')
      .leftJoinAndSelect('service.tags', 'tags')
      
      if (searchTerm) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('service.title LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
          }),
        );
      }


    switch (filter) {
      case 'accepted':
        query.andWhere('service_bids.type = :type', { type: BidStatus.ACCEPTED })
        break;
      case 'rejected':
        query.andWhere('service_bids.type = :type', { type: BidStatus.REJECTED })
        break;
      case 'pending':
        query.andWhere('service_bids.type = :type', { type: BidStatus.PENDING })
        break;
      default:
        query.andWhere('service_bids.isDeleted = :isDeleted', { isDeleted: false })
        break;
    }

    // get count
    const total = await query.getCount();

    query.orderBy('service_bids.created', 'DESC');

    // if pagination then add skip and limit
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit)

    // get records
    const records = await query.getMany();

    const res = records.map((result) => ({
      ...result
    }));

    const response = {
      total,
      records: res,
    };

    return new ResponseSuccess(
      this.i18n.t('test.SERVICE.ALL_SERVICES'),
      response,
    );
  }

  async myBidDetails(idBidDto: DetailsBidDto): Promise<any> {
    const {
      bidId
    } = idBidDto;

    const query = await this.bidRepository
      .createQueryBuilder('service_bids')
      .andWhere('service_bids.id = :id', { id: bidId })
      .andWhere('service_bids.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('service_bids.service', 'service')
      .leftJoinAndSelect('service.documents', 'document')
      .leftJoinAndSelect('service.images', 'service_image')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.country', 'country')
      .leftJoinAndSelect('service.tags', 'tags')
      .leftJoinAndSelect('service.user', 'user')
      .addSelect([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.city',
        'user.state',
        'user.country',
        'user.category',
      ])
      .leftJoin('user.category', 'userCategory')
      .addSelect(['userCategory.id', 'userCategory.title'])
      .leftJoin('user.state', 'userState')
      .addSelect(['userState.id', 'userState.stateName'])
      .leftJoin('user.country', 'userCountry')
      .addSelect(['userCountry.id', 'userCountry.countryName'])

    // get records
    const records = await query.getOne();

    const msg = records ? 'test.SERVICE.INFO' : 'test.SERVICE.NOT_FOUND';

    const getBidService = await this.bidRepository.findOne({ where : {
      id : bidId,
      isDeleted : false,
      isSuspended: false
    }})

    const getBooking = await this.bookingRepository.findOne({
      where : {
        serviceId : getBidService.serviceId,
        isDeleted : false,
        isSuspended: false
      }
    })

    return new ResponseSuccess(
      this.i18n.t(msg),  {...records,  bookingId : getBooking?.id}
    );
  }

  async deleteBid(idBidDto: DetailsBidDto, req: any): Promise<any> {
    const { user } = req;
    const {
      bidId
    } = idBidDto;
    const bid = await this.bidRepository.findOne({
      where: {
        id : bidId,
        user: user.id,
        isDeleted: false,
      },
    });
    if (!bid) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.NOT_FOUND'));
    }
    bid.isDeleted = true;
    await this.bidRepository.save(bid);

    return new ResponseSuccess(this.i18n.t('test.SERVICE.DELETED'));
  }

  async withdrawBidOnJob(withdrawBidDto: WithdrawBidDto, req: any): Promise<any> {
    const { user } = req;
    const {  bidId } = withdrawBidDto;

    const bid = await this.bidRepository.findOne({
      where: { id: bidId, userId : user.id, isDeleted: false },
    });

    if (!bid) {
      return new ResponseWarn(this.i18n.t('test.SERVICE.NOT_FOUND'), {});
    }

    bid.type = BidStatus.WITHDRAWN;

    await this.bidRepository.save(bid);

    const service = await this.serviceRepository.findOne({
      where: {
        id : bid.serviceId,
        isDeleted: false,
      },
      relations : {
        user : true
      }
    });

    if (!service) {
      throw new BadRequestException(this.i18n.t('test.SERVICE.NOT_FOUND'));
    }
    service.recievedBid -= 1;
    await this.serviceRepository.save(service);

    await this.fcmService.saveNotification({
      deviceToken : service?.user?.deviceToken ?? '',
      deviceType : '',
      title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_WITHDRAWN'),
      description : this.i18n.t('test.NOTIFICATION.WITHDRAW_BID'),    
      type : NotificationType.SYSTEM_GENERATED,
      recieverId : service.userId,
      senderId : user?.id,
      senderType: user.type,
      receiverType: service?.user?.type,
      metaData : {
        type : NotificationStatus.BID_UPDATE,
        serviceId : service.id,
        bidId : bid.id
      },
    })

    return new ResponseSuccess(this.i18n.t('test.SERVICE.BID.WITHDRAWN'));
  }

  async bidStatus(updateStatusDto: UpdateStatusDto, req: any): Promise<any> {
    const { user } = req;
    const {
      bidId,
      status,
      JobId
    } = updateStatusDto;

    const service = await this.serviceRepository.findOne({
      where: { 
        id: JobId, isDeleted: false,
        userId : user.id
      },
      relations:{
        user: true
      }
    });

    if (!service) {
      return new ResponseWarn(this.i18n.t("test.SERVICE.JOB.NOT_FOUND"), {});
    }

    if(status === 'ACCEPT') {
      const acceptedBid = await this.bidRepository.findOne({
        where: { 
          serviceId: service.id, 
          isDeleted: false,
          type: BidStatus.ACCEPTED
         },
         relations : {
          service : {
            user : true
          }
         }
      });
      if (acceptedBid) {
        return new ResponseWarn(this.i18n.t(`test.SERVICE.BID.ALREAYD_ACCEPTED`), {});
      } 
    } 

    if(bidId){
      const bid = await this.bidRepository.findOne({
        where: { 
          id : bidId, 
          serviceId: service.id, 
          isDeleted: false,
          type: BidStatus.PENDING
         },
         relations : {
          user : true
         }
      });
  
      if (!bid) {
        return new ResponseWarn(this.i18n.t("test.SERVICE.BID.NOT_FOUND"), {});
      }

      if(status === 'ACCEPT'){
        // Reject all bid after one accepts
          const recievedTotalbids = await this.bidRepository.find({
            where: { 
              serviceId: service.id, 
              isDeleted: false,
              userId: Not(user.id),
              type: BidStatus.PENDING
            }
          });
          if (recievedTotalbids.length > 0) {
            // Update all pending bids to REJECTED
            await this.bidRepository.update(
              { 
                serviceId: service.id, 
                isDeleted: false,
                userId: Not(user.id),
                type: BidStatus.PENDING 
              },
              { type: BidStatus.REJECTED }
            );
          }
        }
  
      bid.type = (status === 'ACCEPT') ? BidStatus.ACCEPTED : BidStatus.REJECTED ;
      await this.bidRepository.save(bid);

      await this.fcmService.saveNotification({
        deviceToken : bid?.user?.deviceToken ?? '',
        deviceType : '',
        title : (status === 'ACCEPT') ? this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_ACCEPTED') : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.BID_REJECTED'),
        description : (status === 'ACCEPT') ? this.i18n.t('test.NOTIFICATION.ACCEPT_BID') : this.i18n.t('test.NOTIFICATION.REJECT_BID'),    
        type : NotificationType.SYSTEM_GENERATED,
        recieverId : bid?.user?.id,
        senderId : user?.id,
        senderType: user.type,
        receiverType: service?.user?.type,
        metaData : {
          type : NotificationStatus.BID,
          serviceId : service.id,
          bidId : bid.id
        },
      })

    }

    if(status === BidStatus.ACCEPTED) {
      service.status = ServiceStatusType.ONGOING;
      await this.serviceRepository.save(service);
    }

    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    let platformFee = 0; //default
    if (adminSetting?.platformFee) {
      platformFee = adminSetting.platformFee;
    }

    if(status === 'ACCEPT'){
      await this.bookingLibService.createBookingFromService(user, service.id, platformFee)
    } 

    const msg = (status === 'ACCEPT') ? this.i18n.t(`test.SERVICE.BID.ACCEPTED`) : this.i18n.t(`test.SERVICE.BID.REJECTED`)

    return new ResponseSuccess(
      msg,
      {},
    );
  }

  async jobStatus(updateStatusDto: UpdateJOBStatusDto, req: any): Promise<any> {
    const { user } = req;
    const {
      status,
      JobId
    } = updateStatusDto;

    const service = await this.serviceRepository.findOne({
      where: { 
        id: JobId, isDeleted: false,
        userId : user.id,
      },
    });

    if (!service) {
      return new ResponseWarn(this.i18n.t("test.SERVICE.JOB.NOT_FOUND"), {});
    }

    service.status = (status === ServiceStatusType.CLOSED) ? ServiceStatusType.CLOSED : ServiceStatusType[status];

    await this.serviceRepository.save(service);

    return new ResponseSuccess(
      this.i18n.t(`Job Service ${status} successfully.`),
      {},
    );
  }
}
