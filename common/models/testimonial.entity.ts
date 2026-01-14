
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
  } from 'typeorm';
  
  @Entity({ name: 'testimonial' })
  export class Testimonial {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    designation: string;
  
    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    totalRating: number;

    @Column({ nullable: true, type: 'text' })
    comment: string;
  
    @Column({ default: false })
    isSuspended: boolean;
  
    @Column({ default: false })
    isDeleted: boolean;
  
    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;
  }
  