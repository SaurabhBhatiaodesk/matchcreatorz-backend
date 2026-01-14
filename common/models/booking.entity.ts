import { BookingStatus, CompletionProcess, PaymentStatus, SettlementStatus, UserType } from 'common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany
} from 'typeorm';

import { User } from './user.entity';
import { Category } from './category.entity';
import { Country } from './country.entity';
import { BookingDocument } from './bookingDocument.entity';
import { BookingImage } from './bookingImage.entity';
import { Service } from './service.entity';
import { Offer } from './offer.entity';
import { Tag } from './tag.entity';
import { Milestone } from './milestone.entity';
import { CompletionProof } from './completionProof.entity';
import { WalletTransaction } from './walletTransaction.entity';
import { UserReviews } from './userReview.entity';

@Entity({ name: 'booking' })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  categoryId: number;

  @Column({ nullable: false })
  countryId: number;

  @ManyToOne(() => Service, service => service.id)
  service: Service;

  @Column({ nullable: true })
  serviceId: number;

  @ManyToOne(() => Offer, offer => offer.id)
  offer: Offer;

  @Column({ nullable: true })
  offerId: number;

  @Column({ nullable: false })
  buyerId: number;

  // relation to user
  @ManyToOne(() => User, usr => usr.id)
  buyer: User;

  @Column({ nullable: false })
  sellerId: number;

  @ManyToOne(() => User, usr => usr.id)
  seller: User;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false, default: 0 })
  platformFee: number;

  @Column({ nullable: false })
  totalAmount: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @OneToOne(() => WalletTransaction, walletTransaction => walletTransaction.booking)
  walletTransaction: WalletTransaction;

  @Column({ nullable: true })
  walletTransactionId: number;

  @OneToOne(() => UserReviews, userReviews => userReviews.booking)
  review: UserReviews;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  // relation to category
  @ManyToOne(() => Category, cat => cat.services)
  category: Category;

  @ManyToOne(() => Country, country => country.services)  
  country: Country; 

  @OneToMany(() => BookingDocument, document => document.booking, { cascade: true })
  documents: BookingDocument[];

  @OneToMany(() => Milestone, m => m.booking)
  milestones: Milestone[];

  @OneToMany(() => BookingImage, image => image.booking, { cascade: true })
  images: BookingImage[];

  @Column({ type: 'enum', enum: BookingStatus, nullable: false, default: 'Pending' })
  status: BookingStatus;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: false, default: 'Pending' })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

  @Column({ nullable: false, default: 0 })
  settlementAmountProposed: number;

  @Column({ nullable: false, default: 0 })
  counterAmountProposed: number;

  @Column({ nullable: false, default: 0 }) // For Seller
  settlementAmount: number;

  @Column({ nullable: false, default: 0 }) // For Buyer
  refundAmount: number;

  @Column({ type: 'enum', enum: UserType, nullable: true,  })
  cancelByType: UserType;

  @Column({ type: 'enum', enum: UserType, nullable: true,  })
  counterBy: UserType;

  @Column({ type: 'enum', enum: SettlementStatus, nullable: true })
  settlementStatus: SettlementStatus;

  @OneToMany(() => CompletionProof, image => image.booking, { cascade: true })
  completionProof: CompletionProof[];

  @Column({ type: 'enum', enum: CompletionProcess, nullable: true })
  completionProcess: CompletionProcess;

  @Column({ type: 'enum', enum: UserType, nullable: true,  })
  completeByType: UserType;

  @Column({ type: 'enum', enum: UserType, nullable: true,  })
  disputeByType: UserType;

  @Column({ type: 'enum', enum: SettlementStatus, nullable: true })
  disputeStatus: SettlementStatus;

  @Column({ default: false })
  isSettled: boolean;

  @Column({ default: false })
  isRated: boolean;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
