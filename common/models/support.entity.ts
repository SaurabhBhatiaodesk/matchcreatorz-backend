import { UserType, MessageType } from 'common/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';

import { User } from './user.entity';
import { SupportRequest } from './supportRequest.entity';
import { Admin } from './admin.entity';

@Entity({ name: 'support' })
export class Support {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.id)
  user: User;

  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => Admin, (a) => a.id)
  admin: Admin;

  @Column({ nullable: false })
  adminId: number;

  @Column({ nullable: false })
  supportRequestId: number;
  
  @ManyToOne(() => SupportRequest, supportRequest => supportRequest.id)
  supportRequest: SupportRequest;

  @Column({ type: 'enum', enum: UserType, nullable: false,  })
  senderType: UserType;

  @Column({ type: 'enum', enum: UserType, nullable: false })
  receiverType: UserType;

  @Column({ type: 'enum', enum: MessageType, nullable: false })
  messageType: MessageType;

  @Column({ type: 'longtext', nullable: true })
  message: string;

  @Column({ type: 'boolean', default: false })
  isCounter: boolean;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
