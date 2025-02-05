import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DroneRepository } from './drones.repository';
import { Drones } from './entities/drone.entity';
import { Medication } from './entities/medication.entity';
import { CreateDroneDto } from './dto/create-drone.dto';
import { DroneState } from './enums/drone.enum';
import { EntityManager, In, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class DronesService {
  constructor(
    @InjectRepository(DroneRepository)
    private readonly droneRepository: DroneRepository,
    private readonly entityManager: EntityManager
  ) {}

  async registerDrone(createDroneDto: CreateDroneDto): Promise<Drones> {
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
 

  async loadMedications(droneId: number, medicationIds: number[]): Promise<Drones> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const drone = await transactionalEntityManager.createQueryBuilder(Drones, 'drone')
        .leftJoinAndSelect('drone.medications', 'medications')
        .where('drone.id = :id', { id: droneId })
        .andWhere('medications.id IS NOT NULL')
        .setLock('pessimistic_write')
        .getOne();
  
      if (!drone) {
        throw new NotFoundException(`Drone with ID ${droneId} not found.`);
      }
  
      if (drone.state !== DroneState.IDLE && drone.state !== DroneState.LOADING) {
        throw new BadRequestException('Drone is not available for loading.');
      }
  
      if (drone.batteryCapacity < 25) {
        throw new BadRequestException('Battery level too low for loading.');
      }
  
      const medications = await transactionalEntityManager.find(Medication, {
        where: { id: In(medicationIds) },
        relations: ['drone'],
      });
  
      if (medications.length !== medicationIds.length) {
        throw new NotFoundException('Some medications not found.');
      }
  
      const alreadyAssigned = medications.filter(m => m.drone && m.drone.id !== droneId);
      if (alreadyAssigned.length > 0) {
        throw new BadRequestException('Some medications are already assigned to another drone.');
      }
  
      const newWeight = medications.reduce((sum, m) => sum + m.weight, 0);
      const existingWeight = drone.medications.reduce((sum, m) => sum + m.weight, 0);
      const totalWeight = existingWeight + newWeight;
  
      if (totalWeight > drone.weightLimit) {
        throw new BadRequestException('Total weight exceeds drone capacity.');
      }
  
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Medication)
        .set({ drone: drone })
        .where('id IN (:...medicationIds)', { medicationIds })
        .execute();
  
      if (totalWeight === drone.weightLimit) {
        drone.state = DroneState.LOADED;
      } else if (drone.state === DroneState.IDLE) {
        drone.state = DroneState.LOADING;
      }
  
      await transactionalEntityManager.save(Drones, drone);
  
      const updatedDrone = await transactionalEntityManager.findOne(Drones, {
        where: { id: droneId },
        relations: ['medications'],
      });
  
      if (!updatedDrone) {
        throw new NotFoundException(`Drone with ID ${droneId} not found.`);
      }
  
      return updatedDrone;
    });
  }  
  

  async getLoadedMedications(droneId: number): Promise<Medication[]> {
    const drone = await this.droneRepository.findDroneWithMedications(droneId);
    if (!drone) throw new NotFoundException('Drone not found');
    return drone.medications;
  }

  async getAvailableDrones(): Promise<Drones[]> {
    return this.droneRepository.findAvailableDrones();
  }

  async findAvailableDrones(): Promise<Drones[]> {
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

  async getAllDrones(): Promise<Drones[]> {
    return this.droneRepository.find();
  }
}