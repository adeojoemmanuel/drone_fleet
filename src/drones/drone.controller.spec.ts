import { Test, TestingModule } from '@nestjs/testing';
import { DronesController } from './drone.controller';
import { DronesService } from './drones.service';
import { CreateDroneDto } from './dto/create-drone.dto';
import { Drone } from './entities/drone.entity';
import { LoadMedicationDto } from './dto/load-medication.dto';
import { NotFoundException } from '@nestjs/common';

describe('DronesController', () => {
  let controller: DronesController;
  let service: Partial<DronesService>;

  beforeEach(async () => {
    service = {
      registerDrone: jest.fn(),
      loadMedications: jest.fn(),
      getLoadedMedications: jest.fn(),
      getAvailableDrones: jest.fn(),
      getBatteryLevel: jest.fn(),
      getAllDrones: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DronesController],
      providers: [
        {
          provide: DronesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DronesController>(DronesController);
  });

  describe('POST /drones', () => {
    it('should create a drone', async () => {
      const dto = new CreateDroneDto();
      const result = new Drone();
      
      jest.spyOn(service, 'registerDrone').mockResolvedValue(result);

      expect(await controller.registerDrone(dto)).toBe(result);
      expect(service.registerDrone).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /drones/:id/load', () => {
    it('should load medications', async () => {
      const dto = new LoadMedicationDto();
      dto.medicationIds = [1, 2];
      const result = new Drone();
      
      jest.spyOn(service, 'loadMedications').mockResolvedValue(result);

      expect(await controller.loadMedications(1, dto)).toBe(result);
      expect(service.loadMedications).toHaveBeenCalledWith(1, [1, 2]);
    });
  });

  describe('GET /drones/available', () => {
    it('should return available drones', async () => {
      const result = [new Drone()];
      jest.spyOn(service, 'getAvailableDrones').mockResolvedValue(result);

      expect(await controller.getAvailableDrones()).toBe(result);
      expect(service.getAvailableDrones).toHaveBeenCalled();
    });
  });

  describe('GET /drones/:id/battery', () => {
    it('should return battery level', async () => {
      jest.spyOn(service, 'getBatteryLevel').mockResolvedValue(75);
      expect(await controller.getBatteryLevel(1)).toBe(75);
    });

    it('should handle not found', async () => {
      jest.spyOn(service, 'getBatteryLevel').mockRejectedValue(new NotFoundException());
      await expect(controller.getBatteryLevel(999)).rejects.toThrow(NotFoundException);
    });
  });
});