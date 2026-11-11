import { randomUUID } from 'node:crypto';
import { runDockerCommand, type DockerCommandResult } from './xp-tdd-docker-command';
import { TDD_WORKER_SOURCE } from './xp-tdd-worker-source';

const IMAGE = 'node:22-alpine';
const CONTAINER_PREFIX = 'sprintforge-xp06-';

export function createTddContainerName(): string {
  return `${CONTAINER_PREFIX}${randomUUID()}`;
}

export async function createTddContainer(
  name: string,
  codeSnippet: string
): Promise<void> {
  if (!/^sprintforge-xp06-[0-9a-f-]{36}$/.test(name)) {
    throw new Error('Nome de contêiner TDD inválido.');
  }

  if (!codeSnippet.trim()) {
    throw new Error('Código TDD obrigatório.');
  }

  const result = await runDockerCommand(
    [
      'create',
      '--name', name,
      '--network', 'none',
      '--read-only',
      '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=1m,mode=1777',
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges',
      '--memory', '128m',
      '--cpus', '0.5',
      '--pids-limit', '64',
      '--log-driver', 'local',
      '--log-opt', 'max-size=1m',
      '--log-opt', 'max-file=1',
      '--log-opt', 'compress=false',
      '--user', '65534:65534',
      '--interactive',
      '--entrypoint', 'node',
      IMAGE,
      '-e', TDD_WORKER_SOURCE,
    ],
    { timeoutMs: 10_000, maxOutputBytes: 4096 }
  );

  if (result.timedOut || result.exitCode !== 0) {
    throw new Error('Falha ao criar contêiner TDD.');
  }
}

export async function removeTddContainer(name: string): Promise<void> {
  if (!/^sprintforge-xp06-[0-9a-f-]{36}$/.test(name)) {
    throw new Error('Nome de contêiner TDD inválido.');
  }

  const result = await runDockerCommand(
    ['rm', '-f', name],
    { timeoutMs: 10_000, maxOutputBytes: 4096 }
  );

  if (result.timedOut || result.exitCode !== 0) {
    throw new Error('Falha ao remover contêiner TDD.');
  }
}

export async function startTddContainer(
  name: string,
  codeSnippet: string
): Promise<DockerCommandResult> {
  if (!/^sprintforge-xp06-[0-9a-f-]{36}$/.test(name)) {
    throw new Error('Nome de contêiner TDD inválido.');
  }

  return runDockerCommand(
    ['start', '--attach', '--interactive', name],
    {
      timeoutMs: 10_000,
      maxOutputBytes: 65_536,
      input: codeSnippet,
    }
  );
}

export interface TddContainerWaitResult {
  exitCode: number | null;
  timedOut: boolean;
}

export async function waitTddContainer(
  name: string,
  timeoutMs: number
): Promise<TddContainerWaitResult> {
  if (!/^sprintforge-xp06-[0-9a-f-]{36}$/.test(name)) {
    throw new Error('Nome de contêiner TDD inválido.');
  }

  const result = await runDockerCommand(
    ['wait', name],
    { timeoutMs, maxOutputBytes: 4096 }
  );

  if (result.timedOut) {
    return { exitCode: null, timedOut: true };
  }

  if (result.exitCode !== 0) {
    throw new Error('Falha ao aguardar contêiner TDD.');
  }

  const exitCode = Number(result.stdout.trim());

  if (!Number.isSafeInteger(exitCode) || exitCode < 0) {
    throw new Error('Código de saída inválido do contêiner TDD.');
  }

  return { exitCode, timedOut: false };
}

export interface TddContainerLogs {
  stdout: string;
  stderr: string;
}

export async function getTddContainerLogs(
  name: string
): Promise<TddContainerLogs> {
  if (!/^sprintforge-xp06-[0-9a-f-]{36}$/.test(name)) {
    throw new Error('Nome de contêiner TDD inválido.');
  }

  const result = await runDockerCommand(
    ['logs', name],
    { timeoutMs: 5000, maxOutputBytes: 8192 }
  );

  if (result.timedOut || result.exitCode !== 0) {
    throw new Error('Falha ao consultar logs do contêiner TDD.');
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
