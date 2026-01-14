import { WalletTransactionType } from 'common/enums';
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
import { Service } from './service.entity';
  @Entity({ name: 'connect_transaction' })
  export class ConnectTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.connectTransactions)
    user: User;
  
    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: true })
    bidId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transactionId: string;

    @ManyToOne(() => Connect, (c) => c.id)
    connect: Connect;

    @Column({ nullable: true })
    connectId: number;

    @ManyToOne(() => Service, (c) => c.id)
    service: Service;

    @Column({ nullable: true })
    serviceId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    paymentStatus: string;

    @Column({ nullable: false, default: 0 })
    numberOfConnects: number;

    @Column({ nullable: false, default: 0 })
    amount: number;

    @Column({ type: 'enum', enum: WalletTransactionType, nullable: false })
    type: WalletTransactionType;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

  }
  