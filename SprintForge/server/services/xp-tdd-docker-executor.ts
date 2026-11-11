import type {
  TddExecutor,
  TddExecutionResult,
} from './xp-tdd-executor';

import {
  createTddContainerName,
  createTddContainer,
  startTddContainer,
  removeTddContainer,
} from './xp-tdd-docker-container';

import {
  classifyTddWorkerReport,
} from './xp-tdd-worker-classifier';

const MAX_SNIPPET_BYTES = 16_384;
const MAX_ERROR_LENGTH = 4000;

export class DockerTddExecutor implements TddExecutor {
  async execute(codeSnippet: string): Promise<TddExecutionResult> {
    if (
      !codeSnippet.trim() ||
      Buffer.byteLength(codeSnippet, 'utf8') > MAX_SNIPPET_BYTES
    ) {
      throw new Error('Código TDD vazio ou acima do limite permitido.');
    }

    const name = createTddContainerName();
    const startedAt = performance.now();

    let result: TddExecutionResult | undefined;
    let cleanupError: unknown;

    try {
      await createTddContainer(name, codeSnippet);

      const execution = await startTddContainer(
        name,
        codeSnippet
      );

      const elapsed = Math.round(performance.now() - startedAt);

      if (execution.timedOut || execution.exitCode === 124) {
        result = {
          status: 'TIMEOUT',
          executionTimeMs: elapsed,
          error: 'Tempo limite de execução excedido.',
        };
      } else {
        try {
          const report = JSON.parse(execution.stdout.trim());

          const classifiedStatus = classifyTddWorkerReport(report);

          const status =
            execution.exitCode === 0
              ? classifiedStatus === 'PASS'
                ? 'PASS'
                : 'ERROR'
              : classifiedStatus === 'FAIL'
                ? 'FAIL'
                : 'ERROR';

          result = {
            status,
            executionTimeMs: elapsed,
            error:
              status === 'PASS'
                ? null
                : status === 'FAIL'
                  ? 'Um ou mais testes falharam nas asserções.'
                  : 'Erro na execução dos testes TDD.',
          };
        } catch {
          result = {
            status: 'ERROR',
            executionTimeMs: elapsed,
            error: execution.stderr.trim().slice(
              0,
              MAX_ERROR_LENGTH
            ) || 'Relatório inválido do executor TDD.',
          };
        }
      }
    } catch {
      result = {
        status: 'ERROR',
        executionTimeMs: Math.round(performance.now() - startedAt),
        error: 'Falha na infraestrutura de execução TDD.',
      };
    } finally {
      try {
        await removeTddContainer(name);
      } catch (error) {
        cleanupError = error;
      }
    }

    if (cleanupError) {
      throw new Error(
        'Falha crítica: não foi possível confirmar a remoção do contêiner TDD.'
      );
    }

    return result!;
  }
}
