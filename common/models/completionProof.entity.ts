import { FileType } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
  } from 'typeorm';

  import { Booking } from './booking.entity';
  @Entity({ name: 'completion_proof' })
  export class CompletionProof {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: FileType, nullable: false })
    type: string;

    @Column({ type: 'varchar', nullable: false, default: '' })
    url: string;
  
    @ManyToOne(() => Booking, booking => booking.completionProof)
    booking: Booking;
  }
  