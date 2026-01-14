import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('favorite_user')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favoritedBy)
  @JoinColumn({ name: 'favoriteById' })
  favoriteBy: User;

  @ManyToOne(() => User, (user) => user.favoriteTo)
  @JoinColumn({ name: 'favoriteToId' })
  favoriteTo: User;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
