import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAndSeedMedication1712345678902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // Creating the medication table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS medication (
        "id" SERIAL PRIMARY KEY, 
        "name" VARCHAR NOT NULL, 
        "weight" INTEGER NOT NULL, 
        "code" VARCHAR NOT NULL, 
        "image" VARCHAR NOT NULL, 
        "droneId" INTEGER NOT NULL,
        CONSTRAINT "FK_drone_medication" FOREIGN KEY ("droneId") REFERENCES "drones"("id") ON DELETE CASCADE
      );
    `);

    // Insert data into the medication table, associating each with a drone by its ID
    await queryRunner.query(`
      INSERT INTO medication ("name", "weight", "code", "image", "droneId")
      VALUES
        ('Aspirin', 50, 'ASPIRIN01', 'aspirin_image_url', (SELECT "id" FROM drones WHERE "serialNumber" = 'DRN_1X92L')),
        ('Paracetamol', 100, 'PARA100', 'paracetamol_image_url', (SELECT "id" FROM drones WHERE "serialNumber" = 'DRN_5T43M')),
        ('Ibuprofen', 200, 'IBU200', 'ibuprofen_image_url', (SELECT "id" FROM drones WHERE "serialNumber" = 'DRN_9K76H')),
        ('Amoxicillin', 150, 'AMOX150', 'amoxicillin_image_url', (SELECT "id" FROM drones WHERE "serialNumber" = 'DRN_3P29C')),
        ('Ciprofloxacin', 120, 'CIPRO120', 'ciprofloxacin_image_url', (SELECT "id" FROM drones WHERE "serialNumber" = 'DRN_7R82L'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS medication`);
  }
}
