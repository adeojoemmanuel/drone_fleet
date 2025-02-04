import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Drones } from './drone.entity';

@Entity()
export class BatteryAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Drones)
  drone: Drones;

  @Column('int')
  batteryLevel: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}