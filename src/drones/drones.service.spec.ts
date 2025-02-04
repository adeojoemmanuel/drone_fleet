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
  let mockRepository: Partial<DroneRepository>;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    const mockTransactionalEM = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        relation: jest.fn().mockReturnThis(),
        of: jest.fn().mockReturnThis(),
        add: jest.fn().mockResolvedValue(undefined)
      })),
      findByIds: jest.fn()
    };

    mockEntityManager = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return cb(mockTransactionalEM);
      })
    };

    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      safeSave: jest.fn(),
      findAvailableDrones: jest.fn(),
      findDroneWithMedications: jest.fn(),
      checkBatteryLevel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DronesService,
        {
          // Correct the injection token here
          provide: getRepositoryToken(Drone),
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

      const savedDrone = {
        ...dto,
        id: 1,
        medications: []
      };

      if (mockRepository.findOne) {
        (mockRepository.findOne as jest.Mock).mockResolvedValue(null);
      }
      if (mockRepository.create) {
        (mockRepository.create as jest.Mock).mockReturnValue(savedDrone);
      }
      if (mockRepository.safeSave) {
        (mockRepository.safeSave as jest.Mock).mockResolvedValue(savedDrone);
      }

      const result = await service.registerDrone(dto as any);
      expect(result).toEqual(savedDrone);
      expect(mockRepository.safeSave).toHaveBeenCalled();
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

      const medications = [
        { id: 1, weight: 100 }, 
        { id: 2, weight: 200 }
      ];

      const mockTransactionalEM = {
        findOne: jest.fn().mockResolvedValue(drone),
        save: jest.fn().mockImplementation((entity) => entity),
        findByIds: jest.fn().mockResolvedValue(medications),
        createQueryBuilder: jest.fn(() => ({
          relation: jest.fn().mockReturnThis(),
          of: jest.fn().mockReturnThis(),
          add: jest.fn().mockResolvedValue(undefined),
        })),
      };
      

      mockEntityManager.transaction = jest.fn().mockImplementation(async (cb) => {
        return cb(mockTransactionalEM);
      });

      const result = await service.loadMedications(1, [1, 2]);
      expect(result.state).toBe('LOADED');
      expect(mockTransactionalEM.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error for low battery', async () => {
      const drone = {
        id: 1,
        batteryCapacity: 20,
        state: 'IDLE',
        weightLimit: 500,
      };

      const mockTransactionalEM = {
        findOne: jest.fn().mockResolvedValue(drone)
      };

      mockEntityManager.transaction = jest.fn().mockImplementation(async (cb) => {
        return cb(mockTransactionalEM);
      });

      await expect(
        service.loadMedications(1, [1])
      ).rejects.toThrow(BadRequestException);
    });
  });
});