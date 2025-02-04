import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { DroneModel, DroneState } from '../enums/drone.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDroneDto {
  @ApiProperty()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ enum: DroneModel })
  @IsEnum(DroneModel)
  model: DroneModel;

  @ApiProperty({ maximum: 500 })
  @IsNumber()
  @Max(500)
  weightLimit: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryCapacity: number;

  @ApiProperty({ enum: DroneState })
  @IsEnum(DroneState)
  state: DroneState;
}