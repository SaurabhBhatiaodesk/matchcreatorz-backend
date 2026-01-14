import { Gender, Language, UserType, ProfileStatus } from 'common/enums';
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

import { Country } from './country.entity';
import { State } from './state.entity';
import { City } from './city.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { UserTag } from './userTag.entity';
import { Service } from './service.entity';
import { Notification } from './notification.entity';
import { Favorite } from './userFavorite.entity';
import { ConnectTransaction } from './connectTransaction.entity';
import { UserReviews } from './userReview.entity';
import { SocialAccount } from './socialAccount.entity';
@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserType, nullable: true })
  type: UserType;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  tempEmail: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  formattedPhone: string;

  @Column({ nullable: true })
  tempFormattedPhone: string;

  @Column({ nullable: true })
  tempCountryCode: string;

  @Column({ nullable: true })
  tempPhone: string;

  @Column({ nullable: true, default: 0 })
  minPrice: number;

  @Column({ nullable: true, default: 0 })
  maxPrice: number;

  @Column({ nullable: true })
  priceRange: string;

  @Column({ type: 'date', nullable: true })
  dob: string; // Using string for simplicity

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  stateId: number;

  @Column({ nullable: true })
  city: string;

  @ManyToOne(() => Country, country => country.users)  
  country: Country; 

  @ManyToOne(() => State, state => state.users)   
  state: State;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: false, default: 1 })
  step: number;

  @Column({ default: false })
  isProfileUpdated: boolean;

  @Column({ type: 'enum', enum: ProfileStatus,  default: 'PENDING', nullable: true })
  profileStatus: string;

  @Column({ default: false })
  isFAQUpdated: boolean;

  @Column({ default: false })
  isPorfolioUpdated: boolean;

  @Column({ nullable: true })
  gallery: string;

  @Column({ nullable: true, default: 0 })
  avgRating: number;

  @Column({ nullable: true, default: 0 })
  totalRating: number;

  @Column({ nullable: true, default: 0 })
  latitude: number;

  @Column({ nullable: true, default: 0 })
  longitude: number;

  @Column({ nullable: true, default: 0 })
  notificationCount: number;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  resumeName: string;

  @Column({ nullable: true })
  resume: string;

  @Column({ nullable: true, default: 10 })
  responseTime: number;

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags: UserTag[];

  // relation to category
  @ManyToOne(() => Category, (category) => category.users)
  category: Category;

  // relation to service for category
  @OneToMany(() => Service, service => service.user)
  services: Service[];

  @ManyToMany(() => Favorite, userFavorite => userFavorite.favoriteBy)
  favoritedBy: Favorite[];

  @ManyToMany(() => Favorite, userFavorite => userFavorite.favoriteTo)
  favoriteTo: Favorite[];

  @OneToMany(() => Notification, notification => notification.sender)
  sentNotifications: Notification[];

  @OneToMany(() => Notification, notification => notification.receiver)
  receivedNotifications: Notification[];

  @OneToMany(() => ConnectTransaction, ct => ct.user)
  connectTransactions: ConnectTransaction[];

  @OneToMany(() => UserReviews, service => service.from)
  reviewsFrom: UserReviews[];

  @OneToMany(() => UserReviews, service => service.to)
  reviewsTo: UserReviews[];

  @OneToMany(() => SocialAccount, (social) => social.user)
  socialAccounts: SocialAccount[];

  @Column({ nullable: true, default: 0 })
  walletAmount: number;

  @Column({ nullable: true, default: 0 })
  holdAmount: number;

  @Column({ nullable: true, default: 0 })
  totalEarningAmount: number;

  @Column({ nullable: true, default: 0 })
  totalCompletedJobs: number;

  @Column({ nullable: true, default: 0 })
  totalConnects: number;

  @Column({ nullable: true, default: 0 })
  totalExpenditure: number;

  @Column({ type: 'enum', enum: Language, nullable: true })
  language: Language;

  @Column({ nullable: true })
  deviceToken: string;

  @Column({ default: true })
  pushNotificationAllowed: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  rejectReason: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'bigint' })
  authTokenIssuedAt: number;

  @Column({ nullable: true, type: 'datetime' })
  authTokenIssuedDateAt: Date;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
