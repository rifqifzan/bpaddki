import { execFileSync } from 'node:child_process';

/**
 * Finds the PID of the process currently listening on a TCP port.
 *
 * Returns `undefined` when the port is free or the platform lookup fails.
 */
export function findPortOwner(port: number): string | undefined {
  try {
    if (process.platform === 'win32') {
      const output = execFileSync('netstat', ['-ano', '-p', 'tcp'], {
        encoding: 'utf8',
      });

      const line = output
        .split(/\r?\n/)
        .find((row) => new RegExp(`[:.]${port}\\s+.*LISTENING`).test(row));

      return line?.trim().split(/\s+/).at(-1);
    }

    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], {
      encoding: 'utf8',
    });

    return output.split(/\r?\n/).find(Boolean);
  } catch {
    return undefined;
  }
}

/**
 * Type guard for the `EADDRINUSE` error raised by `server.listen()`.
 */
export function isAddressInUseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'EADDRINUSE'
  );
}
