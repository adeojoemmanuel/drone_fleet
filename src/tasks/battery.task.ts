import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DroneRepository } from '../drones/drones.repository';

@Injectable()
export class BatteryTask {
  private readonly logger = new Logger(BatteryTask.name);
  
  constructor(
    private readonly droneRepository: DroneRepository,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  @Cron('*/15 * * * *') // Every 15 minutes
  async handleBatteryCheck() {
    const drones = await this.droneRepository.find();
    drones.forEach(drone => {
      this.logger.log(`Drone ${drone.serialNumber} battery: ${drone.batteryCapacity}%`);
      // Store in audit log (implement repository)
    });
  }
}