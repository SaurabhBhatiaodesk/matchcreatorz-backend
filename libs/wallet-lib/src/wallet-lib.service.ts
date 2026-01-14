import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseSuccess } from 'common/dto';
import { User, UserBankAccount, WalletTransaction, WithdrawRequest } from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { WalletDto, SendWithdrawRequestDto, AllTxnsDto } from './dto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentStatus, WalletTransactionType } from 'common/enums';

@Injectable()
export class WalletLibService {
  private stripe: Stripe
    
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(WithdrawRequest) private withdrawRequestRepository: Repository<WithdrawRequest>,
    @InjectRepository(WalletTransaction) private walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(UserBankAccount) private userBankAccountRepository: Repository<UserBankAccount>,
    private readonly i18n: I18nService,
    private configService: ConfigService
  ) {
    this.stripe = new Stripe(
      process.env.NODE_ENV === 'DEVELOPMENT' ? 
      process.env.STRIPE_SECRET_KEY : 
      process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2022-11-15',
    });
  }


async getwallets(req: any): Promise<any> {
    const { user } = req;
    const userData = await this.userRepository.findOne({
      where: {
        id: user.id,
        isDeleted: false,
        isSuspended: false,
      },
      select: ['id', 'walletAmount'],
    },);
    if (!userData) {
      throw new BadRequestException(this.i18n.t('test.WALLET.NOT_FOUND'));
    }

  let walletAmount = 0;
  if(userData?.walletAmount){
    walletAmount = userData.walletAmount;
  }

  return new ResponseSuccess(this.i18n.t('test.WALLET.LIST'), {walletAmount});

}

async getWithdrawRequest(req: any): Promise<any> {
  const { user } = req;
  const withdrawData = await this.withdrawRequestRepository.find({
    where: {
      userId: user.id
    },
    order: {
      created: 'DESC', // Order by created in descending order
    }
  });
 return new ResponseSuccess(this.i18n.t('test.WALLET.INFO'), withdrawData);
}

async sendWithdrawRequest(
  sendWithdrawRequestDto: SendWithdrawRequestDto,
  req: any,
): Promise<any> {
  const { user } = req; 

  const { amount, accountNumber, iban, swift, countryId, firstName, lastName } = sendWithdrawRequestDto;


    if(amount > user.walletAmount){
      throw new BadRequestException(this.i18n.t('test.WALLET.INSUFFICIENT_AMOUNT'));
    }

    const userAccount = await this.userBankAccountRepository.findOne({ 
      where: { 
        accountNumber, 
        userId : user.id,
        isDeleted : false} });

    if (!userAccount) {
      const userBank = new UserBankAccount();
      userBank.user = user;
      userBank.accountNumber = accountNumber;
      userBank.iban = iban;
      userBank.swift = swift;
      userBank.countryId = countryId;
      userBank.firstName = firstName;
      userBank.lastName = lastName;
      await this.userBankAccountRepository.save(userBank);
    }

    const withdraw = new WithdrawRequest();
    withdraw.user = user;
    withdraw.accountNumber = accountNumber;
    withdraw.iban = iban;
    withdraw.swift = swift;
    withdraw.countryId = countryId;
    withdraw.firstName = firstName;
    withdraw.lastName = lastName;
    withdraw.amount = amount;
    await this.withdrawRequestRepository.save(withdraw);

    user.walletAmount -= amount;
    user.holdAmount += amount; // Amount holded
    await this.userRepository.save(user);
    
    return new ResponseSuccess(this.i18n.t('test.WALLET.REQUESTED'));
  
}

async getWalletTransaction(req: any, allTxns: AllTxnsDto): Promise<any> {
  const { limit } = allTxns;
  let { skip } = allTxns;
  const { user } = req;
  skip = skip == 0 ? 1 : Number(skip) ;
  // Fetch total count for pagination
  const [withdrawTransaction, totalCount] = await this.walletTransactionRepository.findAndCount({
    where: {
      userId: user.id,
      paymentStatus: PaymentStatus.PAID,
    },
    order: {
      created: 'DESC',
    },
    skip: Number(skip) - 1, 
    take: Number(limit),
  });

  const response = {
    total : totalCount,
    result : withdrawTransaction,
  };


  return new ResponseSuccess(this.i18n.t('test.WALLET.WALLET_TRANSACTION'), response);
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

  async getTransaction(
    id: any
  ): Promise<any> {
    const user = await this.getUserById(id);
    
    if (!user) {
      throw new BadRequestException(this.i18n.t('test.WALLET.NOT_FOUND'));
    }

    const records = {
      transactions : [],
      amount : 0
    }

    return new ResponseSuccess(this.i18n.t('test.WALLET.TRANSACTION_HISTORY'), {
      records : records,
    });
  }

  async addWalletAmount(
    addAmount: WalletDto,
    req: any,
  ): Promise<any> {
    const { userId , amount } = addAmount;
    const { user } = req;
    try {
      const data = await this.getUserById(userId);
      if (!data) {
        throw new BadRequestException(this.i18n.t('test.WALLET.NOT_FOUND'));
      }

      const urlWeb = `${this.configService.get('WEB_URL')}`;
      const orderId = `${user.id}_${new Date().valueOf()}`;
  
      const session = await this.stripe.checkout.sessions.create({
        client_reference_id: orderId,
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: this.configService.get('SITE_TITLE'),
              description: this.configService.get('DESCRIPTION'),
              images: [`${this.configService.get('ADMIN_URL')}assets/logo-CNsCFeLe.svg`],
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        metadata: {
          merchant_order_id: orderId,
        },
        mode: "payment",
        success_url: `${urlWeb}/wallets/success?orderId=${orderId}&userId=${user.id}`,
        cancel_url: `${urlWeb}/wallets/cancel?orderId=${orderId}&userId=${user.id}`,
      });
  
      if (session && session.id) {
  
        const wallet = new WalletTransaction();
        wallet.user = user;
        wallet.userId = user.id;
        wallet.orderId = orderId;
        wallet.bookingId = null;
        wallet.transactionId = session.id;
        wallet.amount = amount;
        if(session?.payment_status === 'paid'){
          wallet.paymentStatus = PaymentStatus.PAID;
        }else{
          wallet.paymentStatus = PaymentStatus.FAILED;
        }
        wallet.type = WalletTransactionType.CREDIT;
        wallet.addAmountBy = 'USER';
  
        await this.walletTransactionRepository.save(wallet);
  
        return new ResponseSuccess(this.i18n.t('test.WALLET.SUCCESS'), {
          success: true,
          url: session.url,
        });
      }else{
        return new ResponseSuccess(this.i18n.t('test.WALLET.FAILED'), {
          success: false,
          message: 'Failed to create Stripe session',
        });
      }
    } catch (error) {
      return new ResponseSuccess(this.i18n.t('test.WALLET.FAILED'), {
        success: false,
        error: error,
        message: 'Failed to create Stripe session',
      });
      
    }
  
  }

  async success(
    req: any,
    params : any
  ): Promise<any> {

    const txnData = await this.walletTransactionRepository.findOne({
      where: {
        userId: params?.userId,
        orderId: params?.orderId,
      },
    },);

    if (!txnData) {
      throw new BadRequestException(this.i18n.t('Transaction not found'));
    }

    return new ResponseSuccess(this.i18n.t('test.WALLET.SUCCESS'), {
      ...txnData
    });
  }

  async failed(
    req: any,
    params : any
  ): Promise<any> {
    const txnData = await this.walletTransactionRepository.findOne({
      where: {
        userId: params?.userId,
        orderId: params?.orderId,
      },
    },);

    if (!txnData) {
      throw new BadRequestException(this.i18n.t('TXN not found'));
    }

    return new ResponseSuccess(this.i18n.t('test.WALLET.FAILED'), {  
      ...txnData
    });
  }

  async webhook(
    req: any,
  ): Promise<any> {
    const request = req?.body ?? req?.params ?? req?.query;

    if(request?.type === 'checkout.session.completed' && request?.data?.object?.payment_status === 'paid'){
      const withdrawTransaction = await this.walletTransactionRepository.findOne({
        where: {
          transactionId: request?.data?.object.id
        }
      });

      withdrawTransaction.paymentFailedSuccessReason = request?.data;

      withdrawTransaction.paymentStatus = request?.data?.object?.payment_status;

      await this.walletTransactionRepository.save(withdrawTransaction);
      
      const data = await this.getUserById(withdrawTransaction.userId);
      if (!data) {
        throw new BadRequestException(this.i18n.t('test.WALLET.NOT_FOUND'));
      }

      data.walletAmount += withdrawTransaction.amount;
      await this.userRepository.save(data);
  }
  if(request?.data?.type === 'checkout.session.failed'){
    const withdrawTransaction = await this.walletTransactionRepository.findOne({
      where: {
        transactionId: request?.data?.object.id
      }
    });

    withdrawTransaction.paymentStatus = PaymentStatus.FAILED;
    withdrawTransaction.paymentFailedSuccessReason = request?.data;

    await this.walletTransactionRepository.save(withdrawTransaction);
}

    return new ResponseSuccess(this.i18n.t('test.WALLET.WEBHOOK_RESP'), {  
    });
  }

  async connectTransaction(req: any): Promise<any> {
    const { user } = req;
    const withdrawTransaction = await this.walletTransactionRepository.find({
      where: {
        userId: user.id,
        paymentStatus: PaymentStatus.PAID
      },
      order: {
        created: 'DESC', // Order by created in descending order
      }
    });
   return new ResponseSuccess(this.i18n.t('test.WALLET.WALLET_TRANSACTION'), withdrawTransaction);
  }

  async addConnect(
    addAmount: WalletDto,
    req: any,
  ): Promise<any> {
    const { userId , amount } = addAmount;
    const { user } = req;
    try {
      const data = await this.getUserById(userId);
      if (!data) {
        throw new BadRequestException(this.i18n.t('test.WALLET.NOT_FOUND'));
      }

      const urlWeb = `${this.configService.get('WEB_URL')}`;
      const orderId = `${user.id}_${new Date().valueOf()}`;
  
      const session = await this.stripe.checkout.sessions.create({
        client_reference_id: orderId,
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: this.configService.get('SITE_TITLE'),
              description: this.configService.get('DESCRIPTION'),
              images: [`${this.configService.get('ADMIN_URL')}assets/logo-CNsCFeLe.svg`],
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        metadata: {
          merchant_order_id: orderId,
        },
        mode: "payment",
        success_url: `${urlWeb}/wallets/success?orderId=${orderId}&userId=${user.id}`,
        cancel_url: `${urlWeb}/wallets/cancel?orderId=${orderId}&userId=${user.id}`,
      });
  
      if (session && session.id) {
        const wallet = new WalletTransaction();
        wallet.user = user;
        wallet.userId = user.id;
        wallet.orderId = orderId;
        wallet.bookingId = null;
        wallet.transactionId = session.id;
        wallet.amount = amount;
        if(session?.payment_status === 'paid'){
          wallet.paymentStatus = PaymentStatus.PAID;
        }else{
          wallet.paymentStatus = PaymentStatus.FAILED;
        }
        wallet.type = WalletTransactionType.CREDIT;
        wallet.addAmountBy = 'USER';
  
        await this.walletTransactionRepository.save(wallet);
  
        return new ResponseSuccess(this.i18n.t('test.WALLET.SUCCESS'), {
          success: true,
          url: session.url,
        });
      }else{
        return new ResponseSuccess(this.i18n.t('test.WALLET.FAILED'), {
          success: false,
          message: 'Failed to create Stripe session',
        });
      }
    } catch (error) {
      return new ResponseSuccess(this.i18n.t('test.WALLET.FAILED'), {
        success: false,
        error: error,
        message: 'Failed to create Stripe session',
      });
      
    }
  
  }
}
