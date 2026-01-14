import { MessageType, RequestStatus } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { User } from './user.entity'; 
import { Service } from './service.entity';
import { Chat } from './chat.entity';
  @Entity({ name: 'chat_request' })
  export class ChatRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    buyerId: number;

    // relation to user
    @ManyToOne(() => User, usr => usr.id)
    buyer: User;

    @Column({ nullable: false })
    sellerId: number;

    // relation to user
    @ManyToOne(() => User, usr => usr.id)
    seller: User;

    @OneToMany(() => Chat, chat => chat.chatRequest)
    chats: Chat[];

    @Column({ type: 'longtext', nullable: false })
    latestMessage: string;

    @Column({ type: 'enum', enum: MessageType, nullable: false })
    messageType: MessageType;

    @Column({ type: 'enum', enum: RequestStatus, nullable: false, default: 'Pending' })
    status: RequestStatus;

    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @Column({ type: 'boolean', default: false })
    isDeletedBySeller: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeletedByBuyer: boolean;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

    unreadCount: number;
    latestMessageCount: number;
  
  }
  