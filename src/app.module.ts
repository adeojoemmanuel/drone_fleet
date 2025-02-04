import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Drone } from './drones/entities/drone.entity';
import { Medication  } from './drones/entities/medication.entity';

import { DronesController } from './drones/drone.controller';
import { DronesService } from './drones/drones.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'drone',
      entities: [Drone, Medication],
      autoLoadEntities: true,
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsTableName: 'migrations',
    }),
  ],
  controllers: [AppController, DronesController],
  providers: [AppService, DronesService],
})
export class AppModule {}