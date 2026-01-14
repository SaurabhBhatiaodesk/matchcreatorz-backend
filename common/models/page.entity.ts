import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'page' })
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null, type: 'text' })
  title: string;

  @Column({ nullable: true, default: null, type: 'text' })
  description: string;

  @Column({ nullable: true, default: null, type: 'text' })
  slug: string;

  @Column({ default: false })
  isSuspended: boolean;
}
