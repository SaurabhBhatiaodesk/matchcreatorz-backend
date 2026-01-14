import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity({ name: 'response_time' })
  export class ResponseTime {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: false })
    time: number;

    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

  }
  