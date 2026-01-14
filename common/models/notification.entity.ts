import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user.entity';

import { NotificationStatus } from './../enums/notificationStatus.enum';

import { NotificationType } from './../enums/notificationType.enum';
import { NotificationUserType, UserType } from 'common/enums';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  senderId: number;

  @Column({ nullable: true })
  receiverId: number;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedNotifications)
  receiver: User;

  @Column({ type: 'enum', enum: NotificationStatus, nullable: true })
  status: NotificationStatus;

  @Column({ type: 'enum', enum: NotificationType, nullable: true })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationUserType, nullable: true })
  userType: NotificationUserType;

  @Column({ type: 'enum', enum: UserType, nullable: true })
  senderType: UserType;

  @Column({ type: 'enum', enum: UserType, nullable: true })
  receiverType: UserType;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'json', nullable: true })
  metaData: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
