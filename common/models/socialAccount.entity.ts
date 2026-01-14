import { SocialType } from 'common/enums';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'social_accounts' })
export class SocialAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: SocialType, nullable: false })
  socialType: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  socialId: string;
}
