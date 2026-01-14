import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity({ name: 'price_range' })
  export class PriceRange {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: false })
    min: number;

    @Column({ nullable: false })
    max: number;
  
    @Column({ type: 'varchar', length: 20, nullable: false })
    minMaxVal: string;

    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
  
  }
  