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
import { Support } from './support.entity';
import { Admin } from './admin.entity';
  @Entity({ name: 'support_request' })
  export class SupportRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: number;

    // relation to user
    @ManyToOne(() => User, usr => usr.id)
    user: User;

    @ManyToOne(() => Admin, (a) => a.id)
    admin: Admin;

    @Column({ nullable: false })
    adminId: number;

    @OneToMany(() => Support, support => support.supportRequest)
    supports: Support[];

    @Column({ type: 'longtext', nullable: true })
    latestMessage: string;

    @Column({ type: 'enum', enum: MessageType, nullable: false })
    messageType: MessageType;

    @Column({ type: 'enum', enum: RequestStatus, nullable: false, default: 'Pending' })
    status: RequestStatus;

    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

    unreadCount: number;
    latestMessageCount: number;
  
  }
  