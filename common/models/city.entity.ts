import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
    OneToMany
  } from 'typeorm';
  import { State } from './state.entity';
  import { User } from './user.entity';
  @Entity({ name: 'city' })
  export class City {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => State)
    @JoinColumn()
    state: State;

    @OneToMany(() => User, user => user.city)   
    users: User[];

    @Column({ nullable: true })
    stateId: number;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    cityName: string;
   
  }
  