import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'drones',
  entities: [__dirname + '/../**/*.entity{.js,.ts}'],
  migrations: [__dirname + '/../migrations/*{.js,.ts}'],
  synchronize: false,
  migrationsTableName: 'migrations_history',
});

export default AppDataSource;