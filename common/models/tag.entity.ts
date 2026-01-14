import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    ManyToOne,
    OneToMany
  } from 'typeorm';

  import { Category } from './category.entity';
  import { User } from './user.entity';
  import { Service } from './service.entity';
import { UserTag } from './userTag.entity';
  @Entity({ name: 'tag' })
  export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column()
    categoryId: number;
  
    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
  
    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

    @ManyToOne(() => Category, category => category.tags)  
    category: Category; 

    @OneToMany(() => UserTag, (userTag) => userTag.tag)
    userTags: UserTag[];

    @ManyToMany(() => Service, service => service.tags)
    services: Service[];
    
    
  }
  