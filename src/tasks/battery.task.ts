import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { DroneRepository } from '../drones/drones.repository';
import { BatteryAuditLogService } from './battery-audit-log.service';

@Injectable()
export class BatteryTask {
  private readonly logger = new Logger(BatteryTask.name);
  
  constructor(
    private readonly droneRepository: DroneRepository,
    private batteryAuditService: BatteryAuditLogService,
  ) {}

  @Cron('*60 * * * *')
  async handleBatteryCheck() {
    const drones = await this.droneRepository.find();
    await Promise.all(drones.map(async (drone) => {
      this.logger.log(`Drone ${drone.serialNumber} battery: ${drone.batteryCapacity}%`);
      await this.batteryAuditService.createLog(drone.id, drone.batteryCapacity);
    }));
  }
}