import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, ManyToMany, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tag } from './tag.entity';
import { User } from './user.entity';

import { Category } from './category.entity';

@Entity({ name: 'user_tag' })
export class UserTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column()
  userId: number;

  @Column()
  tagId: number;

  @ManyToOne(() => Category, category => category.id)
  category: Category; 

  @ManyToOne(() => User, user => user.userTags)
  user: User;

  @ManyToOne(() => Tag, tag => tag.userTags)
  tag: Tag; 

}
