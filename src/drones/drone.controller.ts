import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { DronesService } from './drones.service';
import { CreateDroneDto } from './dto/create-drone.dto';
import { LoadMedicationDto } from './dto/load-medication.dto';
import { Drone } from './entities/drone.entity';
import { Medication } from './entities/medication.entity';

@ApiTags('Drones')
@Controller('drones')
export class DronesController {
  constructor(private readonly dronesService: DronesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new drone' })
  @ApiResponse({ 
    status: 201, 
    description: 'Drone successfully registered',
    type: Drone,
  })
  @ApiBody({ 
    type: CreateDroneDto,
    examples: {
      example: {
        value: {
          serialNumber: "DRN12345",
          model: "Middleweight",
          weightLimit: 300,
          batteryCapacity: 100,
          state: "IDLE"
        },
      },
    },
  })
  async registerDrone(
    @Body() createDroneDto: CreateDroneDto,
  ): Promise<Drone> {
    return this.dronesService.registerDrone(createDroneDto);
  }

  @Post(':id/load')
  @ApiOperation({ summary: 'Load medications onto a drone' })
  @ApiResponse({ 
    status: 200, 
    description: 'Medications successfully loaded',
    type: Drone,
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ 
    type: LoadMedicationDto,
    examples: {
      example: {
        value: {
          medicationIds: [1, 2, 3]
        },
      },
    },
  })
  async loadMedications(
    @Param('id', ParseIntPipe) id: number,
    @Body() loadMedicationDto: LoadMedicationDto,
  ): Promise<Drone> {
    return this.dronesService.loadMedications(id, loadMedicationDto.medicationIds);
  }

  @Get(':id/medications')
  @ApiOperation({ summary: 'Get loaded medications for a drone' })
  @ApiResponse({
    status: 200,
    description: 'List of medications',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath(Medication) },
        },
        examples: {
          example: {
            value: [
              {
                id: 1,
                name: "Amoxicillin",
                weight: 100,
                code: "AMX_001",
                image: "amoxicillin.png",
              },
              {
                id: 2,
                name: "Ibuprofen",
                weight: 50,
                code: "IBU_002",
                image: "ibuprofen.png",
              },
            ],
          },
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: Number })
  async getLoadedMedications(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Medication[]> {
    return this.dronesService.getLoadedMedications(id);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drones for loading' })
  @ApiResponse({
    status: 200,
    description: 'List of available drones',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath(Drone) },
        },
        examples: {
          example: {
            value: [
              {
                id: 1,
                serialNumber: "DRN001",
                model: "Lightweight",
                weightLimit: 200,
                batteryCapacity: 100,
                state: "IDLE",
              },
              {
                id: 2,
                serialNumber: "DRN002",
                model: "Middleweight",
                weightLimit: 300,
                batteryCapacity: 80,
                state: "LOADING",
              },
            ],
          },
        },
      },
    },
  })
  async getAvailableDrones(): Promise<Drone[]> {
    return this.dronesService.getAvailableDrones();
  }

  @Get(':id/battery')
  @ApiOperation({ summary: 'Check drone battery level' })
  @ApiResponse({
    status: 200,
    description: 'Battery percentage',
    content: {
      'application/json': {
        example: 75,
      },
    },
  })
  @ApiParam({ name: 'id', type: Number })
  async getBatteryLevel(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<number> {
    return this.dronesService.getBatteryLevel(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drones' })
  @ApiResponse({
    status: 200,
    description: 'List of all drones',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath(Drone) },
        },
        examples: {
          example: {
            value: [
              {
                id: 1,
                serialNumber: "DRN001",
                model: "Heavyweight",
                weightLimit: 500,
                batteryCapacity: 65,
                state: "LOADED",
              },
              {
                id: 2,
                serialNumber: "DRN002",
                model: "Cruiserweight",
                weightLimit: 400,
                batteryCapacity: 90,
                state: "DELIVERING",
              },
            ],
          },
        },
      },
    },
  })
  async getAllDrones(): Promise<Drone[]> {
    return this.dronesService.getAllDrones();
  }
}