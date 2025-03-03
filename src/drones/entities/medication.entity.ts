import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Drones } from '../../drones/entities/drone.entity';

@Entity('medication')
export class Medication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    transformer: {
      to: (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, ''),
      from: (value: string) => value
    }
  })
  name: string;

  @Column()
  weight: number;

  @Column({
    transformer: {
      to: (value: string) => value.replace(/[^A-Z0-9_]/g, ''),
      from: (value: string) => value
    }
  })
  code: string;

  @Column()
  image: string;

  @ManyToOne(() => Drones, drone => drone.medications)
  drone: Drones;
}