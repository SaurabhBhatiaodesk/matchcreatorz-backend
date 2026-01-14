import { UserType, MessageType } from 'common/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user.entity';
import { ChatRequest } from './chatRequest.entity';
import { Offer } from './offer.entity';
import { Booking } from './booking.entity';

@Entity({ name: 'chat' })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (b) => b.id)
  buyer: User;

  @Column({ nullable: false })
  buyerId: number;

  @ManyToOne(() => User, (s) => s.id)
  seller: User;

  @Column({ nullable: false })
  sellerId: number;

  @Column({ nullable: true })
  offerId: number;

  @ManyToOne(() => Offer, or => or.id)
  offer: Offer;

  @Column({ nullable: true })
  bookingId: number;

  @ManyToOne(() => Booking, bo => bo.id)
  booking: Booking;

  @Column({ nullable: false })
  chatRequestId: number;
  
  @ManyToOne(() => ChatRequest, chatRequest => chatRequest.id)
  chatRequest: ChatRequest;

  @Column({ type: 'enum', enum: UserType, nullable: false,  })
  senderType: UserType;

  @Column({ type: 'enum', enum: UserType, nullable: false })
  receiverType: UserType;

  @Column({ type: 'enum', enum: MessageType, nullable: false })
  messageType: MessageType;

  @Column({ type: 'longtext', nullable: true })
  message: string;

  @Column({ type: 'boolean', default: false })
  isCounter: boolean;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'boolean', default: false })
  isDeletedBySeller: boolean;

  @Column({ type: 'boolean', default: false })
  isDeletedByBuyer: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
