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
    @ApiBody({ type: CreateDroneDto })
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
    @ApiBody({ type: LoadMedicationDto })
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
      type: [Medication],
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
      type: [Drone],
    })
    async getAvailableDrones(): Promise<Drone[]> {
      return this.dronesService.getAvailableDrones();
    }
  
    @Get(':id/battery')
    @ApiOperation({ summary: 'Check drone battery level' })
    @ApiResponse({
      status: 200,
      description: 'Battery percentage',
      type: Number,
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
      type: [Drone],
    })
    async getAllDrones(): Promise<Drone[]> {
      return this.dronesService.getAllDrones();
    }
  }