export function toDateOnly(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return value.slice(0, 10);
}

export function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isDateBefore(first: string, second: string): boolean {
  return first.slice(0, 10) < second.slice(0, 10);
}
