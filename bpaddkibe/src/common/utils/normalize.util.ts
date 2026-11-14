/**
 * Normalizes an Indonesian vehicle registration number into "B 1234 XYZ" form.
 * The raw value may contain dots, dashes or no spaces at all.
 */
export function normalizeNopol(value: string): string {
  const raw = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const match = /^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/.exec(raw);

  if (!match) {
    return value.trim().toUpperCase();
  }

  return [match[1], match[2], match[3]].filter(Boolean).join(' ');
}

export function trimString(value: string): string {
  return value.trim();
}

export function trimNullableString(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeKode(value: string): string {
  return value.trim().toUpperCase();
}
