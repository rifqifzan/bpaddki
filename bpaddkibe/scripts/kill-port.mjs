#!/usr/bin/env node
/**
 * Makes sure only one dev server for this project can run at a time.
 *
 * It stops every earlier dev-server process of THIS project (npm runner,
 * `nest start --watch` watcher, and the compiled `dist/main` it spawned), then
 * reports whether the HTTP port is free. Processes from other projects are
 * never touched unless `--force` is passed.
 *
 * Usage:
 *   node scripts/kill-port.mjs            # clean stale dev servers of this repo
 *   node scripts/kill-port.mjs --force    # also kill foreign listeners on PORT
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');
const portArgument = process.argv.slice(2).find((arg) => /^\d+$/.test(arg));

function resolvePort() {
  if (portArgument) {
    return Number(portArgument);
  }

  try {
    const env = readFileSync(resolve(projectRoot, '.env'), 'utf8');
    const match = env.match(/^PORT\s*=\s*(\d+)\s*$/m);
    if (match) {
      return Number(match[1]);
    }
  } catch {
    // No .env file: fall back to the environment or the default port.
  }

  return Number(process.env.PORT ?? 3000);
}

function isWindows() {
  return process.platform === 'win32';
}

/** Returns `{ pid, parentPid, command }` for every visible process. */
function listProcesses() {
  if (isWindows()) {
    const output = execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation',
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    );

    return output
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.match(/^"(\d+)","(\d*)","(.*)"$/))
      .filter(Boolean)
      .map((match) => ({
        pid: Number(match[1]),
        parentPid: Number(match[2]) || 0,
        command: match[3].replace(/""/g, '"'),
      }));
  }

  const output = execFileSync('ps', ['-eo', 'pid=,ppid=,command='], {
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/))
    .filter(Boolean)
    .map((match) => ({
      pid: Number(match[1]),
      parentPid: Number(match[2]),
      command: match[3],
    }));
}

function pidsListeningOn(port) {
  if (isWindows()) {
    const output = execFileSync('netstat', ['-ano', '-p', 'tcp'], {
      encoding: 'utf8',
    });

    return [
      ...new Set(
        output
          .split(/\r?\n/)
          .filter((line) => new RegExp(`[:.]${port}\\s+.*LISTENING`).test(line))
          .map((line) => line.trim().split(/\s+/).at(-1))
          .filter(Boolean)
          .map(Number),
      ),
    ];
  }

  try {
    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], {
      encoding: 'utf8',
    });
    return [...new Set(output.split(/\r?\n/).filter(Boolean).map(Number))];
  } catch {
    return [];
  }
}

/** Collects the current process and all of its ancestors. */
function ancestorsOf(processes, pid) {
  const byPid = new Map(processes.map((entry) => [entry.pid, entry]));
  const ancestors = new Set();
  let current = byPid.get(pid);

  while (current && !ancestors.has(current.pid)) {
    ancestors.add(current.pid);
    current = byPid.get(current.parentPid);
  }

  return ancestors;
}

const port = resolvePort();

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Port tidak valid: ${port}`);
  process.exit(1);
}

const processes = listProcesses();
const protectedPids = ancestorsOf(processes, process.pid);
const listenersOnPort = new Set(pidsListeningOn(port));

const DEV_SERVER_PATTERN =
  /nest(\.js)?["\s]+start|nest-cli|npm-cli\.js["\s]+run["\s]+start/i;

const killed = [];

for (const entry of processes) {
  if (protectedPids.has(entry.pid)) {
    continue;
  }

  const belongsToProject = entry.command.includes(projectRoot);
  const listensOnPort = listenersOnPort.has(entry.pid);
  const isDevServer =
    belongsToProject && DEV_SERVER_PATTERN.test(entry.command);

  if (!isDevServer && !(listensOnPort && belongsToProject)) {
    continue;
  }

  try {
    process.kill(entry.pid, 'SIGKILL');
    killed.push(entry.pid);
  } catch {
    // The process may have exited between listing and killing it.
  }
}

if (killed.length > 0) {
  console.log(`Dev server lama dihentikan (PID: ${killed.join(', ')}).`);
  // Give the OS a moment to release the socket.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);
}

const stillListening = pidsListeningOn(port).filter(
  (pid) => !killed.includes(pid) && !protectedPids.has(pid),
);

if (stillListening.length > 0) {
  const details = stillListening
    .map((pid) => {
      const entry = processes.find((item) => item.pid === pid);
      return `PID ${pid} (${entry?.command ?? 'tidak diketahui'})`;
    })
    .join(', ');

  if (!force) {
    console.error(
      `Port ${port} dipakai proses lain: ${details}.` +
        '\nHentikan proses tersebut, ubah PORT di .env, atau jalankan: npm run dev:kill',
    );
    process.exit(1);
  }

  for (const pid of stillListening) {
    try {
      process.kill(pid, 'SIGKILL');
      console.log(`PID ${pid} dihentikan (--force).`);
    } catch (error) {
      console.error(`Gagal menghentikan PID ${pid}: ${error.message}`);
      process.exit(1);
    }
  }
}

console.log(`Port ${port} siap dipakai.`);
