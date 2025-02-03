import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drone } from './entities/drone.entity';
import { DronesService } from './drones.service';
import { DroneRepository } from './drones.repository';
import { Medication } from './entities/medication.entity';
import { EntityManager } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DronesService', () => {
  let service: DronesService;
  let mockRepository: Partial<Record<keyof DroneRepository, jest.Mock>>;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAvailableDrones: jest.fn(),
      findDroneWithMedications: jest.fn(),
      checkBatteryLevel: jest.fn(),
    };

    mockEntityManager = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DronesService,
        {
          provide: DroneRepository,
          useValue: mockRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<DronesService>(DronesService);
  });

  describe('registerDrone', () => {
    it('should successfully register a drone', async () => {
      const dto = {
        serialNumber: 'DRONE_001',
        model: 'Lightweight',
        weightLimit: 500,
        batteryCapacity: 100,
        state: 'IDLE',
      };

      if (mockRepository.findOne) {
        mockRepository.findOne.mockResolvedValue(null);
      }
      if (mockRepository.create) {
        mockRepository.create.mockReturnValue(dto);
      }
      if (mockRepository.save) {
        mockRepository.save.mockResolvedValue(dto);
      }

      const result = await service.registerDrone(dto as any);
      expect(result).toEqual(dto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error for duplicate serial number', async () => {
      const dto = {
        serialNumber: 'DRONE_001',
        model: 'Lightweight',
        weightLimit: 500,
        batteryCapacity: 100,
        state: 'IDLE',
      };

      if (mockRepository.findOne) {
        mockRepository.findOne.mockResolvedValue(dto);
      }

      await expect(service.registerDrone(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('loadMedications', () => {
    it('should successfully load medications', async () => {
      const drone = {
        id: 1,
        batteryCapacity: 30,
        state: 'IDLE',
        weightLimit: 500,
        medications: [],
      };

      const medications = [{ id: 1, weight: 100 }, { id: 2, weight: 200 }];

      if (mockEntityManager.findOne) {
        (mockEntityManager.findOne as jest.Mock).mockResolvedValue(drone);
      }
      if (mockEntityManager.save) {
        (mockEntityManager.save as jest.Mock).mockImplementation((entity) => entity);
      }

      const result = await service.loadMedications(1, medications as any);
      expect(result.state).toBe('LOADED');
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error for low battery', async () => {
      const drone = {
        id: 1,
        batteryCapacity: 20,
        state: 'IDLE',
        weightLimit: 500,
      };

      if (mockEntityManager.findOne) {
        (mockEntityManager.findOne as jest.Mock).mockResolvedValue(drone);
      }

      await expect(
        service.loadMedications(1, [{}] as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBatteryLevel', () => {
    it('should return battery level', async () => {
      if (mockRepository.checkBatteryLevel) {
        mockRepository.checkBatteryLevel.mockResolvedValue(75);
      }
      const result = await service.getBatteryLevel(1);
      expect(result).toBe(75);
    });

    it('should throw not found exception', async () => {
      if (mockRepository.checkBatteryLevel) {
        mockRepository.checkBatteryLevel.mockResolvedValue(null);
      }
      await expect(service.getBatteryLevel(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});