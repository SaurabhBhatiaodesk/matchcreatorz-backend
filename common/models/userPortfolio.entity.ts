import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn,
  UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_portfolio' })
export class UserPortfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  image: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
