import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Drone } from './entities/drone.entity';
import { DroneState } from './enums/drone.enum';


@Injectable()
export class DroneRepository extends Repository<Drone> {
  constructor(private readonly dataSource: DataSource) {
    super(Drone, dataSource.createEntityManager());
  }

  async findAvailableDrones(): Promise<Drone[]> {
    return this.createQueryBuilder('drone')
      .where('drone.state IN (:...states)', {
        states: [DroneState.IDLE, DroneState.LOADING],
      })
      .andWhere('drone.batteryCapacity >= :minBattery', { minBattery: 25 })
      .getMany();
  }

  async findDroneWithMedications(id: number): Promise<Drone | null> {
    return this.createQueryBuilder('drone')
      .leftJoinAndSelect('drone.medications', 'medications')
      .where('drone.id = :id', { id })
      .getOne();
  }

  async checkBatteryLevel(id: number): Promise<number> {
    const result = await this.createQueryBuilder('drone')
      .select('drone.batteryCapacity', 'battery')
      .where('drone.id = :id', { id })
      .getRawOne();
      
    return result?.battery || 0;
  }

  async safeSave(drone: Drone): Promise<Drone> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      if (drone.weightLimit > 500) {
        throw new Error('Weight limit exceeds maximum allowed');
      }
      return transactionalEntityManager.save(Drone, drone);
    });
  }
}
