import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import {
  User,
  UserPortfolio,
  UserFaq,
  UserTag,
  UserReviews,
} from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Brackets, Repository } from 'typeorm';
import { AllSellerDto, ListSellerDto, UpdateFAQDto, UpdateProfileStatusDto } from './dto';
import { MailService } from '../../../apps/admin/src/mail/mail.service';

import { UpdateRequestDto } from './dto/requestUpdate.dto';

import { hashPassword } from 'common/utils';
import { UpdatePortfolioDto } from '@app/seller-lib/dto';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { Gender, UserType } from 'common/enums';

@Injectable()
export class SellerLibService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserFaq) private userFAQRepository: Repository<UserFaq>,
    @InjectRepository(UserPortfolio)
    private userPortfolioRepository: Repository<UserPortfolio>,
    @InjectRepository(UserTag) private userTagRepository: Repository<UserTag>,
    @InjectRepository(UserReviews)
    private reviewsRepository: Repository<UserReviews>,
    private readonly mailService: MailService,
    private readonly i18n: I18nService,
  ) {}

  async updateRequest(requestDto: UpdateRequestDto): Promise<any> {
    const { userId, status, reason } = requestDto;
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }
    let msg = '';
    if (status === 'accept') {
      user.isActive = true;
      msg = 'ACCEPTED';
    } else {
      user.isActive = false;
      (msg = 'REJECTED'), (user.rejectReason = reason);
    }
    await this.userRepository.save(user);
    return new ResponseSuccess(this.i18n.t(`test.SELLER.REQUEST_${msg}`));
  }

  async addUpdateBuyer(addUpdateBuyerDto: any): Promise<any> {
    const { id, email, phone, countryCode, password, userId, gender } = addUpdateBuyerDto;

    if (id && userId) {
      delete addUpdateBuyerDto.userId;

      const user = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(addUpdateBuyerDto)
        .where('id = :id', { id })
        .execute();

      if (!user) {
        throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
      }

      return new ResponseSuccess(this.i18n.t('test.SELLER.UPDATED'), {
        user,
      });
    } else {

      const formattedPhone = countryCode + phone;

      const userData = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .orWhere('user.formattedPhone = :formattedPhone', { formattedPhone })
        .getOne();

      if (
        userData &&
        (userData.email === email ||
          userData?.formattedPhone === formattedPhone)
      ) {
        const msg =
          userData.email === email
            ? 'EMAIL_ALREADY_EXIST'
            : 'MOBILE_ALREADY_EXIST';
        throw new BadRequestException(this.i18n.t(`test.SELLER.${msg}`));
      } else {
        const user = this.userRepository.create({
          ...addUpdateBuyerDto,
          gender : Gender.MALE == gender ? Gender.MALE : Gender.FEMALE,
          password: await hashPassword(addUpdateBuyerDto.password),
          isPhoneVerified: true,
          isEmailVerified: true,
          step: 1,
          formattedPhone: formattedPhone,
          type: UserType.SELLER,
        });
        await this.userRepository.save(user);

        await this.mailService.sendMailToUser(userData, password);

        return new ResponseSuccess(this.i18n.t('test.SELLER.ADDED'), {
          user,
        });
      }
    }
  }

  async list(listSellerDto: ListSellerDto): Promise<any> {
    const {
      pagination = true,
      skip = 0,
      limit = 10,
      searchTerm = '',
    } = listSellerDto;

    let query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.totalRating',
        'user.avgRating',
        'ta.id',
        'ta.name',
      ])
      .leftJoin('user_tag', 'ut', 'ut.userId = user.id')
      .leftJoin('tag', 'ta', 'ut.tagId = ta.id')
      .where('user.isSuspended = :isSuspended', { isSuspended: false })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.isPhoneVerified = :isPhoneVerified', {
        isPhoneVerified: true,
      })
      .andWhere('user.type = :type', { type: 'SELLER' })
      .groupBy('user.id')
      .addGroupBy('ta.id')
      .addGroupBy('ta.name');

    // if search term not empty then apply search
    if (searchTerm) {
      query = query.andWhere(`fullName LIKE :searchTerm`, {
        searchTerm: `%${searchTerm}%`,
      });
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

    const response = {
      total,
      records,
    };

    return new ResponseSuccess('', response);
  }

  async all(allSellerDto: AllSellerDto): Promise<any> {
    const {
      pagination = true,
      limit = 10,
      search = '',
      activeStatus = 'ALL',
      startDate,
      endDate,
      categoryId,
      tagId,
      totalRating,
      responseTime,
      profileStatus
    } = allSellerDto;
    let {
      skip,
    } = allSellerDto;

    const query = this.userRepository.createQueryBuilder('user')
    .where('user.isDeleted = false')
    .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('user.type = :type', { type: UserType.SELLER })
    .leftJoin('user.country', 'country')
    .leftJoin('user.category', 'category')
    .leftJoinAndSelect('user.userTags', 'userTag')
    .leftJoinAndSelect('userTag.tag', 'tags')


    // Apply search term if provided
    if (search && search?.trim()) {
      query.andWhere(
        new Brackets(qb => {
          qb.where('user.fullName LIKE :searchTerm', { searchTerm: `%${search}%` })
            .orWhere('user.formattedPhone LIKE :searchTerm', { searchTerm: `%${search}%` })
            .orWhere('user.phone LIKE :searchTerm', { searchTerm: `%${search}%` })
            .orWhere('category.title LIKE :searchTerm', { searchTerm: `%${search}%` })
            .orWhere('tags.name LIKE :searchTerm', { searchTerm: `%${search}%` }) 
            .orWhere('country.countryName LIKE :searchTerm', { searchTerm: `%${search}%` }) 
        })
      );

      skip = 0;
    }

    // date range
    if (startDate && endDate !== 'null') {
      query.andWhere('user.created BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    if (profileStatus && profileStatus != 'ALL') {
      query.andWhere('user.profileStatus = :profileStatus', { profileStatus });
    }

    if (categoryId) {
      query.andWhere('user.categoryId = :categoryId', { categoryId });
    }

    if (totalRating) {
      query.andWhere('user.avgRating = :totalRating', { totalRating });
    }

    if (responseTime) {
      query.andWhere('user.responseTime = :responseTime', { responseTime });
    }

    if (tagId) {
      query.andWhere('tags.id = :id', { id: Number(tagId) }) 
    }

    // search filter
    if (search) {
      query
        .andWhere(
          'fullName like :searchTerm or formattedPhone like :searchTerm or email like :searchTerm',
          { searchTerm: `%${search}%` },
        )
        .andWhere('user.type = :type', { type: 'SELLER' });
    }
    // check active status
    if (activeStatus === 'ACTIVE') {
      query.andWhere('isSuspended = false');
    } else if (activeStatus === 'IN_ACTIVE') {
      query.andWhere('isSuspended = true');
    }

    // order by
    query.orderBy('user.created', 'DESC');

    // if pagination true
    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((perPage - 1) * limit).take(limit);
    }

     // total records
     const total = await query.getCount();        

    // get records
    const records = await query.getMany();

    const response = {
      total,
      records,
      totalPage: Math.ceil(total / limit),
      totalRecords: records,
      page:  Number(skip) + 1,
    };

    return new ResponseSuccess('', response);
  }

  async get(id: number): Promise<any> {
    const userData = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.country', 'country')
      .leftJoinAndSelect('user.state', 'state')
      .leftJoinAndSelect('user.category', 'category')
      .where({
        id: id,
      })
      .getOne();

    const tagData = await this.userTagRepository
      .createQueryBuilder('user_tag')
      .select(['tag.id', 'tag.name'])
      .leftJoin('tag', 'tag', 'user_tag.tagId = tag.id')
      .where('user_tag.userId = :userId', { userId: id })
      .orderBy('tag.id')
      .getRawMany();

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }

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
    const usersAllData = {
      ...userData,
      tags: tagData,
      faqs: faqData,
      portfolios: portfolioData,
    };
    return new ResponseSuccess(this.i18n.t('test.SELLER.INFO'), {
      ...usersAllData,
    });
  }

  async delete(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }
    userData.isDeleted = true;
    userData.authTokenIssuedAt = null;
    userData.deviceToken = null;
    await this.userRepository.save(userData);

    return new ResponseSuccess(this.i18n.t('test.SELLER.ACCOUNT_DELETED'), {
      user: userData,
    });
  }

  async getReview(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: { id },
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.SELLER.INFO'), {
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
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }
    userData.isSuspended = !userData.isSuspended;
    userData.authTokenIssuedAt = null;
    userData.deviceToken = null;
    await this.userRepository.save(userData);

    return new ResponseSuccess(this.i18n.t('test.SELLER.STATUS_UPDATED'), {
      user: userData,
    });
  }

  async getUser(id: number): Promise<any> {
    const user = await this.validateActiveUserById(id);
    return new ResponseSuccess(this.i18n.t('test.SELLER.INFO'), { user });
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
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(
        this.i18n.t('test.SELLER.ACCOUNT_SUSPENDED'),
      );
    }

    return user;
  }

  async updateFAQ(updateFAQDto: UpdateFAQDto): Promise<any> {
    const { question, answer, id, userId } = updateFAQDto;

    if (id && userId) {
      let faqData = await this.userFAQRepository.findOne({
        where: {
          id,
          userId: userId,
        },
      });

      if (!faqData) {
        throw new BadRequestException(this.i18n.t('test.SELLER.FAQ.NOT_FOUND'));
      }

      // Update existing FAQ
      faqData.question = question;
      faqData.answer = answer;
      faqData = await this.userFAQRepository.save(faqData);

      return new ResponseSuccess(this.i18n.t('test.SELLER.FAQ.UPDATED'));
    } else {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      const newFAQ = this.userFAQRepository.create({
        userId: user.id,
        user: user,
        question: question,
        answer: answer,
      });

      await this.userFAQRepository.save(newFAQ);

      return new ResponseSuccess(this.i18n.t('test.SELLER.FAQ.CREATED'));
    }
  }

  async getFaq(id: any): Promise<any> {
    const faqData = await this.userFAQRepository.find({
      where: {
        userId: id,
        isDeleted: false,
      },
      order: {
        created: 'DESC',
      },
    });

    if (!faqData) {
      throw new BadRequestException(this.i18n.t('test.SELLER.FAQ.NOT_FOUND'));
    }
    return new ResponseSuccess(this.i18n.t('test.SELLER.FAQ.GET'), {
      faq: faqData,
    });
  }

  async getPortfolio(id: any): Promise<any> {
    const portfolioData = await this.userPortfolioRepository.find({
      where: {
        userId: id,
        isDeleted: false
      },
      order: {
        created: 'DESC',
      },
    });

    if (!portfolioData) {
      throw new BadRequestException(
        this.i18n.t('test.SELLER.PORTFOLIO.NOT_FOUND'),
      );
    }
    return new ResponseSuccess(this.i18n.t('test.SELLER.PORTFOLIO.GET'), {
      portfolio: portfolioData,
    });
  }

  async updatePortfolio(
    updatePortfolioDto: UpdatePortfolioDto
  ): Promise<any> {
    const { title, image, id, userId } = updatePortfolioDto;
    if (id && userId) {
      const prtfolioData = await this.userPortfolioRepository.findOne({
        where: {
          id,
          userId: userId,
        },
      });

      if (!prtfolioData) {
        throw new BadRequestException(
          this.i18n.t('test.SELLER.PORTFOLIO.NOT_FOUND'),
        );
      }

      prtfolioData.title = title;
      prtfolioData.image = image;
      await this.userPortfolioRepository.save(prtfolioData);

      return new ResponseSuccess(this.i18n.t('test.SELLER.PORTFOLIO.UPDATED'));
    } else {
      // Create new FAQ
      const userData = await this.userRepository.findOne({
        where: { id: userId },
      });

      const userPortfolio = this.userPortfolioRepository.create({
        user: userData,
        userId: userId,
        title,
        image,
      });

      await this.userPortfolioRepository.save(userPortfolio);
      return new ResponseSuccess(this.i18n.t('test.SELLER.PORTFOLIO.CREATED'));
    }
  }

  async deletePortfolio(id: number): Promise<any> {
    const portfolio = await this.userPortfolioRepository.findOne({
      where: {
        id,
      },
    });
    if (!portfolio) {
      throw new BadRequestException(
        this.i18n.t('test.SELLER.PORTFOLIO.NOT_FOUND'),
      );
    }
    portfolio.isDeleted = true;
    await this.userPortfolioRepository.save(portfolio);

    return new ResponseSuccess(this.i18n.t('test.SELLER.PORTFOLIO.DELETED'), {});
  }

  async deleteFAQ(id: number): Promise<any> {
    const faq = await this.userFAQRepository.findOne({
      where: {
        id,
      },
    });

    if (!faq) {
      throw new BadRequestException(this.i18n.t('test.SELLER.FAQ.NOT_FOUND'));
    }
    faq.isDeleted = true;
    await this.userFAQRepository.save(faq);

    return new ResponseSuccess(this.i18n.t('test.SELLER.FAQ.DELETED'), {});
  }

  async allReviewList(allSellerDto: AllSellerDto): Promise<any> {
    const {
      pagination = true,
      skip,
      limit = 10,
      search = '',
      sortBy = 'id',
      sortDirection = 'DESC',
      activeStatus = 'ALL',
      userId,
    } = allSellerDto;

    const query = this.reviewsRepository
      .createQueryBuilder('user_reviews')
      .select('*')
      .where('user_reviews.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('user_reviews.from', 'user')
      .where('user.id = :userId', { userId: userId });

    // search filter
    if (search) {
      query.andWhere('reviewMessage like :searchTerm', {
        searchTerm: `%${search}%`,
      });
    }
    // check active status
    if (activeStatus === 'ACTIVE') {
      query.andWhere('isSuspended = false');
    } else if (activeStatus === 'IN_ACTIVE') {
      query.andWhere('isSuspended = true');
    }

    // order by
    query.orderBy(sortBy, sortDirection);

    // total records
    const total = await query.getCount();

    // if pagination true
    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((perPage - 1) * limit).take(limit);
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      records,
      totalPage: Math.ceil(total / limit),
      totalRecords: records,
      page: skip + 1,
    };

    return new ResponseSuccess('', response);
  }

  async getReviewDetails(user: any): Promise<any> {
    const { id } = user;
    const query = this.reviewsRepository
      .createQueryBuilder('user_reviews')
      .select('*')
      .where('user_reviews.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('user_reviews.from', 'user')
      .where('user_reviews.id = :id', { id: id });

    const records = await query.getRawMany();

    const response = {
      records,
      totalRecords: records,
    };

    return new ResponseSuccess('', response);
  }

  async deleteReviews(id: number): Promise<any> {
    const review = await this.reviewsRepository.findOne({
      where: {
        id,
      },
    });

    if (!review) {
      throw new BadRequestException(this.i18n.t('test.SELLER.REVIEW.NOT_FOUND'));
    }
    review.isDeleted = true;
    await this.reviewsRepository.save(review);

    return new ResponseSuccess(this.i18n.t('test.SELLER.REVIEW.DELETED'), {});
  }

  async updateReviews(
    updateReviewDto: UpdateReviewDto
  ): Promise<any> {
    const { totalStar, userId, id, reviewMessage } = updateReviewDto;
    if (id && userId) {
      const review = await this.reviewsRepository.findOne({
        where: {
          id,
          fromId: userId,
        },
      });

      if (!review) {
        throw new BadRequestException(this.i18n.t('test.SELLER.REVIEW.NOT_FOUND'));
      }

      review.reviewMessage = reviewMessage;
      review.totalStar = totalStar;
      await this.reviewsRepository.save(review);

      return new ResponseSuccess(this.i18n.t('test.SELLER.REVIEW.UPDATED'));
    }
  }

  async updateProfileState(
    updateProfileDto: UpdateProfileStatusDto,
  ): Promise<any> {
    const { id, body, subject } = updateProfileDto;
    const user = await this.userRepository.findOne({
      where: {
        id,
        isDeleted : false,
        isSuspended : false
      },
    });

    if (!user) {
      throw new BadRequestException(this.i18n.t('test.SELLER.NOT_FOUND'));
    }

    if (user && body && subject) {
      user.profileStatus = 'REJECTED';
      await this.userRepository.save(user);
      const subject = this.i18n.t('test.SELLER.MAIL.REJECT_TITLE');
      const msgBody = `${this.i18n.t('test.SELLER.MAIL.REJECT_TITLE')}: ${body}`
      // shoot mail to seller
      await this.mailService.sendMailToSellerFORProfileStatus(user, subject, msgBody);

    }else {
      user.profileStatus = 'APPROVED';
      await this.userRepository.save(user);
      const subject = this.i18n.t('test.SELLER.MAIL.APPROVE_TITLE');
      const bodyMsg = `${this.i18n.t('test.SELLER.MAIL.APPROVE_DESC')}`
      await this.mailService.sendMailToSellerFORProfileStatus(user, subject, bodyMsg);
    }

    return new ResponseSuccess(this.i18n.t('test.SELLER.STATUS_UPDATED'));
  }
}
