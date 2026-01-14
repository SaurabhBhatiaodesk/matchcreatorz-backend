import {
    Entity,
    Column,
    ManyToMany,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
    ManyToOne,
    OneToMany
  } from 'typeorm';
  import { Country } from './country.entity';
  import { User } from './user.entity';
  @Entity({ name: 'state' })
  export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 10, nullable: false })
    stateCode: string;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    stateName: string;

    @OneToMany(() => User, user => user.state)   
    users: User[];

    @OneToOne(() => Country)
    country: Country;

    @Column({ nullable: true })
    countryId: number;
  }
  