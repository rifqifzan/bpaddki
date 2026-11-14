import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator.js';
import { AppService } from './app.service.js';

@ApiTags('Sistem')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthCheckService: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Informasi API',
    description: 'Menampilkan nama, versi, status, dan tautan dokumentasi API.',
    security: [],
  })
  @ApiOkResponse({
    description: 'Informasi API.',
    schema: {
      example: {
        name: 'Sistem Informasi Kendaraan Dinas Operasional',
        version: '1.0.0',
        status: 'ok',
        docs: '/docs',
        timestamp: '2026-11-14T10:15:30.000Z',
      },
    },
  })
  getInfo() {
    return this.appService.getInfo();
  }

  @Get('health')
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Memeriksa kesehatan aplikasi dan koneksi database PostgreSQL. Tidak memerlukan API key.',
    security: [],
  })
  @ApiOkResponse({
    description: 'Aplikasi dan database sehat.',
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      },
    },
  })
  check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database').withTimeout(3000),
    ]);
  }
}
