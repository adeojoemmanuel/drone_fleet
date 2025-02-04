import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import  AppDataSource from './data-source';

const typeOrmConfig: TypeOrmModuleOptions = {
  ...AppDataSource.options,
  migrationsRun: false,
};

export default typeOrmConfig;
