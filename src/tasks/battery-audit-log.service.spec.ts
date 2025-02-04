import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatteryAuditLogService } from './battery-audit-log.service';
import { BatteryAuditLog } from './../drones/entities/battery-audit.entity';

describe('BatteryAuditLogService', () => {
  let service: BatteryAuditLogService;
  let repository: Repository<BatteryAuditLog>;

  const mockLogEntry: BatteryAuditLog = {
    id: 1,
    batteryLevel: 75,
    drone: { id: 1 } as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatteryAuditLogService,
        {
          provide: getRepositoryToken(BatteryAuditLog),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue(mockLogEntry),
            find: jest.fn().mockResolvedValue([mockLogEntry]),
          },
        },
      ],
    }).compile();

    service = module.get<BatteryAuditLogService>(BatteryAuditLogService);
    repository = module.get<Repository<BatteryAuditLog>>(
      getRepositoryToken(BatteryAuditLog),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create and save a new audit log entry', async () => {
      const droneId = 1;
      const batteryLevel = 75;

      const result = await service.createLog(droneId, batteryLevel);

      expect(repository.create).toHaveBeenCalledWith({
        drone: { id: droneId },
        batteryLevel,
      });
      expect(repository.save).toHaveBeenCalledWith({
        drone: { id: droneId },
        batteryLevel,
      });
      expect(result).toEqual(mockLogEntry);
    });

    it('should handle repository errors on create', async () => {
      const error = new Error('Database error');
      jest.spyOn(repository, 'save').mockRejectedValueOnce(error);

      await expect(service.createLog(1, 75)).rejects.toThrow(error);
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs for a specific drone', async () => {
      const droneId = 1;
      const result = await service.getAuditLogs(droneId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { drone: { id: droneId } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockLogEntry]);
    });

    it('should return empty array when no logs exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
      const result = await service.getAuditLogs(1);
      expect(result).toEqual([]);
    });

    it('should handle repository errors on find', async () => {
      const error = new Error('Database error');
      jest.spyOn(repository, 'find').mockRejectedValueOnce(error);

      await expect(service.getAuditLogs(1)).rejects.toThrow(error);
    });
  });
});