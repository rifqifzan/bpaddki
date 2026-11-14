import { Transform } from 'class-transformer';
import { normalizeNopol } from '../utils/normalize.util.js';

export function Trim(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export function TrimToNull(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });
}

export function UpperTrim(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
}

export function LowerTrim(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}

export function NormalizeNopol(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? normalizeNopol(value) : value,
  );
}

export function StringToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === true || value === 'true' || value === '1') {
      return true;
    }

    if (value === false || value === 'false' || value === '0') {
      return false;
    }

    return value;
  });
}
