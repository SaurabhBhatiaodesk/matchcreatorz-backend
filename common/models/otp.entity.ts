import { OtpType, UserType } from 'common/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'otp' })
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: OtpType, nullable: true })
  type: OtpType;

  @Column({ type: 'enum', enum: UserType, nullable: true })
  userType: UserType;

  @Column({ type: 'varchar', nullable: true })
  formattedPhone: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  otp: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  validTill: Date;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
