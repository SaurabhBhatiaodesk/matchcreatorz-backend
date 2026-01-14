import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';

@Entity({ name: 'country' })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 2, nullable: false })
  slug: string;

  @OneToMany(() => User, user => user.country)   
  users: User[];

  @Column({ type: 'varchar', length: 10, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  countryName: string;

  @OneToMany(() => Service, service => service.country)
  services: Service[];
}
