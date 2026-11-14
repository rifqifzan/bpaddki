import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service.js';

describe('AppService', () => {
  it('mengembalikan informasi API', () => {
    const configService = {
      get: (key: string) => {
        if (key === 'appName') {
          return 'API Test';
        }

        if (key === 'docs.path') {
          return 'docs';
        }

        return undefined;
      },
    } as unknown as ConfigService;

    const service = new AppService(configService);

    expect(service.getInfo()).toMatchObject({
      name: 'API Test',
      version: '1.0.0',
      status: 'ok',
      docs: '/docs',
    });
  });
});
