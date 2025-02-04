import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drone } from './entities/drone.entity';
import { Medication } from './entities/medication.entity';
import { DronesController } from './drone.controller';
import { DronesService } from './drones.service';

@Module({
  imports: [
    // Register repositories for Drone and Medication
    TypeOrmModule.forFeature([Drone, Medication]),
  ],
  controllers: [DronesController],
  providers: [DronesService],
})
export class DronesModule {}