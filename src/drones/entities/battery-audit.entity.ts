import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Drone } from './drone.entity';

@Entity()
export class BatteryAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Drone)
  drone: Drone;

  @Column('int')
  batteryLevel: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}