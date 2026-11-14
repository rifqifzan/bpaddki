import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { flattenValidationErrors } from './common/utils/validation.util.js';
import configuration from './config/configuration.js';
import { validateEnvironment } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { SeedModule } from './database/seed/seed.module.js';
import { KendaraanModule } from './modules/kendaraan/kendaraan.module.js';
import { PdModule } from './modules/pd/pd.module.js';
import { PenugasanModule } from './modules/penugasan/penugasan.module.js';
import { PerawatanModule } from './modules/perawatan/perawatan.module.js';
import { PnsModule } from './modules/pns/pns.module.js';
import { RiwayatKondisiModule } from './modules/riwayat-kondisi/riwayat-kondisi.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.get<number>('security.throttleTtlMs') ?? 60_000,
          limit: configService.get<number>('security.throttleLimit') ?? 100,
        },
      ],
    }),
    DatabaseModule,
    PdModule,
    PnsModule,
    KendaraanModule,
    PenugasanModule,
    RiwayatKondisiModule,
    PerawatanModule,
    SeedModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: false,
          },
          exceptionFactory: (errors) =>
            new BadRequestException({
              message: 'Validasi gagal.',
              errors: flattenValidationErrors(errors),
            }),
        }),
    },
  ],
})
export class AppModule {}
