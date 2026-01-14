import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { User, UserReviews } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Brackets, Repository } from 'typeorm';
import { ListBookingDto } from './dto';
import { UpdateReviewDto } from './dto/updateReview.dto';

@Injectable()
export class ReviewLibService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserReviews) private reviewRepository: Repository<UserReviews>,
    private readonly i18n: I18nService,
  ) {}


  async list(listBookingDto: ListBookingDto): Promise<any> {
    const {
      pagination = true,
      skip = 0,
      limit = 10,
      searchTerm = '',
    } = listBookingDto;

    let query = this.reviewRepository
      .createQueryBuilder('review')

    // if search term not empty then apply search
    if (searchTerm) {
      query = query.andWhere(`review.reviewMessage LIKE :searchTerm`, {
        searchTerm: `%${searchTerm}%`,
      });
    }
    // get count
    const total = await query.getCount();

    // if pagination then add skip and limit
    if (pagination) {
      query.skip((skip - 1) * limit).take(limit)
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      records,
    };

    return new ResponseSuccess('', response);
  }

  async all(allUserDto: any): Promise<any> {
    const {
      pagination = true,
      skip = 1,
      limit = 10,
      searchTerm = '',
      bookingType = 'ALL',
      userId = ''
    } = allUserDto;

    const query = this.reviewRepository
    .createQueryBuilder('review')
    .innerJoinAndSelect('review.from', 'userFrom')   
    .innerJoinAndSelect('review.to', 'userTo')      
    .innerJoinAndSelect('review.booking', 'booking')
    .where('review.isDeleted = :isDeleted', { isDeleted: false }) 
    .andWhere('review.isSuspended = :isSuspended', { isSuspended: false }); 
  
  if (userId) {
    query.andWhere('userTo.id = :userId', { userId: Number(userId) });
  }

  // Search filter
  if (searchTerm && searchTerm.trim()) {
    query.andWhere(
      new Brackets(qb => {
        qb.where('userFrom.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
          .orWhere('userTo.fullName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
          .orWhere('review.reviewMessage LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
          .orWhere('booking.id LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
      })
    );
  }
  
    // check active status
    if (bookingType === 'Active') {
      query.andWhere('isSuspended = false');
    } else if (bookingType === 'Canceled') {
      query.andWhere('isSuspended = true');
    } else if (bookingType === 'Completed') {
      query.andWhere('isSuspended = true');
    }else if (bookingType === 'In-dispute') {
      query.andWhere('isSuspended = true');
    }

    // order by
    query.orderBy('review.created', 'DESC');

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
      page : (Number(skip))
    };

    return new ResponseSuccess('', response);
  }

  async get(id: number): Promise<any> {
    const bookingData = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!bookingData) {
      throw new BadRequestException(this.i18n.t('test.REVIEW.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.REVIEW.INFO'), {
      booking: bookingData,
    });
  }

  async updateStatus(id: number): Promise<any> {
    const bookingData = await this.reviewRepository.findOne({
      where: {
        id,
      },
    });

    if (!bookingData) {
      throw new BadRequestException(this.i18n.t('test.REVIEW.NOT_FOUND'));
    }
    bookingData.isSuspended = !bookingData.isSuspended;
    await this.reviewRepository.save(bookingData);

    return new ResponseSuccess(this.i18n.t('test.REVIEW.STATUS_UPDATED'), {
      booking: bookingData,
    });
  }

  async delete(id: number): Promise<any> {
    const reviewData = await this.reviewRepository.findOne({
      where: {
        id,
      },
    });

    if (!reviewData) {
      throw new BadRequestException(this.i18n.t('test.REVIEW.NOT_FOUND'));
    }

    reviewData.isDeleted = true;
    await this.reviewRepository.save(reviewData);

    return new ResponseSuccess(this.i18n.t('test.REVIEW.DELETED'));
  }

  async updateReview(updateDto: UpdateReviewDto): Promise<any> {
    const { id, reviewMessage } = updateDto;

    const reviewData = await this.reviewRepository.findOne({
      where: {
        id : id,
      },
    });

    if (!reviewData) {
      throw new BadRequestException(this.i18n.t('test.REVIEW.NOT_FOUND'));
    }
    reviewData.reviewMessage = reviewMessage;

    await this.reviewRepository.save(reviewData);

    return new ResponseSuccess(this.i18n.t('test.REVIEW.UPDATED'));
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
      throw new BadRequestException(this.i18n.t('test.REVIEW.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.REVIEW.SUSPENDED'));
    }

    return user;
  }
}
