import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatteryAuditLog } from './../drones/entities/battery-audit.entity';

@Injectable()
export class BatteryAuditLogService {
  constructor(
    @InjectRepository(BatteryAuditLog)
    private readonly batteryAuditLogRepository: Repository<BatteryAuditLog>,
  ) {}

  async createLog(droneId: number, batteryLevel: number): Promise<BatteryAuditLog> {
    const logEntry = this.batteryAuditLogRepository.create({
      drone: { id: droneId },
      batteryLevel,
    });

    return this.batteryAuditLogRepository.save(logEntry);
  }

  async getAuditLogs(droneId: number): Promise<BatteryAuditLog[]> {
    return this.batteryAuditLogRepository.find({
      where: { drone: { id: droneId } },
      order: { createdAt: 'DESC' },
    });
  }
}