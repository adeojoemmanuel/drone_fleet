import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDrones1712345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // await queryRunner.query(`DROP TABLE IF EXISTS medication CASCADE;`);
    // await queryRunner.query(`DROP TABLE IF EXISTS drone CASCADE;`);

    // Create the drone table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS drones (
        "id" SERIAL PRIMARY KEY,
        "serialNumber" VARCHAR NOT NULL UNIQUE,
        "model" VARCHAR(255) NOT NULL,
        "weightLimit" INTEGER NOT NULL,
        "batteryCapacity" INTEGER NOT NULL,
        "state" VARCHAR(50) NOT NULL
      );
    `);

    // Insert data into the drone table
    await queryRunner.query(`
      INSERT INTO drones ("serialNumber", model, "weightLimit", "batteryCapacity", state)
      VALUES 
        ('DRN_1X92L', 'Lightweight', 200, 100, 'IDLE'),
        ('DRN_5T43M', 'Middleweight', 300, 100, 'IDLE'),
        ('DRN_9K76H', 'Heavyweight', 500, 100, 'IDLE'),
        ('DRN_3P29C', 'Cruiserweight', 400, 100, 'IDLE'),
        ('DRN_7R82L', 'Lightweight', 200, 100, 'IDLE')
      ON CONFLICT ("serialNumber") DO NOTHING; -- Prevent duplicate inserts
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM drones`);
    await queryRunner.query(`DROP TABLE IF EXISTS drones`);
  }
}
