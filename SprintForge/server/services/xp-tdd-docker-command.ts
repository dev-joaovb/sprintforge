import { spawn } from 'node:child_process';

export interface DockerCommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface DockerCommandOptions {
  timeoutMs: number;
  maxOutputBytes?: number;
  input?: string;
}

export async function runDockerCommand(
  args: string[],
  options: DockerCommandOptions
): Promise<DockerCommandResult> {
  const {
    timeoutMs,
    maxOutputBytes = 16_384,
    input,
  } = options;

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Timeout Docker inválido.');
  }

  if (!Number.isSafeInteger(maxOutputBytes) || maxOutputBytes <= 0) {
    throw new Error('Limite de saída Docker inválido.');
  }

  return new Promise((resolve, reject) => {
    const child = spawn('/usr/bin/docker', args, {
      shell: false,
      stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      env: {
        PATH: '/usr/bin:/bin',
        HOME: process.env.HOME ?? '',
        XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR ?? '',
        DOCKER_HOST: `unix:///run/user/${process.getuid?.()}/docker.sock`,
      },
    });

    if (input !== undefined) {
      child.stdin.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code !== 'EPIPE') {
          child.kill('SIGKILL');
        }
      });

      child.stdin.end(input);
    }

    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let timedOut = false;
    let outputExceeded = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    const collect = (chunk: Buffer, target: 'stdout' | 'stderr') => {
      const remaining = Math.max(0, maxOutputBytes - outputBytes);
      const captured = chunk.subarray(0, remaining);

      outputBytes += captured.length;

      if (target === 'stdout') {
        stdout += captured.toString('utf8');
      } else {
        stderr += captured.toString('utf8');
      }

      if (chunk.length > remaining && !outputExceeded) {
        outputExceeded = true;
        child.kill('SIGKILL');
      }
    };

    child.stdout.on('data', (chunk: Buffer) => collect(chunk, 'stdout'));
    child.stderr.on('data', (chunk: Buffer) => collect(chunk, 'stderr'));

    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.once('close', (exitCode) => {
      clearTimeout(timer);

      if (outputExceeded) {
        reject(new Error('Saída do comando Docker excedeu o limite permitido.'));
        return;
      }

      resolve({ exitCode, stdout, stderr, timedOut });
    });
  });
}
