export type TddExecutionStatus =
  | 'PASS'
  | 'FAIL'
  | 'ERROR'
  | 'TIMEOUT';

export interface TddExecutionResult {
  status: TddExecutionStatus;
  executionTimeMs: number;
  error: string | null;
}

export interface TddExecutor {
  execute(codeSnippet: string): Promise<TddExecutionResult>;
}

/**
 * Executor indisponível até que o ambiente isolado
 * esteja configurado e validado.
 *
 * Nunca executar snippets diretamente no processo
 * principal do backend.
 */
export class DisabledTddExecutor implements TddExecutor {
  async execute(_codeSnippet: string): Promise<TddExecutionResult> {
    throw new Error(
      'Execução TDD indisponível: ambiente isolado não configurado.'
    );
  }
}
