const REQUIRED_IN_PRODUCTION = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'API_KEY',
] as const;

/**
 * Reads an environment value as text. `@nestjs/config` passes raw values as
 * `unknown`, so only primitives are converted explicitly.
 */
function readEnv(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

/**
 * Validates environment variables before the application starts.
 * Configuration errors must fail fast instead of surfacing at request time.
 */
export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = readEnv(config, 'NODE_ENV') ?? 'development';
  const apiKey = readEnv(config, 'API_KEY');

  if (nodeEnv === 'production') {
    const missing = REQUIRED_IN_PRODUCTION.filter((key) => {
      const value = readEnv(config, key);
      return value === undefined || value.trim() === '';
    });

    if (missing.length > 0) {
      throw new Error(
        `Environment variable wajib belum diisi pada production: ${missing.join(', ')}`,
      );
    }
  }

  if (apiKey !== undefined && apiKey.length < 16) {
    throw new Error('API_KEY minimal 16 karakter.');
  }

  const dbPort = Number(config.DB_PORT ?? 5432);
  if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error('DB_PORT harus berupa angka antara 1 dan 65535.');
  }

  const port = Number(config.PORT ?? 3300);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT harus berupa angka antara 1 dan 65535.');
  }

  return config;
}
