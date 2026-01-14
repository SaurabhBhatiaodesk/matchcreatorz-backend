import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { User, WalletTransaction, WithdrawRequest } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AllBuyerDto, ListBuyerDto, UpdateBuyerProfileDto } from './dto';
import { MailService } from '../../../apps/admin/src/mail/mail.service';

import { AmoountCreditBy, PaymentStatus, UserType, WalletTransactionType, WithdrawStatus } from 'common/enums';

import {
  hashPassword
} from 'common/utils';
import { AllWalletDto } from './dto/wallet.dto';
import { AllWithDrawRequestDto, WalletUpdateStatusDto } from 'apps/admin/src/modules/wallet/dto';

@Injectable()
export class BuyerLibService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(WithdrawRequest) private withdrawRequestRepository: Repository<WithdrawRequest>,
    @InjectRepository(WalletTransaction) private walletTransactionRepository: Repository<WalletTransaction>,
    private readonly mailService: MailService,
    private readonly i18n: I18nService,
  ) {}


  async list(listUserDto: ListBuyerDto): Promise<any> {
    const {
      pagination = true,
      skip = 0,
      limit = 10,
      searchTerm = '',
    } = listUserDto;

    let query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.avatar',
        'user.totalRating',
        'user.avgRating',
        'ta.id',
        'ta.name'
      ])
      .andWhere('user.type = :type', { type: UserType.BUYER })
      .leftJoin('user_tag', 'ut', 'ut.userId = user.id')
      .leftJoin('tag', 'ta', 'ut.tagId = ta.id')
      .where('user.isSuspended = :isSuspended', { isSuspended: false })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.isPhoneVerified = :isPhoneVerified', { isPhoneVerified: true })
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

  async all(allUserDto: AllBuyerDto): Promise<any> {
    const {
      pagination = true,
      limit = 10,
      search = '',
      activeStatus = 'ALL',
      startDate,
      endDate
    } = allUserDto;
    let {
      skip
    } = allUserDto;

    const query = this.userRepository.createQueryBuilder('user')
    .where('user.isDeleted = false')
    .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
     .andWhere('user.type = :type', { type: UserType.BUYER })


    // date range
    if(startDate && endDate){
      query.andWhere('user.created BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    // search filter
    if (search) {
      query.andWhere(
        'fullName like :searchTerm or formattedPhone like :searchTerm or email like :searchTerm',
        { searchTerm: `%${search}%` },
      ).andWhere('user.type = :type', { type: UserType.BUYER });

      skip = 0;
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
      query.skip((perPage - 1) * limit).take(limit)
    }

    // total records
    const total = await query.getCount();
    // get records
    const records = await query.getMany();
  

    const response = {
      total : total,
      // records,
      totalPage : Math.ceil(total / limit),
      totalRecords : records,
      page : Number(skip + 1)
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
      throw new BadRequestException(this.i18n.t('test.BUYER.NOT_FOUND'));
    }
    userData.isDeleted = true;
    userData.authTokenIssuedAt = null;
    userData.deviceToken = null;
    await this.userRepository.save(userData);

    return new ResponseSuccess(this.i18n.t('test.BUYER.ACCOUNT_DELETED'), {
      user: userData,
    });
  }

  async get(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: { id },
      relations:{
        country : true,
        state : true
      }
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.BUYER.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.BUYER.INFO'), {
      ...userData
    });
  }

  async updateStatus(id: number): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.BUYER.NOT_FOUND'));
    }
    userData.isSuspended = !userData.isSuspended;
    userData.authTokenIssuedAt = null;
    userData.deviceToken = null;
    await this.userRepository.save(userData);

    return new ResponseSuccess(this.i18n.t('test.BUYER.STATUS_UPDATED'), {
      user: userData,
    });
  }

  async getUser(id: number): Promise<any> {
    const user = await this.validateActiveUserById(id);
    return new ResponseSuccess(this.i18n.t('test.BUYER.INFO'), { user });
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
      throw new BadRequestException(this.i18n.t('test.BUYER.NOT_FOUND'));
    }

    if (user.isSuspended) {
      throw new BadRequestException(this.i18n.t('test.BUYER.ACCOUNT_SUSPENDED'));
    }

    return user;
  }

  async addUpdateBuyer(
    addUpdateBuyerDto: UpdateBuyerProfileDto
  ): Promise<any> {
    const { id , email, phone, countryCode, password } = addUpdateBuyerDto;
    if (id) {
      const user = await this.userRepository.createQueryBuilder()
      .update(User)
      .set(addUpdateBuyerDto)
      .where('id = :id', { id })
      .execute();

      if (!user) {
        throw new BadRequestException(
          this.i18n.t('test.BUYER.NOT_FOUND'),
        );
      }

      return new ResponseSuccess(this.i18n.t('test.BUYER.UPDATED'), {
        user,
      }); 
    }else{

      const formattedPhone = countryCode + phone

      const userData = await this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .orWhere('user.formattedPhone = :formattedPhone', { formattedPhone })
      .getOne();
  
      if (userData && (userData.email === email || userData?.formattedPhone === formattedPhone)) {
        const msg = userData.email === email ? 'EMAIL_ALREADY_EXIST' : 'MOBILE_ALREADY_EXIST';
        throw new BadRequestException(this.i18n.t(`test.USER.${msg}`));
      }else{
        
      const createData = {
        ...addUpdateBuyerDto,
        password: await hashPassword(password),
        isPhoneVerified: true,
        isEmailVerified: true,
        formattedPhone: formattedPhone,
        step: 1,
        type: UserType.BUYER
      };

      const user = this.userRepository.create(createData);
      await this.userRepository.save(user);

      await this.mailService.sendMailToUser(userData, password);

      return new ResponseSuccess(this.i18n.t('test.BUYER.ADDED'), {
        user,
      });
      }
    }
  }

  async addWalletAmount(
    addAmount: any,
    req: any,
  ): Promise<any> {
    const { admin } = req;
    const { userId , amount } = addAmount;

    const user = await this.getUserById(userId);
    if (!user) {
      throw new BadRequestException(this.i18n.t('test.BUYER.NOT_FOUND'));
    }

    user.walletAmount = amount;

    await this.userRepository.save(user);

    // wallet txn
    const wallet = new WalletTransaction();
    wallet.user = user;
    wallet.userId = user.id;
    wallet.bookingId = null;
    wallet.transactionId = `txn_ad_${admin.id}_${new Date().valueOf()}`;
    wallet.amount = amount;
    wallet.paymentStatus = PaymentStatus.PAID;
    wallet.type = WalletTransactionType.CREDIT;
    wallet.addAmountBy = AmoountCreditBy.ADMIN;

    await this.walletTransactionRepository.save(wallet);

    return new ResponseSuccess(this.i18n.t('test.BUYER.AMOUNT_ADDED'), {});
  }

  async getTransaction(
    allUserDto: AllWalletDto
  ): Promise<any> {

    const {
      pagination = true,
      id,
      skip = 1,
      limit = 10
    } = allUserDto;

    const query = this.walletTransactionRepository
        .createQueryBuilder('wallet')
        .select('*')
        .where('wallet.userId = :userId', {
          userId: id,
        }).orderBy('wallet.created', 'DESC');

    const total = await query.getCount();
    

    if (pagination) {
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip) + 1;
      query.skip((perPage - 1) * limit).take(limit);
    }

    const records = await query.getRawMany();

    const response = {
      total,
      records,
      totalPage : Math.ceil(total / limit),
      totalRecords : records,
      page : Number(skip + 1)
    };

    return new ResponseSuccess(this.i18n.t('test.BUYER.TRANSACTION_HISTORY'), 
    { ...response });
  }

  async getWithdrawList(allList: AllWithDrawRequestDto): Promise<any> {
    const {
      page = 0,
      limit = 10,
      search = '',
    } = allList;


    const params = this.withdrawRequestRepository
    .createQueryBuilder('withdraw_request')
    .leftJoin('withdraw_request.user', 'user')

    // search filter
    if (search) {
      params.andWhere(
        `accountNumber like :searchTerm 
        or swift like :searchTerm 
        or firstName like :searchTerm
        or user.fullName like :searchTerm
         or lastName like :searchTerm
          or amount like :searchTerm
           or status like :searchTerm
        
        `,
        { searchTerm: `%${search}%` },
      );
    }

    params.orderBy('withdraw_request.created', 'DESC');
  
    // if pagination true
    const perPage = page == 0 ? Number(page) + 1 : Number(page) + 1;
      params.skip((perPage - 1) * limit).take(limit)

    const total = await params.getCount();
    // get records 
    const records = await params.getMany();

    const response = {
      total : total,
      records,
      totalPage : Math.ceil(total / limit),
      totalRecords : records,
      page : Number(page) + 1
    };

    return new ResponseSuccess('', response);
  }

  async getWithdrawInfo({ id }: any): Promise<any> {
    const query = await this.withdrawRequestRepository.findOne({
      where : {id : id},
      relations : {
        user : true
      }
    })

    return new ResponseSuccess('', query);
  }

  async updateWithdrawStatus(updateStatus: WalletUpdateStatusDto): Promise<any> {
    const { id , status} = updateStatus;

    const withdraw = await this.withdrawRequestRepository.findOne({
      where: {
        id,
      },
    });

    if (!withdraw) {
      throw new BadRequestException(this.i18n.t('test.BUYER.WALLET.NOT_FOUND'));
    }

    const user = await this.userRepository.findOne({
      where: {
        id : withdraw.userId,
        isDeleted : false
      },
    });

    if (!user) {
      throw new BadRequestException(this.i18n.t('test.BUYER.WALLET.NOT_FOUND'));
    }
    // user wallet 
    if(WithdrawStatus.APPROVED == WithdrawStatus[status]){
      user.holdAmount -= withdraw.amount;
    }
    if(WithdrawStatus.REJECTED == WithdrawStatus[status]){
      user.walletAmount += withdraw.amount;
      user.holdAmount -= withdraw.amount;
    }

    await this.userRepository.save(user);

    withdraw.status = WithdrawStatus[status];

    await this.withdrawRequestRepository.save(withdraw);

    return new ResponseSuccess(this.i18n.t('test.BUYER.WALLET.UPDATED'));
  }
  
}
