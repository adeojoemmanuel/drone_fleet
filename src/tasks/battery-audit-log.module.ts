import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryAuditLog } from './../drones/entities/battery-audit.entity';
import { BatteryAuditLogService } from './battery-audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryAuditLog])],
  providers: [BatteryAuditLogService],
  exports: [BatteryAuditLogService],
})
export class BatteryAuditLogModule {}