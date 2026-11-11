export interface TddWorkerReport {
  version: 1;
  success: boolean;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  todo: number;
  cancelled: number;
  assertionFailures: number;
}

export function parseTddWorkerReport(
  value: unknown
): TddWorkerReport {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error('Relatório do worker TDD inválido.');
  }

  const report = value as Record<string, unknown>;

  const fields = [
    'tests',
    'passed',
    'failed',
    'skipped',
    'todo',
    'cancelled',
    'assertionFailures',
  ] as const;

  if (
    report.version !== 1 ||
    typeof report.success !== 'boolean' ||
    fields.some(
      (field) =>
        !Number.isSafeInteger(report[field]) ||
        (report[field] as number) < 0
    )
  ) {
    throw new Error('Relatório do worker TDD inválido.');
  }

  const counts = report as unknown as TddWorkerReport;

  if (
    counts.tests !==
      counts.passed +
      counts.failed +
      counts.skipped +
      counts.todo +
      counts.cancelled ||
    counts.assertionFailures > counts.failed
  ) {
    throw new Error('Contagens inconsistentes no worker TDD.');
  }

  return {
    version: 1,
    success: counts.success,
    tests: counts.tests,
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
    todo: counts.todo,
    cancelled: counts.cancelled,
    assertionFailures: counts.assertionFailures,
  };
}
