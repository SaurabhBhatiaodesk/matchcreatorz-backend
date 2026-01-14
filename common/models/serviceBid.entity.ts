import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    ManyToOne
  } from 'typeorm';

  import { Service } from './service.entity';
  import { User } from './user.entity';
import { BidStatus } from 'common/enums/bidStatus.enum';
  @Entity({ name: 'service_bids' })
  export class ServiceBids {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Service, service => service.bidList)
    service: Service;

    @Column({ nullable: false })
    serviceId: number;

    @ManyToOne(() => User, usr => usr.id)
    user: User;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false, default: 0 })
    bidAmount: number;

    @Column({ nullable: false, default: 0 })
    connectUsed: number;

    @Column({ type: 'enum', enum: BidStatus, nullable: false, default: 'Pending' })
    type: BidStatus;

    @Column({ nullable: false, default: 5 })
    remainRebidCount: number;

    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;
    
  }
  