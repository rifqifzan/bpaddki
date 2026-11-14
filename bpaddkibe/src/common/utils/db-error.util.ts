import { QueryFailedError } from 'typeorm';

interface PostgresDriverError {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
}

export function getPostgresDriverError(
  error: unknown,
): PostgresDriverError | null {
  if (!(error instanceof QueryFailedError)) {
    return null;
  }

  const driverError = error.driverError as PostgresDriverError | undefined;
  return driverError ?? null;
}

export function isUniqueViolation(error: unknown): boolean {
  return getPostgresDriverError(error)?.code === '23505';
}

export function isForeignKeyViolation(error: unknown): boolean {
  return getPostgresDriverError(error)?.code === '23503';
}
