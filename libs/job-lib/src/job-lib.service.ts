import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Booking,
  User,
  WalletTransaction
} from 'common/models';
import { I18nService } from 'nestjs-i18n';
import { Repository, LessThan } from 'typeorm';
import {
  BookingStatus,
  NotificationStatus,
  NotificationType,
  PaymentStatus,
  SettlementStatus,
  WalletTransactionType,
} from 'common/enums';
import { PayoutTransactionType } from 'common/enums/payoutType.enum';
import { FcmService } from 'common/utils';
@Injectable()
export class JobLibService {
  constructor(
    private readonly i18n: I18nService,
    private readonly fcmService: FcmService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(WalletTransaction)private walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  async completedBookingSettlement() {
    const now = new Date();
    const completedTimeLimit = new Date(now.getTime() - 96 * 60 * 60 * 1000); // Subtracting 96 hours from current time
    const result = await this.bookingRepository.find({
      where: { 
        status: BookingStatus.COMPLETED, 
        paymentStatus:PaymentStatus.PAID, 
        updated:LessThan(completedTimeLimit),
        isSettled:false,
        isDeleted: false 
      }
    });

    if(result.length >0){
      for (const payout of result) {
        const userData = await this.userRepository.findOne({
          where: {
            id:payout.sellerId,
            isDeleted: false,
          },
        });
        if(userData){
          // update user waller
          userData.walletAmount += payout.settlementAmount;
          await this.userRepository.save(userData);

          // create wallet Transaction
          const transactionId = `txn_${userData.id}${new Date().valueOf()}`;
          const walletTransaction = new WalletTransaction();
          walletTransaction.user = userData;
          walletTransaction.userId = userData.id;
          walletTransaction.bookingId = payout.id;
          walletTransaction.transactionId = transactionId;
          walletTransaction.amount = payout.settlementAmount;
          walletTransaction.paymentStatus = PaymentStatus.PAID;
          walletTransaction.type = WalletTransactionType.CREDIT;
          walletTransaction.payoutType = PayoutTransactionType.BOOKING;
          await this.walletTransactionRepository.save(walletTransaction);

          // Update Payout Data
          payout.isSettled = true;
          await this.bookingRepository.save(payout);
        }
      }
    }  
  }

  async cancelledBookingSettlement() {
    const now = new Date();
    const cancelledTimeLimit = new Date(now.getTime() - 96 * 60 * 60 * 1000); // Subtracting 96 hours from current time
    const result = await this.bookingRepository.find({
      where: { 
        status: BookingStatus.CANCELLED, 
        paymentStatus:PaymentStatus.PAID, 
        updated:LessThan(cancelledTimeLimit),
        isSettled:false,
        isDeleted: false 
      }
    });

    if(result.length >0){
      for (const payout of result) {
        // Seller Amount Settle
        const sellerData = await this.userRepository.findOne({
          where: {
            id:payout.sellerId,
            isDeleted: false,
          },
        });
        if(sellerData){
          // update user waller
          sellerData.walletAmount += payout.settlementAmount;
          await this.userRepository.save(sellerData);

          // create wallet Transaction
          const transactionId = `txn_${sellerData.id}${new Date().valueOf()}`;
          const walletTransaction = new WalletTransaction();
          walletTransaction.user = sellerData;
          walletTransaction.userId = sellerData.id;
          walletTransaction.bookingId = payout.id;
          walletTransaction.transactionId = transactionId;
          walletTransaction.amount = payout.settlementAmount;
          walletTransaction.paymentStatus = PaymentStatus.PAID;
          walletTransaction.type = WalletTransactionType.CREDIT;
          walletTransaction.payoutType = PayoutTransactionType.BOOKING;
          await this.walletTransactionRepository.save(walletTransaction);
        }

         // Buyer Amount Settle
        const buyerData = await this.userRepository.findOne({
          where: {
            id:payout.buyerId,
            isDeleted: false,
          },
        });
        if(buyerData){
          // update buyer  wallet
          buyerData.walletAmount += payout.refundAmount;
          await this.userRepository.save(buyerData);

          // create wallet Transaction
          const transactionId = `txn_${buyerData.id}${new Date().valueOf()}`;
          const walletTransaction = new WalletTransaction();
          walletTransaction.user = buyerData;
          walletTransaction.userId = buyerData.id;
          walletTransaction.bookingId = payout.id;
          walletTransaction.transactionId = transactionId;
          walletTransaction.amount = payout.refundAmount;
          walletTransaction.paymentStatus = PaymentStatus.PAID;
          walletTransaction.type = WalletTransactionType.CREDIT;
          walletTransaction.payoutType = PayoutTransactionType.BOOKING;
          await this.walletTransactionRepository.save(walletTransaction);
        }

        // Update Payout Data
        payout.isSettled = true;
        await this.bookingRepository.save(payout);
      }
    }  
  }

  async autoAcceptedCancelledBooking() {
    const now = new Date();
    const cancelledTimeLimit = new Date(now.getTime() - 96 * 60 * 60 * 1000); // Subtracting 96 hours from current time
    const result = await this.bookingRepository.find({
      where: { 
        status: BookingStatus.AMIDST_CANCELLATION, 
        paymentStatus:PaymentStatus.PAID, 
        updated:LessThan(cancelledTimeLimit),
        isSettled:false,
        isDeleted: false 
      }
    });

    if(result.length >0){
      for (const payout of result) {
        // Seller Amount Settle
        const sellerData = await this.userRepository.findOne({
          where: {
            id:payout.sellerId,
            isDeleted: false,
          },
        });

        // Buyer Amount Settle
        const buyerData = await this.userRepository.findOne({
          where: {
            id:payout.buyerId,
            isDeleted: false,
          },
        });
        // Send Notifcation to Seller
        if(sellerData){
          // Send Notiifcation to Seller 
          await this.fcmService.saveNotification({
            deviceToken : sellerData?.deviceToken ?? '',
            deviceType : '',
            title :  this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_AUTO_ACCEPTED'),
            description : this.i18n.t('test.NOTIFICATION.ACCEPT_SETTLEMENT'),    
            type : NotificationType.SYSTEM_GENERATED,
            recieverId : payout.sellerId,
            senderId : buyerData?.id,
            senderType: buyerData.type,
            receiverType: sellerData.type,
            metaData : {
              type : NotificationStatus.BOOKING,
              bookingId : payout.id
            },
          })
        }

        // Send Notifcation to Buyer
        if(buyerData){
            // Send Notiifcation to Seller 
          await this.fcmService.saveNotification({
            deviceToken : buyerData?.deviceToken ?? '',
            deviceType : '',
            title : this.i18n.t('test.NOTIFICATION.PUSH_MESSAGES.SETTLEMENT_AUTO_ACCEPTED'),
            description : this.i18n.t('test.NOTIFICATION.ACCEPT_SETTLEMENT'),    
            type : NotificationType.SYSTEM_GENERATED,
            recieverId : payout.sellerId,
            senderId : sellerData?.id,
            senderType: sellerData.type,
            receiverType: buyerData.type,
            metaData : {
              type : NotificationStatus.BOOKING,
              bookingId : payout.id
            },
          })
        }

        // Automatically accepted after 96 hrs
        payout.settlementStatus = SettlementStatus.ACCEPTED;
        payout.status = BookingStatus.CANCELLED;
        if(payout.counterAmountProposed){
          payout.settlementAmount = payout.counterAmountProposed;
          payout.refundAmount = payout.price - payout.counterAmountProposed;
        }else{
          payout.settlementAmount = payout.settlementAmountProposed;
          payout.refundAmount = payout.price - payout.settlementAmountProposed;
        }
        // Update Payout Data
        await this.bookingRepository.save(payout);
      }
    }  
  }


}
