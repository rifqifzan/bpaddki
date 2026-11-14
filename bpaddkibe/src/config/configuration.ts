const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export default () => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  return {
    nodeEnv,
    port: toNumber(process.env.PORT, 3300),
    appName:
      process.env.APP_NAME ?? 'Sistem Informasi Kendaraan Dinas Operasional',
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: toNumber(process.env.DB_PORT, 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      name: process.env.DB_NAME ?? 'kendaraan_dinas',
      synchronize: toBoolean(
        process.env.DB_SYNCHRONIZE,
        nodeEnv !== 'production',
      ),
      logging: toBoolean(process.env.DB_LOGGING, false),
      ssl: toBoolean(process.env.DB_SSL, false),
      poolMax: toNumber(process.env.DB_POOL_MAX, 10),
    },
    security: {
      apiKey: process.env.API_KEY ?? 'dev-api-key-change-me',
      corsOrigins: toList(process.env.CORS_ORIGINS, ['*']),
      throttleTtlMs: toNumber(process.env.THROTTLE_TTL_MS, 60_000),
      throttleLimit: toNumber(process.env.THROTTLE_LIMIT, 100),
    },
    docs: {
      enabled: toBoolean(process.env.DOCS_ENABLED, true),
      path: process.env.DOCS_PATH ?? 'docs',
    },
    seed: {
      pd: toBoolean(process.env.SEED_PD, true),
      demo: toBoolean(process.env.SEED_DEMO, nodeEnv !== 'production'),
    },
  };
};
