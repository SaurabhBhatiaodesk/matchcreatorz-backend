import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    ManyToMany
  } from 'typeorm';
  import { Tag } from './tag.entity';
  import { User } from './user.entity';
  import { UserTag } from './userTag.entity';
  import { Service } from './service.entity';

  @Entity({ name: 'category' })
  export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string;

    // relation to user for category
    @OneToMany(() => User, (user) => user.category) 
    users: User[];

    // relation to tag for category
    @OneToMany(() => Tag, (tag) => tag.category) 
    tags: Tag[];

    // relation to service for category
    @OneToMany(() => Service, service => service.category)
    services: Service[];

    // relation to userTags for category
    @ManyToMany(() => UserTag, tag => tag.category) 
    userTags: UserTag;
  
    @Column({ type: 'boolean', default: false })
    isSuspended: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
  
    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;
  }
  