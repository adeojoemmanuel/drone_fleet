import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Drones } from './drones/entities/drone.entity';
import { Medication  } from './drones/entities/medication.entity';
import { DronesModule } from './drones/drones.module';
import {BatteryAuditLogModule} from './tasks/battery-audit-log.module';

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
      database: process.env.DB_NAME || 'postgres',
      entities: [Drones, Medication],
      autoLoadEntities: true,
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsTableName: 'migrations',
    }),
    DronesModule,
    BatteryAuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}