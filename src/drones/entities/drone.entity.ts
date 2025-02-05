import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Medication } from './medication.entity';
import { DroneModel, DroneState } from '../enums/drone.enum';

@Entity('drones')
export class Drones {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  serialNumber: string;

  @Column({ type: 'enum', enum: DroneModel })
  model: DroneModel;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weightLimit: number;

  @Column()
  batteryCapacity: number;

  @Column({ type: 'enum', enum: DroneState, default: DroneState.IDLE })
  state: DroneState;

  @OneToMany(() => Medication, medication => medication.drone)
  medications: Medication[];
}