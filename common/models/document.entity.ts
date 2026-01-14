import { FileType } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    ManyToOne
  } from 'typeorm';

  import { Service } from './service.entity';
  @Entity({ name: 'document' })
  export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: FileType, nullable: false })
    type: string;

    @Column({ type: 'varchar', nullable: false, default: '' })
    name: string;

    @Column({ type: 'varchar', nullable: false, default: '' })
    url: string;
  
    @ManyToOne(() => Service, service => service.documents)
    service: Service;
    
  }
  