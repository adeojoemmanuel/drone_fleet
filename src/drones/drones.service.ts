import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DroneRepository } from './drones.repository';
import { Drone } from './entities/drone.entity';
import { Medication } from './entities/medication.entity';
import { CreateDroneDto } from './dto/create-drone.dto';
import { DroneState } from './enums/drone.enum';
import { EntityManager, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class DronesService {
  constructor(
    @InjectRepository(Drone)
    private readonly droneRepository: DroneRepository,
    private readonly entityManager: EntityManager
  ) {}

  async registerDrone(createDroneDto: CreateDroneDto): Promise<Drone> {
    const existing = await this.droneRepository.findOne({
      where: { serialNumber: createDroneDto.serialNumber },
    });

    if (existing) {
      throw new BadRequestException('Serial number must be unique');
    }

    const drone = this.droneRepository.create({
      ...createDroneDto,
      state: DroneState.IDLE,
    });

    return this.droneRepository.safeSave(drone);
  }
 
  async loadMedications(droneId: number, medicationIds: number[]): Promise<Drone> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      // const drone = await transactionalEntityManager.findOne(Drone, { where: { id: droneId } });
      const drone = await transactionalEntityManager.findOne(Drone, {
        where: { id: droneId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!drone) {
        throw new NotFoundException('Drone not found');
      }
  
      if (drone.batteryCapacity < 25) {
        throw new BadRequestException('Battery level too low for loading');
      }
  
      if (drone.state !== DroneState.IDLE && drone.state !== DroneState.LOADING) {
        throw new BadRequestException('Drone not available for loading');
      }
  
      const medications = await transactionalEntityManager.findByIds(Medication, medicationIds);
  
      if (medications.length !== medicationIds.length) {
        throw new BadRequestException('One or more medications not found');
      }
  
      const totalWeight = medications.reduce((sum, med) => sum + med.weight, 0);
      const currentLoad = drone.medications?.reduce((sum, med) => sum + med.weight, 0) || 0;
  
      if (currentLoad + totalWeight > drone.weightLimit) {
        throw new BadRequestException('Total weight exceeds drone capacity');
      }
  
      drone.state = DroneState.LOADING;
      await transactionalEntityManager.save(drone);
  
      await transactionalEntityManager
        .createQueryBuilder()
        .relation(Drone, 'medications')
        .of(drone)
        .add(medications);
  
      drone.state = DroneState.LOADED;
      return transactionalEntityManager.save(drone);
    });
  }
  

  async getLoadedMedications(droneId: number): Promise<Medication[]> {
    const drone = await this.droneRepository.findDroneWithMedications(droneId);
    if (!drone) throw new NotFoundException('Drone not found');
    return drone.medications;
  }

  async getAvailableDrones(): Promise<Drone[]> {
    return this.droneRepository.findAvailableDrones();
  }

  async findAvailableDrones(): Promise<Drone[]> {
    const drones = await this.droneRepository.find({
      where: [
        { state: DroneState.IDLE, batteryCapacity: MoreThanOrEqual(25) },
        { state: DroneState.LOADING, batteryCapacity: MoreThanOrEqual(25) },
      ],
      relations: ['medications'],
    });

    return drones.filter((drone) => {
      const totalWeight = drone.medications.reduce((sum, m) => sum + m.weight, 0);
      return totalWeight < drone.weightLimit;
    });
  }

  async getBatteryLevel(droneId: number): Promise<number> {
    const level = await this.droneRepository.checkBatteryLevel(droneId);
    if (level === null) throw new NotFoundException('Drone not found');
    return level;
  }

  async getAllDrones(): Promise<Drone[]> {
    return this.droneRepository.find();
  }
}