import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable
  } from 'typeorm';

import { Service } from './service.entity';
import { User } from './user.entity';
import { OfferStatus } from 'common/enums/offerStatus.enum';
import { Country } from './country.entity';
import { Category } from './category.entity';
import { OfferDocument } from './offerDocument.entity';
import { OfferImage } from './offerImage.entity';
import { Tag } from './tag.entity';
import { PaymentStatus, UserType } from 'common/enums';
  @Entity({ name: 'offer' })
  export class Offer {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, usr => usr.id)
    buyer: User;

    @Column({ nullable: false })
    buyerId: number;

    @ManyToOne(() => User, usr => usr.id)
    seller: User;

    @Column({ nullable: false })
    sellerId: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    categoryId: number;

    @Column({ nullable: false })
    countryId: number;

    @Column({ nullable: true })
    price: number;

    @Column({ nullable: true })
    counterPrice: number;

    @Column({ type: 'enum', enum: UserType, nullable: true })
    counterBy: UserType;

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

    // relation to category
    @ManyToOne(() => Category, cat => cat.services)
    category: Category;

    @ManyToOne(() => Country, country => country.services)  
    country: Country; 

    @OneToMany(() => OfferDocument, d => d.offer, { cascade: true })
    offerDocument: OfferDocument[];

    @OneToMany(() => OfferImage, i => i.offer, { cascade: true })
    offerImage: OfferImage[];

    @Column({ type: 'enum', enum: UserType, nullable: true })
    offerBy: UserType;

    @Column({ type: 'enum', enum: OfferStatus, nullable: false, default: 'Pending' })
    status: OfferStatus;

    @Column({ type: 'enum', enum: PaymentStatus, nullable: false, default: 'Pending' })
    paymentStatus: PaymentStatus;

    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;
    
  }
  