import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { Connect, User, WalletTransaction, ConnectTransaction } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AllConnectDto, AddUpdateConnectDto } from './dto';
import { PayoutTransactionType } from 'common/enums/payoutType.enum';
import { PaymentStatus, WalletTransactionType } from 'common/enums';
import { AddConnectDto } from 'apps/user/src/modules/connects/dto/addConnect.dto';


@Injectable()
export class ConnectLibService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Connect) private conenctRepository: Repository<Connect>,
    @InjectRepository(ConnectTransaction) private connectTransactionRepository: Repository<ConnectTransaction>,
    @InjectRepository(WalletTransaction) private walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(Connect) private connectRepository: Repository<Connect>,
    private readonly i18n: I18nService,
  ) {}


  async getConnects(): Promise<any> {
    const connectData = await this.conenctRepository.find({
      where: {
        isDeleted: false,
        isSuspended: false,
      },
      order: {
        created: "DESC",
      }
    });
    return new ResponseSuccess(this.i18n.t('test.CONNECT.GET_DATA'), connectData);
  }

  async getTotalConnects(req: any): Promise<any> {
    const { user } = req;
    const userData = await this.userRepository.findOne({
      where: {
        id: user.id,
        isDeleted: false,
        isSuspended: false,
      },
      select: ['id', 'totalConnects'],
    },);
    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.CONNECT.NOT_FOUND'));
    }

  let totalConnects = 0;
  if(userData?.totalConnects){
    totalConnects = userData.totalConnects;
  }

  return new ResponseSuccess(this.i18n.t('test.CONNECT.GET_DATA'), {totalConnects});

}

  async all(allConnetDto: AllConnectDto): Promise<any> {
    const {
      pagination = true,
      skip,
      limit = 10,
      searchTerm = '',
      sortBy = 'id',
      sortDirection = 'DESC',
      activeStatus = 'ALL',
    } = allConnetDto;

    const query = this.conenctRepository
      .createQueryBuilder()
      .select('*')
      .where('isDeleted = :isDeleted', {
        isDeleted: false,
      });

    // search filter
    if (searchTerm) {
      query.andWhere(
        'planName like :searchTerm',
        { searchTerm: `%${searchTerm}%` },
      );
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
      query.skip((perPage - 1) * limit).take(limit)
    }

    // get records
    const records = await query.getRawMany();

    const response = {
      total,
      records,
      totalPage : Math.ceil(total / limit),
      totalRecords : records,
      page : skip + 1
    };

    return new ResponseSuccess('', response);
  }

  async addUpdateConnect(
    addUpdateConnectDto: AddUpdateConnectDto
  ): Promise<any> {
    const {  id, planName, price, connects, description } = addUpdateConnectDto;
    if (id) {
      const connect = await this.conenctRepository.findOne({
        where: {
          id,
        },
      });

      if (!connect) {
        throw new BadRequestException(
          this.i18n.t('test.CONNECT.NOT_FOUND'),
        );
      }
      connect.planName = planName;
      connect.price = price;
      connect.connects = connects;
      if(description){
        connect.description = description;
      }
      await this.conenctRepository.save(connect);

      return new ResponseSuccess(this.i18n.t('test.CONNECT.UPDATED'), {
        ...connect,
      });
    }else{
      const connect = new Connect();
      connect.planName = planName
      connect.price = price;
      connect.connects = connects;
      if(description){
        connect.description = description;
      }
      await this.conenctRepository.save(connect);
      return new ResponseSuccess(this.i18n.t('test.CONNECT.ADDED'), {
        ...connect,
      });
    }
  }

  async get(id: number): Promise<any> {
    const connect = await this.conenctRepository.findOne({
      where: { id },
    });

    if (!connect) {
      throw new BadRequestException(this.i18n.t('test.CONNECT.NOT_FOUND'));
    }

    return new ResponseSuccess(this.i18n.t('test.CONNECT.INFO'), {
      ...connect,
    });
  }

  async updateStatus(id: number): Promise<any> {
    const connectData = await this.conenctRepository.findOne({
      where: {
        id,
      },
    });

    if (!connectData) {
      throw new BadRequestException(this.i18n.t('test.CONNECT.NOT_FOUND'));
    }
    connectData.isSuspended = !connectData.isSuspended;
    await this.conenctRepository.save(connectData);

    return new ResponseSuccess(this.i18n.t('test.CONNECT.STATUS_UPDATED'), {
      record: connectData,
    });
  }

  async delete(id: number): Promise<any> {
    const connectData = await this.conenctRepository.findOne({
      where: {
        id,
      },
    });

    if (!connectData) {
      throw new BadRequestException(this.i18n.t('test.CONNECT.NOT_FOUND'));
    }
    connectData.isDeleted = true;
    await this.conenctRepository.save(connectData);

    return new ResponseSuccess(this.i18n.t('test.CONNECT.DELETED'));
  }

  async getConnectsTxns(req: any): Promise<any> {
    const { 
      user,  
      userId,
      skip = 1,
      limit = 10 } = req;
    const connectTransaction = this.connectTransactionRepository
    .createQueryBuilder('connect')
    .innerJoinAndSelect("connect.user", "user")
    .orderBy('connect.created', 'DESC')

    if(!user){
      connectTransaction.where('user.id = :userId', {  userId: Number(userId) });

      const total = await connectTransaction.getCount();
      const perPage = skip == 0 ? Number(skip) + 1 : Number(skip);
      connectTransaction.skip((perPage - 1) * limit).take(limit)

      const records = await connectTransaction.getMany();

      const response = {
        total,
        records,
        totalPage : Math.ceil(total / limit),
        totalRecords : records,
        page : Number(skip + 1)
      };

      return new ResponseSuccess(this.i18n.t('test.BUYER.TRANSACTION_HISTORY'), 
      { ...response });
    }else{
      connectTransaction.andWhere('userId = :userId', {
        userId: user.id,
      })
      .orderBy('connect.created', 'DESC')

      const records = await connectTransaction.getMany();
  
     return new ResponseSuccess(this.i18n.t('test.WALLET.WALLET_TRANSACTION'), {connectTransaction : records});
    }
  }

  async addConnects(
    addConnect: AddConnectDto,
    req: any,
  ): Promise<any> {
      const { connectId, userId } = addConnect;
      let { user } = req;

      if(userId){
        user = await this.userRepository.findOne({
          where: {
            id: userId,
            isDeleted: false,
            isSuspended: false,
          },
          select: ['id', 'totalConnects', 'walletAmount', 'totalConnects'],
        });

        if (!user) {
          throw new BadRequestException(this.i18n.t('test.CONNECT.NOT_FOUND'));
        }
      }

      const connects = await this.connectRepository.findOne({
        where : { id : connectId }
      })

      if(!connects){
        throw new BadRequestException(this.i18n.t('test.CONNECT.NOT_FOUND'));
      }

      if(connects?.price > user.walletAmount){
          throw new BadRequestException(this.i18n.t('test.CONNECT.INSUFFICIENT_AMOUNT'));
      }else{
        const connectId = `txn_${user.id}${new Date().valueOf()}`;

        // save connect txn
        const connect = new ConnectTransaction();
        connect.user = user;
        connect.userId = user.id;
        connect.connectId = connects?.id;
        connect.transactionId = connectId;
        connect.amount = connects?.price;
        connect.numberOfConnects = connects?.connects ?? 0;
        connect.paymentStatus = 'paid';
        connect.type = WalletTransactionType.CREDIT;
        await this.connectTransactionRepository.save(connect);

        user.totalConnects += connects?.connects;

        // save wallet txn
        const wallet = new WalletTransaction();
        wallet.user = user;
        wallet.userId = user.id;
        wallet.connectId = connects?.id;
        wallet.transactionId = connectId;
        wallet.amount = connects?.price;
        wallet.paymentStatus = PaymentStatus.PAID;
        wallet.type = WalletTransactionType.DEBIT;
        wallet.payoutType = PayoutTransactionType.CONNECT;
        wallet.addAmountBy = 'USER';
  
        user.walletAmount -= connects?.price;
        await this.userRepository.save(user);

        await this.walletTransactionRepository.save(wallet);
  
        return new ResponseSuccess(this.i18n.t('test.WALLET.SUCCESS'));
      }  
  }

}
