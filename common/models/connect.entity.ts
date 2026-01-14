import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn
  } from 'typeorm';
  @Entity({ name: 'connect' })
  export class Connect {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    planName: string;

    @Column({ type: 'varchar', length: 20, nullable: false, default: "dollar" })
    currency: string;

    @Column({ nullable: false, default: 0 })
    price: number;

    @Column({ nullable: false, default: 0 })
    discount: number;

    @Column({ nullable: false, default: 0 })
    connects: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ default: false })
    isSuspended: boolean;
  
    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

  }
  