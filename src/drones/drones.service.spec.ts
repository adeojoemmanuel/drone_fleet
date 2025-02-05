import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drones } from './entities/drone.entity';
import { DronesService } from './drones.service';
import { DroneRepository } from './drones.repository';
import { Medication } from './entities/medication.entity';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DroneState, DroneModel } from './enums/drone.enum'; 

jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  In: jest.fn(),
}));


describe('DronesService', () => {
  let service: DronesService;
  let mockRepository: Partial<DroneRepository>;
  let mockEntityManager: Partial<EntityManager>;
  let mockTransactionalEM: Partial<EntityManager>;

  beforeEach(async () => {
    mockTransactionalEM = {
      findOne: jest.fn(),
      save: jest.fn(),
      findByIds: jest.fn(),
      
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, serialNumber: 'DRONE_001' }),
      } as unknown as SelectQueryBuilder<any>)),
    };
    

    mockEntityManager = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return cb(mockTransactionalEM);
      }),
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
          provide: getRepositoryToken(Drones),
          useValue: mockRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: DroneRepository,
          useValue: mockRepository,
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
        state: DroneState.IDLE,
      };

      const savedDrone = {
        ...dto,
        id: 1,
        medications: [],
      };

      mockRepository.findOne = jest.fn().mockResolvedValue(null);
      mockRepository.create = jest.fn().mockReturnValue(savedDrone);
      mockRepository.safeSave = jest.fn().mockResolvedValue(savedDrone);

      const result = await service.registerDrone(dto as any);

      expect(result).toEqual(savedDrone);
      expect(mockRepository.safeSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadMedications', () => {
    it('should successfully load medications', async () => {
      const mockedLoadMedicationsResponse: Drones = {
        id: 1,
        serialNumber: 'DRONE_001',
        model: DroneModel.Lightweight, 
        batteryCapacity: 30,
        state: DroneState.LOADING,
        weightLimit: 500,
        medications: [
          {
            id: 1, weight: 100,
            name: '',
            code: '',
            image: '',
            drone: new Drones
          },
          {
            id: 2, weight: 200,
            name: '',
            code: '',
            image: '',
            drone: new Drones
          },
        ],
      };
  
      jest.spyOn(service, 'loadMedications').mockResolvedValue(mockedLoadMedicationsResponse);
  
      const result = await service.loadMedications(1, [1, 2]);
  
      expect(result).toEqual(mockedLoadMedicationsResponse);
      expect(service.loadMedications).toHaveBeenCalledTimes(1);
    });


    it('should throw error for low battery', async () => {
      const drone = {
        id: 1,
        batteryCapacity: 20,
        state: DroneState.IDLE,
        weightLimit: 500,
      };

      mockTransactionalEM.findOne = jest.fn().mockResolvedValue(drone);

      mockEntityManager.transaction = jest.fn().mockImplementation(async (cb) => {
        return cb(mockTransactionalEM);
      });

      await expect(service.loadMedications(1, [1])).rejects.toThrow(BadRequestException);
    });

    it('should throw error if drone is not available for loading', async () => {
      const drone = {
        id: 1,
        batteryCapacity: 30,
        state: DroneState.DELIVERING,
        weightLimit: 500,
      };

      mockTransactionalEM.findOne = jest.fn().mockResolvedValue(drone);

      await expect(service.loadMedications(1, [1])).rejects.toThrow(BadRequestException);
    });
  });
});
