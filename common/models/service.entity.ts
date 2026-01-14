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
import { Tag } from './tag.entity';
import { Document } from './document.entity';
import { Images } from './serviceImage.entity';
import { ServiceType } from 'common/enums';
import { ServiceStatusType } from 'common/enums/serviceStatus.enum';
import { ServiceBids } from './serviceBid.entity';
@Entity({ name: 'service' })
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  categoryId: number;

  @Column({ nullable: false })
  countryId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true, default: 0 })
  minPrice: number;

  @Column({ nullable: true, default: 0 })
  maxPrice: number;

  @Column({ nullable: true })
  priceRange: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  // relation to user
  @ManyToOne(() => User, usr => usr.services)
  user: User;

  // relation to category
  @ManyToOne(() => Category, cat => cat.services)
  category: Category;

  @ManyToOne(() => Country, country => country.services)  
  country: Country; 

  @OneToMany(() => Document, document => document.service, { cascade: true })
  documents: Document[];

  @OneToMany(() => Images, i => i.service, { cascade: true })
  images: Images[];

  @Column({ type: 'enum', enum: ServiceType, nullable: true })
  type: ServiceType;

  @Column({ nullable: true  })
  recievedBid: number;

  @OneToMany(() => ServiceBids, bid => bid.service, { cascade: true })
  bidList: ServiceBids[];

  @Column({ type: 'enum', enum: ServiceStatusType, nullable: true, default : ServiceStatusType.OPEN })
  status: ServiceStatusType;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
