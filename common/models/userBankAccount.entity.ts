import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Country } from './country.entity';

@Entity({ name: 'user_bank_account' })
export class UserBankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true  })
  iban: string;

  @Column({ type: 'varchar', length: 255, nullable: true  })
  swift: string;

  @ManyToOne(() => Country, country => country.id)  
  country: Country; 
  
  @Column({ nullable: true })
  countryId: number;

  @Column({ type: 'varchar', length: 255, nullable: true  })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true  })
  lastName: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

}
