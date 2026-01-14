import { PaymentStatus, WalletTransactionType } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn,
    ManyToOne
  } from 'typeorm';
  import { User } from './user.entity';
  import { Booking } from './booking.entity';
import { PayoutTransactionType } from 'common/enums/payoutType.enum';
import { Connect } from './connect.entity';
  @Entity({ name: 'wallet_transaction' })
  export class WalletTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
  
    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => Booking, (booking) => booking.walletTransaction)
    booking: Booking;
  
    @Column({ nullable: true })
    bookingId: number;

    @ManyToOne(() => Connect, (c) => c.id)
    connect: Connect;

    @Column({ nullable: true })
    connectId: number;

    @Column({ nullable: true })
    orderId: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transactionId: string;

    @Column({ type: 'enum', enum: PaymentStatus, nullable: false, default: 'Pending' })
    paymentStatus: PaymentStatus;
    
    @Column({ type: 'json', nullable: true })
    paymentFailedSuccessReason: Record<string, any>;

    @Column({ nullable: false, default: 0 })
    amount: number;

    @Column({ type: 'enum', enum: PayoutTransactionType, nullable: false })
    payoutType: PayoutTransactionType;

    @Column({ type: 'enum', enum: WalletTransactionType, nullable: false })
    type: WalletTransactionType;

    @Column({ type: 'varchar', length: 255, nullable: true })
    addAmountBy: string;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

  }
  