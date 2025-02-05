import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drones } from './entities/drone.entity';
import { Medication } from './entities/medication.entity';
import { DronesController } from './drone.controller';
import { DronesService } from './drones.service';
import { DroneRepository } from './drones.repository';


@Module({
  imports: [
    // Register repositories for Drone and Medication
    TypeOrmModule.forFeature([Drones, Medication]),
  ],
  controllers: [DronesController],
  providers: [DronesService, DroneRepository],
  exports: [DronesService],
})
export class DronesModule {}