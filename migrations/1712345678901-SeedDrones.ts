import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDrones1712345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO drone ("serialNumber", model, "weightLimit", "batteryCapacity", state)
      VALUES 
        ('DRN_1X92L', 'Lightweight', 200, 100, 'IDLE'),
        ('DRN_5T43M', 'Middleweight', 300, 100, 'IDLE'),
        ('DRN_9K76H', 'Heavyweight', 500, 100, 'IDLE'),
        ('DRN_3P29C', 'Cruiserweight', 400, 100, 'IDLE'),
        ('DRN_7R82L', 'Lightweight', 200, 100, 'IDLE');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM drone`);
  }
}