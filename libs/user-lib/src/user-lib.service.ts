import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import {
  User,
  UserTag,
  Service,
  UserPortfolio,
  UserFaq,
  Category,
  Tag,
  Report,
  Notification,
  ServiceBids,
  Favorite,
  ChatRequest,
  Booking,
  UserReviews,
  AdminSetting,
  Chat
} from 'common/models';
import { I18nService } from 'nestjs-i18n';
import {
  Brackets,
  Like,
  Repository,
  In,
  IsNull,
  Not
} from 'typeorm';
import { AllReportDto, AllUserDto, ListFavoriteDto, ListUserDto, NotificationDTO } from './dto';
import { BidStatus, BookingStatus, NotificationStatus, NotificationType, NotificationUserType, ProfileStatus, RequestStatus, ServiceType, UserType } from 'common/enums';
import { reportDTO } from './dto/report.dto';
import { ServiceStatusType } from 'common/enums/serviceStatus.enum';
import { FcmService } from 'common/utils';
import { reviewListDTO } from './dto/reviewList.dto';

@Injectable()
export class UserLibService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Favorite)
    private userfavoriteRepository: Repository<Favorite>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserTag) private userTagRepository: Repository<UserTag>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(UserPortfolio)
    private userPortfolioRepository: Repository<UserPortfolio>,
    @InjectRepository(UserFaq) private userFAQRepository: Repository<UserFaq>,
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(ServiceBids)
    private serviceBidsRepository: Repository<ServiceBids>,
    @InjectRepository(ChatRequest)
    private chatRequestRepository: Repository<ChatRequest>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(UserReviews) private reviewRepository: Repository<UserReviews>,
    @InjectRepository(AdminSetting)
    private adminSettingRepository: Repository<AdminSetting>,
    private readonly fcmService: FcmService,
    private readonly i18n: I18nService,
  ) {}

  async list(listUserDto: ListUserDto, req: any): Promise<any> {
    const { user } = req;
    const {
      pagination = true,
      skip = 1,
      limit = 10,
      searchTerm = '',
      countryId = '',
      sallary = '',
      responseTime = '',
      sorting = 'all',
      categoryId,
      tagId,
    } = listUserDto;

    const userData = await this.userRepository.findOne({
      where: {
        id: user.id,
        isDeleted: false,
      },
      relations: ['favoriteUsers'],
    });
    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    const favoriteUserIds = [];
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.totalRating',
        'user.avgRating',
        'user.created',
        'user.priceRange',
        'user.minPrice',
        'user.maxPrice',
        'user.responseTime',
        'GROUP_CONCAT(DISTINCT tag.id) AS tag_ids',
        'GROUP_CONCAT(DISTINCT tag.name) AS tag_names',
      ])
      .leftJoin('user.country', 'country')
      .addSelect(['country.id', 'country.countryName'])
      .leftJoin('user.category', 'userCategory')
      .addSelect(['userCategory.id', 'userCategory.title'])
      .leftJoin('user_tag', 'ut', 'ut.userId = user.id')
      .leftJoin('tag', 'tag', 'ut.tagId = tag.id')
      .where(
        'user.isSuspended = false and user.isDeleted = false and user.isPhoneVerified = true and type ="SELLER"',
      )
      .groupBy('user.id');

    // Add the isFavourite case statement only if favoriteUserIds is not empty
    if (favoriteUserIds.length > 0) {
      query
        .addSelect(
          `(CASE WHEN user.id IN (:...favoriteUserIds) THEN true ELSE false END) AS isFavourite`,
        )
        .setParameter('favoriteUserIds', favoriteUserIds);
    } else {
      query.addSelect('false AS isFavourite');
    }

    // if search term not empty then apply search
    if (searchTerm) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.fullName LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('userCategory.title LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('tag.name LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
        }),
      );
    }

    // Add tag filter
    if (tagId) {
      query.andWhere('tag.id = :tagId', { tagId: tagId });
    }

    // Add category filter
    if (categoryId) {
      query.andWhere('userCategory.id = :categoryId', {
        categoryId: categoryId,
      });
    }

    // Add country filter
    if (countryId) {
      query.andWhere('country.id = :countryId', { countryId: countryId });
    }

    // Add sallary filter
    if (sallary) {
      const [minPrice, maxPrice] = sallary.split('-').map(Number);
      query.andWhere(
        'user.minPrice >= :minPrice AND user.maxPrice <= :maxPrice',
        { minPrice, maxPrice },
      );
    }

    // Add response time filter
    if (responseTime) {
      query.andWhere('user.responseTime <= :responseTime ', {
        responseTime: responseTime,
      });
    }

    // Sorting
    switch (sorting) {
      case 'low_to_high':
        query.orderBy('user.minPrice', 'ASC');
        break;
      case 'high_to_low':
        query.orderBy('user.maxPrice', 'DESC');
        break;
      default:
        query.orderBy('user.created', 'DESC');
        break;
    }

    // get count
    const total = await query.getCount();

    // if pagination then add skip and limit
    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((perPage - 1) * limit).take(limit);
    }

    // get records
    const records = await query.getRawMany();

    // Map the raw results to include the isFavourite key
    const result = records.map((rawUser) => {
      return {
        ...rawUser,
        isFavourite: rawUser.isFavourite == 1,
      };
    });

    const response = {
      total,
      result,
    };

    return new ResponseSuccess(this.i18n.t('test.USER.LIST'), response);
  }

  async getTopSeller(listUserDto: ListUserDto): Promise<any> {
    const {
      pagination = true,
      skip = 1,
      categoryId,
      limit = 10,
      searchTerm = '',
      countryId = '',
      sallary = '',
      responseTime = '',
      sorting = 'all',
      userId,
      tagId,
    } = listUserDto;

    // Initialize the query
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.totalRating',
        'user.avgRating',
        'user.created',
        'user.priceRange',
        'user.minPrice',
        'user.maxPrice',
        'user.responseTime',
        'country.id',
        'country.countryName',
        'category.id',
        'category.title',
        'user.isSuspended',
        'user.isDeleted',
        'user.isPhoneVerified',
        'user.isEmailVerified',
        'user.type',
        'user.totalEarningAmount',
        'user.totalCompletedJobs'
      ])
      .andWhere('user.type = :type', { type: 'SELLER' })
      .andWhere('user.type IS NOT NULL')
      .andWhere('user.isSuspended = :isSuspended', { isSuspended: false })
      .andWhere('user.isSuspended IS NOT NULL')
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.isDeleted IS NOT NULL')
      .andWhere('user.isPhoneVerified = :isPhoneVerified', {
        isPhoneVerified: true,
      })
      .andWhere('user.isPhoneVerified IS NOT NULL')
      .andWhere('user.profileStatus = :profileStatus', {
        profileStatus: ProfileStatus.APPROVED,
       })
      .leftJoin('user.country', 'country')
      .andWhere('country.id IS NOT NULL')
      .leftJoin('user.category', 'category')
      .andWhere('category.id IS NOT NULL')
      .leftJoinAndSelect('user.userTags', 'userTag')
      .leftJoinAndSelect('userTag.tag', 'tags')
      .orderBy('user.totalEarningAmount', 'DESC') //based on earning
      .addOrderBy('user.totalCompletedJobs', 'DESC');

    // Apply search term if provided
    if (searchTerm && searchTerm?.trim()) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.fullName LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('category.title LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('tags.name LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('country.countryName LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
        }),
      );
    }

    if (tagId) {
      query.andWhere('tags.id = :id', { id: Number(tagId) });
    }

    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId: categoryId });
    }

    // Add country filter if provided
    if (countryId) {
      query.andWhere('country.id = :countryId', { countryId });
    }

    // Add salary filter if provided
    if (sallary) {
      const [minPrice, maxPrice] = sallary.split('-').map(Number);
      query.andWhere(
        'user.minPrice >= :minPrice AND user.maxPrice <= :maxPrice',
        { minPrice, maxPrice },
      );
    }

    // Add response time filter if provided
    if (responseTime) {
      query.andWhere('user.responseTime <= :responseTime', { responseTime });
    }

    // Apply sorting
    if (sorting === 'low_to_high') {
      query.orderBy('user.minPrice', 'ASC');
    } else if (sorting === 'high_to_low') {
      query.orderBy('user.maxPrice', 'DESC');
    } else {
      query.orderBy('user.created', 'DESC');
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination if needed
    if (pagination) {
      query.skip((skip - 1) * limit).take(limit);
    }

    // Fetch records
    const users = await query.getMany();

    const result = await Promise.all(
      users.map(async (user) => {
        let isFavorite = false;

        if (userId) {
          const favorite = await this.userfavoriteRepository.findOne({
            where: {
              favoriteBy: { id: userId },
              favoriteTo: { id: user.id }, // Assuming you want to check this relationship
              isDeleted: false,
            },
          });

          if (favorite) {
            isFavorite = true;
          }
        }

        return {
          ...user,
          isFavourite: isFavorite,
        };
      }),
    );

    // Return the response
    const response = {
      total: total,
      result,
    };

    return new ResponseSuccess(this.i18n.t('test.USER.LIST'), response);
  }

  async all(allUserDto: AllUserDto): Promise<any> {
    const {
      pagination = true,
      skip = 1,
      limit = 10,
      searchTerm = '',
      sortBy = 'created',
      sortDirection = 'DESC',
      activeStatus = 'ALL',
      userType,
    } = allUserDto;

    const query = this.userRepository
      .createQueryBuilder('user')
      .select('*')
      .where('isDeleted = :isDeleted and isPhoneVerified = :isPhoneVerified', {
        isDeleted: false,
        isPhoneVerified: true,
      });

    // user type
    if (userType) {
      query.andWhere('type like :type', { type: userType });
    }

    //search filter
    if (searchTerm) {
      query.andWhere(
        'fullName like :searchTerm or formattedPhone like :searchTerm or email like :searchTerm',
        { searchTerm: `%${searchTerm}%` },
      );
    }
    // check active status
    if (activeStatus === 'ACTIVE') {
      query.andWhere('isSuspended = false');
    } else if (activeStatus === 'IN_ACTIVE') {
      query.andWhere('isSuspended = true');
    }
    // total records
    const total = await query.getCount();

    // order by
    query.orderBy(sortBy, sortDirection);

    // if pagination true
    if (pagination) {
      query.skip((skip - 1) * limit).take(limit);
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      records,
    };

    return new ResponseSuccess('', response);
  }

  async delete(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }
    userData.isDeleted = true;
    userData.authTokenIssuedAt = null;
    userData.deviceToken = null;
    await this.userRepository.save(userData);

    return new ResponseSuccess(this.i18n.t('test.USER.ACCOUNT_DELETED'), {
      user: userData,
    });
  }

  async get(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: { id },
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), {
      user: userData,
    });
  }

  async updateStatus(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }
    userData.isSuspended = !userData.isSuspended;
    userData.authTokenIssuedAt = null;
    userData.deviceToken = null;
    await this.userRepository.save(userData);

    return new ResponseSuccess(this.i18n.t('test.USER.STATUS_UPDATED'), {
      user: userData,
    });
  }

  async getUser(id: number, req: any): Promise<any> {
    const { user } = req;
    let isReported = false;
    let isFavorite = false;
    // all reviews
    const reviewQuery = this.reviewRepository
    .createQueryBuilder('review')
    .innerJoin('review.from', 'userFrom')  
    .addSelect(['userFrom.id', 'userFrom.fullName', 'userFrom.avatar', 'userFrom.type', 'userFrom.avgRating']) 
    .innerJoin('review.to', 'userTo')    
    .addSelect(['userTo.id', 'userTo.fullName', 'userTo.avatar', 'userTo.type', 'userTo.avgRating'])    
    .where('review.isDeleted = :isDeleted', { isDeleted: false }) 
    .andWhere('review.isSuspended = :isSuspended', { isSuspended: false })
    .orderBy('review.created', 'DESC');

    // if user login
    if (user) {    
      reviewQuery.andWhere('userTo.id = :userId', { userId: Number(user.id) });
      // User Favourite
      const userInfo = await this.userRepository.findOne({
        where: {
          id: user.id,
          isDeleted: false,
        },
      });

      if (!userInfo) {
        throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
      }

      const favorite = await this.userfavoriteRepository.findOne({
        where: {
          favoriteBy: { id: user.id },
          favoriteTo: { id: id },
          isDeleted: false,
        },
      });

      if (favorite) {
        isFavorite = true;
      }

      // User Reporetd
      const reportInfo = await this.reportRepository.findOne({
        where: {
          reportedById: user.id,
          reportedToId: id,
          isDeleted: false,
        },
      });
      if (reportInfo) {
        isReported = true;
      }
    }
    const query = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.type',
        'user.fullName',
        'user.avatar',
        'user.banner',
        'user.totalRating',
        'user.priceRange',
        'user.bio',
        'user.isOnline',
        'user.resume',
        'user.resumeName',
        'user.created',
        'user.responseTime',
        'user.avgRating'
      ])
      .leftJoinAndSelect('user.country', 'country')
      .leftJoinAndSelect('user.state', 'state')
      .leftJoinAndSelect('user.category', 'category')
      .where('user.id = :id', { id });

    reviewQuery.andWhere('userTo.id = :userId', { userId: Number(id) });

    const reviewCounts = await reviewQuery.getCount();
    const reviewRecords = await reviewQuery.take(5).getMany();

    const result = await query.getRawAndEntities();
    if (!result) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    const userData = {
      ...result.entities[0],
      isFavourite: isFavorite,
      isReported,
    };

    const tagData = await this.userTagRepository
      .createQueryBuilder('user_tag')
      .select(['tag.id', 'tag.name'])
      .leftJoin('tag', 'tag', 'user_tag.tagId = tag.id')
      .where('user_tag.userId = :userId', { userId: id })
      .orderBy('tag.id')
      .getRawMany();

    const portfolioData = await this.userPortfolioRepository.find({
      where: {
        userId: id,
      },
      order: {
        created: 'DESC',
      },
    });

    const faqData = await this.userFAQRepository.find({
      where: {
        userId: id,
      },
      order: {
        created: 'DESC',
      },
    });

    // other services
    let squery = await this.serviceRepository
      .createQueryBuilder('service')
      .select([
        'service.id',
        'service.title',
        'service.price',
        'service.minPrice',
        'service.maxPrice',
        'service.priceRange',
        'service.type',
        'service.recievedBid',
        'service.status',
        'service.userId',
        'service.description',
        'service.created',
      ])
      .leftJoinAndSelect('service.country', 'country')
      .leftJoin('service.tags', 'tags')
      .addSelect(['tags.id', 'tags.name'])
      .leftJoinAndSelect('service.bidList', 'service_bids')
      .where('service.userId = :userId', { userId: id })
      .andWhere('service.isDeleted = :isDeleted', { isDeleted: false });

    const userType = req.headers['user-type'];
    if (userType === 'SELLER') {
      squery.andWhere('service.type = :type', { type: ServiceType.JOB }); // then Show All Job
    } else {
      squery.andWhere('service.type = :type', { type: ServiceType.SERVICE }); // then Show All Services
    }

    // if add skip and limit 5
    squery = squery.offset(0).limit(5);
    const serviceData = await squery.getMany();
    // Admin Setting
    const adminSetting = await this.adminSettingRepository.findOne({
      where: { isDeleted: false },
    });
    let connectRequiredForBid = 20; //default
    if (adminSetting?.connectRequiredForBid) {
      connectRequiredForBid = adminSetting.connectRequiredForBid;
    }
    let otherRes = [];
    if(id && serviceData.length > 0){
      otherRes = serviceData.map(result=>{
        const bidUser = result?.bidList?.filter(a => a.userId == id).length;
        delete result?.bidList;
        return {
          ...result,
          connectForBid: connectRequiredForBid,
          isBided: !!bidUser // Convert to boolean directly
        };
     });
    }

  
    const requestData = await this.chatRequestRepository.findOne({
      where: [
        {isDeleted: false, sellerId: id, buyerId: user?.id, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
        {isDeleted: false, buyerId: id, sellerId: user?.id, status: In([RequestStatus.ACCEPT, RequestStatus.PENDING]), },
      ],
    });

    const totalJobs = await this.serviceRepository.find({
      where: {
        userId : id,
        isSuspended : false,
        isDeleted : false
      }
    })

    let whereCritera: any = {
      isSuspended: false,
      isDeleted: false,
      status: BookingStatus.COMPLETED
    };

    if (userType == UserType.SELLER) {
      whereCritera = {
        ...whereCritera,
        buyerId:id
      };
    } else {
      whereCritera = {
        ...whereCritera,
        sellerId: id
      };
    }

    const completedJobs = await this.bookingRepository.find({
      where: whereCritera
    })

    const usersAllData = {
      ...userData,
      completedJobs: completedJobs.length,
      totalJobs: totalJobs.length,
      totalEarning: 0,
      tags: tagData,
      services: otherRes,
      faqs: faqData,
      portfolios: portfolioData,
      chatRequest: !!requestData,
      isChatConnected: requestData?.status === RequestStatus.ACCEPT,
      reviews: reviewRecords,
      reviewCounts: reviewCounts
    };

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), usersAllData);
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

  async getUserByIdFromMiddleware(payload: any) {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
        authTokenIssuedAt: payload.iat,
        isDeleted: false,
      },
    });
    return user;
  }

  async addFavoriteUser(id: number, req: any): Promise<any> {
    const { user } = req;

    const favoriteUser = await this.userRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!favoriteUser) {
      throw new BadRequestException(
        this.i18n.t('test.USER.FAVORITE_USER_NOT_FOUND'),
      );
    } else {
      const favExist = await this.userfavoriteRepository.findOne({
        where: {
          isDeleted: false,
          favoriteBy: { id: user.id },
          favoriteTo: { id: id },
        },
      });

      if (favExist) {
        throw new BadRequestException(
          this.i18n.t('test.USER.ALREADY_FAVORITE_USER'),
        );
      } else {
        const favt = this.userfavoriteRepository.create({
          favoriteBy: user,
          favoriteTo: favoriteUser,
        });
        await this.userfavoriteRepository.save(favt);
        return new ResponseSuccess(this.i18n.t('test.USER.ADD_FAVORITE'));
      }
    }
  }

  async removeFavoriteUser(id: number, req: any): Promise<any> {
    const { user } = req;

    const favoriteUser = await this.userRepository.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!favoriteUser) {
      throw new BadRequestException(
        this.i18n.t('test.USER.FAVORITE_USER_NOT_FOUND'),
      );
    } else {
      const favExist = await this.userfavoriteRepository.findOne({
        where: {
          isDeleted: false,
          favoriteBy: { id: user.id },
          favoriteTo: { id: id },
        },
      });

      if (favExist) {
        await this.userfavoriteRepository.delete({ id: favExist.id });
      }
    }
    return new ResponseSuccess(this.i18n.t('test.USER.REMOVE_FAVORITE'));
  }

  async getUserFavoriteUsers(
    listUserDto: ListFavoriteDto,
    req: any,
  ): Promise<any> {
    const {
      pagination = true,
      skip = 1,
      limit = 10,
      searchTerm = '',
    } = listUserDto;
    const { user } = req;

    const query = this.userfavoriteRepository
      .createQueryBuilder('favorite_user')
      .where('favorite_user.favoriteById = :id', { id: user.id })
      .leftJoinAndSelect('favorite_user.favoriteTo', 'favoriteTo')
      .leftJoinAndSelect(
        'favoriteTo.userTags',
        'userTag',
        'userTag.userId = favoriteTo.id',
      )
      .leftJoinAndSelect('userTag.tag', 'tag')
      .andWhere('favorite_user.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('favorite_user.created', 'DESC');

    if (searchTerm) {
      query.andWhere('favoriteTo.fullName LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    // get count
    const total = await query.getCount();

    // if pagination then add skip and limit
    if (pagination) {
      query.skip((skip - 1) * limit).take(limit);
    }

    // get records
    const records = await query.getMany();

    const response = {
      total,
      records,
    };
    return new ResponseSuccess(this.i18n.t('test.USER.GET_FAVORITE'), response);
  }

  async dashboard(req: any): Promise<any> {
    const { user } = req;

    let whereCritera: any = {
      isSuspended: false,
      isDeleted: false,
    };

    if (user.type == UserType.SELLER) {
      whereCritera = {
        ...whereCritera,
        sellerId: user.id,
      };
    } else {
      whereCritera = {
        ...whereCritera,
        buyerId: user.id,
      };
    }

    const serviceCount = await this.serviceRepository.find({
      where: {
        userId: user.id,
        isSuspended: false,
        isDeleted: false,
      },
      select : {
        id : true
      }
    });

    const allService = serviceCount.map(a=> a.id)
    let whereCriteria = { };
    if(user.type === 'SELLER'){
      whereCriteria = {
        user : { id : user.id},
        type: Not(BidStatus.WITHDRAWN),
       isSuspended: false,
       isDeleted: false,
      };
    }else{
      whereCriteria = {
        serviceId: In(allService),
       type: Not(BidStatus.WITHDRAWN),
       isSuspended: false,
       isDeleted: false,
      }
    }   

    const bidsCount = await this.serviceBidsRepository.count({
      where: whereCriteria
    });


    const activeJobCount = await this.serviceRepository.count({
      where: {
        userId: user.id,
        status: ServiceStatusType.BOOKED,
        isSuspended: false,
        isDeleted: false,
      },
    });

    const completedJobCount = await this.bookingRepository.count({
      where: {
        status: BookingStatus.COMPLETED,
        ...whereCritera,
      },
    });

    const cancelledJobCount = await this.bookingRepository.count({
      where: {
        status: 'Cancelled',
        ...whereCritera,
      },
    });



  const unreadChatsCount:any = await this.chatRepository.count({
    where: [
      { receiverType: user.type, sellerId: user.id, isRead : false },
      { receiverType: user.type , buyerId: user.id, isRead : false },
    ],
  });

    return new ResponseSuccess(this.i18n.t('test.USER.INFO'), {
      activeJobs: activeJobCount,
      completedJobs: completedJobCount,
      cancelledJobs: cancelledJobCount,
      postedJobs: serviceCount.length,
      noOfBids: bidsCount,
      unreadChats: unreadChatsCount,
      totalEarningAmount: user.totalEarningAmount ?? 0,
    });
  }

  async validateActiveUserById(id: number) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.USER.ACCOUNT_SUSPENDED'));
    }

    return user;
  }

  async getSearchedData(search: string, req: any) {
    const searchData = await this.categoryRepository.find({
      where: {
        isDeleted: false,
        title: Like(`%${search}%`),
      },
      select: ['title'],
    });

    const tagData = await this.tagRepository.find({
      where: {
        isDeleted: false,
        name: Like(`%${search}%`),
      },
      select: ['name'],
    });

    const userType = req.headers['user-type'];
    let typeData = UserType.SELLER;
    let serviceType = ServiceType.SERVICE;
    if (userType === 'SELLER') {
      typeData = UserType.BUYER;
      serviceType = ServiceType.JOB;
    }
    // Get  user Data
    const userData = await this.userRepository.find({
      where: {
        isDeleted: false,
        isSuspended: false,
        type: typeData,
        fullName: Like(`%${search}%`),
      },
      select: ['fullName'],
    });

    // Get service Data Data
    const serviceData = await this.serviceRepository.find({
      where: {
        isDeleted: false,
        isSuspended: false,
        type: serviceType,
        title: Like(`%${search}%`),
      },
      select: ['title'],
    });

    const a = tagData.map((a) => a.name);
    const b = searchData.map((a) => a.title);
    const c = userData.map((c) => c.fullName);
    const d = serviceData.map((d) => d.title);

    const suggestions = [...a, ...b, ...c, ...d];

    return new ResponseSuccess(
      this.i18n.t('test.RESOURCES.SUGGESTIONS'),
      suggestions,
    );
  }

  async report(reportData: reportDTO, req: any): Promise<any> {
    const { user } = req;
    const { reason, userId } = reportData;

    // User Reporetd
    const reportInfo = await this.reportRepository.findOne({
      where: {
        reportedById: user.id,
        reportedToId: userId,
        isDeleted: false,
      },
    });
    if (reportInfo) {
      throw new BadRequestException(this.i18n.t('test.USER.ALREADY_REPORTED'));
    }

    const reportedTo = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    const reports = this.reportRepository.create({
      reportedTo: reportedTo,
      reportedBy: user,
      reason: reason,
    });
    await this.reportRepository.save(reports);
    return new ResponseSuccess(this.i18n.t('test.USER.REPORTED'));
  }

  async sendPush(notificationDto: NotificationDTO): Promise<any> {
    const { userId, title, description } = notificationDto;

    let allTokens = [];
    let userType = NotificationUserType.ALL;

    if (userId?.length > 0) {
      const userIds = userId.map(a=> Number(a))
      const userData = await this.userRepository.find({
        where: {
          id: In(userIds),
          isDeleted: false,
          deviceToken: Not(IsNull())
        },
      });

      if (!userData) {
        throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
      }

      allTokens = userData.map(a=> a.deviceToken);  
      userType = NotificationUserType.SPECIFIC;    
    } else {
      const userData = await this.userRepository.find({
        where: {
          isDeleted: false,
          deviceToken: Not(IsNull())
        },
        select:["deviceToken", "id", "fullName", "avatar"]
      });

      allTokens = userData.map(a=> a.deviceToken);  
      userType = NotificationUserType.ALL;
    }

    await this.fcmService.saveNotification({
      deviceToken : allTokens,
      deviceType : '',
      title : title,
      description : description,    
      type : NotificationType.BROADCAST,
      status : NotificationStatus.REMINDER,
      userType : userType,
      receiverId : null,
      notificationType : NotificationStatus.REMINDER,
      senderType: UserType.ADMIN
    })


    return new ResponseSuccess(
      this.i18n.t('Push notification send successfully'),
      {},
    );
  }

  async allNotification(allUserDto: AllUserDto): Promise<any> {
    const {
      pagination = true,
      skip = 1,
      limit = 10,
      searchTerm = '',
      sortBy = 'id',
      sortDirection = 'DESC',
      source = 'notification'
    } = allUserDto;
  
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.isDeleted = :isDeleted', { isDeleted: false });
  
    // Apply userType filter
    query.andWhere('notification.receiverType = :receiverType', {
      receiverType: UserType.ADMIN,
    });
  
    // Apply search filter
    if (searchTerm) {
      query.andWhere('notification.subject LIKE :searchTerm OR notification.description LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    // Apply ordering
    query.orderBy(`notification.${sortBy}`, sortDirection);
  
    // Get total records count
    const total = await query.getCount();
  
    // Apply pagination if enabled
    if (pagination) {
      const page = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((page - 1) * limit).take(limit);
    }
  
    // Get records
    const records = await query.getMany();

    if(source !== 'dashboard'){
      const ids = records.map(a=> a.id)
      await this.notificationRepository.update(
        { id: In(ids) },
        { isRead: true } 
      );
    }
  
    // Prepare response
    const response = {
      total,
      records,
      totalPage: Math.ceil(total / limit),
      page: Number(skip),
    };
  
    return new ResponseSuccess('Fetched Notifications', response);
  }

  async deleteNotification(id: number): Promise<any> {
    const notificationData = await this.notificationRepository.findOne({
      where: {
        id,
      },
    });

    if (!notificationData) {
      throw new BadRequestException(this.i18n.t('test.NOTIFICATION.NOT_FOUND'));
    }
    notificationData.isDeleted = true;
    await this.notificationRepository.save(notificationData);

    return new ResponseSuccess(this.i18n.t('test.NOTIFICATION.DELETED'), {});
  }
  

  async getAllReviews(reviewListDto: reviewListDTO, req: any): Promise<any> {
    const { user } = req;
    const { userId, pagination, skip, limit  } = reviewListDto;
    // all reviews
    const reviewQuery = this.reviewRepository
    .createQueryBuilder('review')
    .innerJoin('review.from', 'userFrom')  
    .addSelect(['userFrom.id', 'userFrom.fullName', 'userFrom.avatar', 'userFrom.type']) 
    .innerJoin('review.to', 'userTo')    
    .addSelect(['userTo.id', 'userTo.fullName', 'userTo.avatar', 'userTo.type'])    
    .where('review.isDeleted = :isDeleted', { isDeleted: false }) 
    .andWhere('review.isSuspended = :isSuspended', { isSuspended: false });

    if(user){
      reviewQuery.andWhere('userTo.id = :userId', { userId: Number(user.id) });
    }else{
      reviewQuery.andWhere('userTo.id = :userId', { userId: Number(userId) });
    }    

    if (pagination) {
      const page = skip == 0 ? Number(skip) + 1 : Number(skip);
      reviewQuery.skip((page - 1) * limit).take(limit);
    }

    const reviewRecords = await reviewQuery.getMany();

    if (!reviewRecords) {
      throw new BadRequestException(this.i18n.t('test.USER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.USER.REVIEW_LIST'), reviewRecords);
  }

  async allReports(allReportDto: AllReportDto): Promise<any> {
    const {
      skip = 1,
      limit = 10,
      searchTerm = ''
    } = allReportDto;
      
    const query = this.reportRepository
    .createQueryBuilder('report')
    .innerJoinAndSelect('report.reportedTo', 'reportedTo')   
    .innerJoinAndSelect('report.reportedBy', 'reportedBy')      
    .where('report.isDeleted = :isDeleted', { isDeleted: false }) 
  
     // Search filter
  if (searchTerm && searchTerm.trim()) {
    query.andWhere(
      new Brackets(qb => {
        qb.where('reportedTo.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
          .orWhere('reportedBy.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      })
    );
  }

     // order by
     query.orderBy('report.created', 'DESC');
  
    // Get total records count
    const total = await query.getCount();
  
    // if pagination true
    const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
    query.skip((perPage - 1) * limit).take(limit)
  
    // Get records
    const records = await query.getMany();
  
    // Prepare response
    const response = {
      total,
      records,
      totalPage: Math.ceil(total / limit),
      page: Number(skip),
    };
  
    return new ResponseSuccess('Fetched Reports', response);
  }

}
