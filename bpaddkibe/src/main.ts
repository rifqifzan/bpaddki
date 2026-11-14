import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { findPortOwner, isAddressInUseError } from './common/utils/port-owner.js';
import { configureApp } from './setup-app.js';
import { setupSwagger } from './setup-swagger.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  configureApp(app, configService);
  setupSwagger(app, configService);

  app.enableShutdownHooks();

  const port = configService.get<number>('port') ?? 3300;

  try {
    await app.listen(port, '0.0.0.0');
  } catch (error) {
    if (isAddressInUseError(error)) {
      const owner = findPortOwner(port);

      Logger.error(
        [
          `Port ${port} sedang dipakai oleh proses lain${owner ? ` (PID ${owner})` : ''}.`,
          'Hentikan dev server yang lama, lalu jalankan `npm run dev:kill` bila port masih terisi.',
          'Dev server hanya boleh berjalan satu instance.',
        ].join(' '),
        'Bootstrap',
      );

      await app.close();
      process.exit(1);
    }

    throw error;
  }

  Logger.log(`API berjalan di http://localhost:${port}/api/v1`, 'Bootstrap');

  if (configService.get<boolean>('docs.enabled')) {
    Logger.log(
      `Dokumentasi Swagger: http://localhost:${port}/${configService.get<string>('docs.path') ?? 'docs'}`,
      'Bootstrap',
    );
  }
}

await bootstrap();
