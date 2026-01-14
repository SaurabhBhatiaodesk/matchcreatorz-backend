import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
  } from 'typeorm';
import { User } from './user.entity';
  
  @Entity({ name: 'report' })
  export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    reportedBy: User;

    @Column({ nullable: false })
    reportedById: number;

    @ManyToOne(() => User, (user) => user.id)
    reportedTo: User;

    @Column({ nullable: false })
    reportedToId: number;
  
    @Column({ type: 'text', nullable: false })
    reason: string;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
  
    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;
  }
  