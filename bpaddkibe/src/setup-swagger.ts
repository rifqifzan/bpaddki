import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const API_DESCRIPTION = `
API backend untuk mendata kendaraan dinas operasional, memantau kondisi
kendaraan, mencatat perawatan, serta mencatat pegawai yang bertanggung jawab
atas penggunaan kendaraan.

**Autentikasi:** kirim header \`X-API-Key\` pada setiap endpoint (kecuali
\`/\`, \`/health\`, dan dokumentasi). Klik tombol **Authorize** untuk mengisi
API key.

**Format error:**
\`\`\`json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validasi gagal.",
  "details": ["nopol: nopol tidak valid."],
  "path": "/api/v1/kendaraan",
  "method": "POST",
  "timestamp": "2026-11-14T10:15:30.000Z",
  "requestId": "..."
}
\`\`\`

**Relasi data:** PD memiliki banyak PNS dan kendaraan. Kendaraan dapat
ditugaskan kepada PNS (penanggung jawab/pengemudi) dan memiliki riwayat
kondisi serta riwayat perawatan.
`;

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  if (!configService.get<boolean>('docs.enabled')) {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Kendaraan Dinas Operasional')
    .setDescription(API_DESCRIPTION)
    .setVersion('1.0.0')
    .addTag('Sistem', 'Informasi aplikasi dan health check.')
    .addTag(
      'PD',
      'CRUD Perangkat Daerah (Dinas Pendidikan, Kesehatan, PUPR, dll).',
    )
    .addTag('PNS', 'CRUD data pegawai negeri sipil.')
    .addTag('Kendaraan', 'CRUD kendaraan dinas dan statistik kondisi.')
    .addTag(
      'Penugasan Kendaraan',
      'Pencatatan pegawai yang bertanggung jawab atas penggunaan kendaraan.',
    )
    .addTag('Riwayat Kondisi', 'Audit kondisi kendaraan dari waktu ke waktu.')
    .addTag('Perawatan', 'Pencatatan servis dan perbaikan kendaraan.')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description:
          'API key internal. Nilai diatur melalui environment variable API_KEY.',
      },
      'api-key',
    )
    .addSecurityRequirements('api-key')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(
    configService.get<string>('docs.path') ?? 'docs',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
      },
      customSiteTitle: 'API Kendaraan Dinas Operasional',
    },
  );
}
