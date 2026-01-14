import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'admin_setting' })
export class AdminSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  androidAppVersion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  iosAppVersion: string;

  @Column({ type: 'boolean', default: true })
  androidForceUpdate: boolean;

  @Column({ type: 'boolean', default: true })
  iosForceUpdate: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  websiteVersion: string;

  @Column({ type: 'boolean', default: true })
  maintenanceMode: boolean;

  @Column({ type: 'float', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'float', precision: 10, scale: 2, default: 0 })
  commission: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cancellationPercentage: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  bookingPercentage: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  bookingPercentageForPayment: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  responseTime: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  priceRange: string;

  @Column({ type: 'boolean', default: true })
  earningSellerCardVisibility: boolean;

  @Column({ type: 'boolean', default: true })
  earningBuyerCardVisibility: boolean;

  @Column({ default: 20, nullable: false })
  connectRequiredForBid: number;

  @Column({ default: 0, nullable: false })
  minPercentForSettle: number;

  @Column({ type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;
 
}
