import { Gender, Language, UserType } from 'common/enums';
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
import { User } from './user.entity';
import { UserTag } from './userTag.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
@Entity({ name: 'user_reviews' })
export class UserReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  toId: number;

  @Column({ nullable: true })
  fromId: number;

  @Column({ nullable: true })
  bookingId: number;

  @Column({ nullable: true })
  totalStar: number;

  @Column({ type: 'text', nullable: true })
  reviewMessage: string;

  @ManyToOne(() => User, u => u.reviewsTo)  
  to: User; 

  @ManyToOne(() => User,  u => u.reviewsFrom)   
  from: User;

  @ManyToOne(() => Booking,  b => b.review)   
  booking: Booking;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: false })
  isDeleted: boolean;
  
  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
