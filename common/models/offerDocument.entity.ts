import { FileType } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
  } from 'typeorm';

  import { Offer } from './offer.entity';
  @Entity({ name: 'offer_document' })
  export class OfferDocument {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: FileType, nullable: false })
    type: string;

    @Column({ type: 'varchar', nullable: false, default: '' })
    name: string;

    @Column({ type: 'varchar', nullable: false, default: '' })
    url: string;
  
    @ManyToOne(() => Offer, offer => offer.offerDocument)
    offer: Offer;
    
  }
  