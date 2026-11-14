import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getInfo(): {
    name: string;
    version: string;
    status: string;
    docs: string;
    timestamp: string;
  } {
    return {
      name:
        this.configService.get<string>('appName') ??
        'Sistem Informasi Kendaraan Dinas Operasional',
      version: '1.0.0',
      status: 'ok',
      docs: `/${this.configService.get<string>('docs.path') ?? 'docs'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
