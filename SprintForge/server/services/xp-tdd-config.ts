/**
 * A execução de código TDD permanece desabilitada por padrão.
 * Somente o valor literal "true" habilita o executor isolado.
 */
export function isTddExecutorEnabled(): boolean {
  return process.env.TDD_EXECUTOR_ENABLED === 'true';
}
