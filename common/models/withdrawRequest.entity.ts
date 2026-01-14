import { WithdrawStatus } from 'common/enums';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn,
    ManyToOne
  } from 'typeorm';
  import { User } from './user.entity';
import { Country } from './country.entity';
  @Entity({ name: 'withdraw_request' })
  export class WithdrawRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
  
    @Column({ nullable: false })
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

    @Column({ nullable: false, default: 0 })
    amount: number;

    @Column({ type: 'enum', enum: WithdrawStatus, nullable: true, default:'Pending' })
    status: WithdrawStatus;

    @CreateDateColumn()
    created: Date;
  
    @UpdateDateColumn()
    updated: Date;

  }
  