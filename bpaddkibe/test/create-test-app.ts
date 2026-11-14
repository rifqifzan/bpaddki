import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataType, newDb } from 'pg-mem';
import type { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { ALL_ENTITIES } from '../src/database/entities.js';
import { SnakeNamingStrategy } from '../src/database/snake-naming.strategy.js';
import { configureApp } from '../src/setup-app.js';
import { setupSwagger } from '../src/setup-swagger.js';

export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
  apiKey: string;
}

/**
 * Boots the real application module against an in-memory PostgreSQL emulator.
 * Production always talks to a real PostgreSQL instance.
 */
export async function createTestApp(): Promise<TestContext> {
  process.env.NODE_ENV = 'test';
  process.env.SEED_PD = 'false';
  process.env.SEED_DEMO = 'false';
  process.env.API_KEY = 'test-api-key-1234567890';
  process.env.THROTTLE_LIMIT = '1000';
  process.env.DOCS_ENABLED = 'true';

  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'kendaraan_dinas_test',
  });
  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 16.0 (pg-mem)',
  });
  db.public.registerFunction({
    name: 'quote_ident',
    args: [DataType.text],
    returns: DataType.text,
    implementation: (value: string) =>
      `"${String(value).replaceAll('"', '""')}"`,
  });
  db.public.registerFunction({
    name: 'obj_description',
    args: [DataType.regclass, DataType.text],
    returns: DataType.text,
    implementation: () => null,
  });

  const dataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: ALL_ENTITIES,
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
  });

  await dataSource.initialize();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(getDataSourceToken())
    .useValue(dataSource)
    .compile();

  const app = moduleRef.createNestApplication();
  const configService = moduleRef.get(ConfigService);

  configureApp(app, configService);
  setupSwagger(app, configService);
  await app.init();

  return {
    app,
    dataSource,
    apiKey: configService.get<string>('security.apiKey') as string,
  };
}
