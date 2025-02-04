import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMedicationTable1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'medication',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'weight',
            type: 'int',
          },
          {
            name: 'code',
            type: 'varchar',
          },
          {
            name: 'image',
            type: 'varchar',
          },
          {
            name: 'droneId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'medication',
      new TableForeignKey({
        columnNames: ['droneId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drone',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.query(`
      INSERT INTO medication (name, weight, code, image, droneId) VALUES
      ('Painkiller', 50, 'PK_001', 'image1.jpg', (SELECT id FROM drone WHERE serial_number = 'DRN_1X92L')),
      ('Antibiotic', 75, 'AB_002', 'image2.jpg', (SELECT id FROM drone WHERE serial_number = 'DRN_5T43M')),
      ('Vaccine', 100, 'VC_003', 'image3.jpg', (SELECT id FROM drone WHERE serial_number = 'DRN_9K76H')),
      ('Insulin', 90, 'IN_004', 'image4.jpg', (SELECT id FROM drone WHERE serial_number = 'DRN_3P29C')),
      ('Cough Syrup', 60, 'CS_005', 'image5.jpg', (SELECT id FROM drone WHERE serial_number = 'DRN_7R82L'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('medication');
  }
}
