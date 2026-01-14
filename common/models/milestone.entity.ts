import { BookingStatus, PaymentStatus } from 'common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

;
import { Tag } from './tag.entity';
import { Booking } from './booking.entity';

@Entity({ name: 'booking_milestone' })
export class Milestone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  bookingId: number;

  @ManyToOne(() => Booking, (b) => b.milestones)
  booking: Booking;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: Date, nullable: true })
  startDate: Date;

  @Column({ type: Date, nullable: true })
  endDate: Date;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
