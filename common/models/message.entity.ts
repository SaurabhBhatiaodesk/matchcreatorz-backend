import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user.entity';
import { Chat } from './chat.entity';

import { MessageType } from './../enums/messageType.enum';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id)
  chatId: Chat;

  @ManyToOne(() => User, (owner) => owner.id)
  senderId: User;

  @ManyToOne(() => User, (professional) => professional.id)
  receiverlId: User;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'enum', enum: MessageType, nullable: true })
  status: MessageType;

  @Column({ type: 'boolean', default: false })
  deletedByOwner: boolean;

  @Column({ type: 'boolean', default: false })
  deletedByProfessional: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
