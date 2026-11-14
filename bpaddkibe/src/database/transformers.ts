import type { ValueTransformer } from 'typeorm';

/**
 * PostgreSQL returns numeric/decimal values as strings. The API exposes them
 * as numbers, which is safe for the monetary ranges used by this application.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null) =>
    value === null ? null : Number(value),
};
