import { FileType } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    ManyToOne
  } from 'typeorm';

  import { Booking } from './booking.entity';
  @Entity({ name: 'booking_image' })
  export class BookingImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: FileType, nullable: false })
    type: string;

    @Column({ type: 'varchar', nullable: false, default: '' })
    url: string;
  
    @ManyToOne(() => Booking, booking => booking.images)
    booking: Booking;
  }
  