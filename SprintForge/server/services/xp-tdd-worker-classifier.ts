import type { TddExecutionStatus } from './xp-tdd-executor';

import {
  parseTddWorkerReport,
} from './xp-tdd-worker-report';

export function classifyTddWorkerReport(
  value: unknown
): TddExecutionStatus {
  const report = parseTddWorkerReport(value);

  if (
    report.tests === 0 ||
    report.skipped > 0 ||
    report.todo > 0 ||
    report.cancelled > 0
  ) {
    return 'ERROR';
  }

  if (report.failed > 0) {
    if (
      !report.success &&
      report.assertionFailures === report.failed
    ) {
      return 'FAIL';
    }

    return 'ERROR';
  }

  if (
    report.success &&
    report.passed === report.tests
  ) {
    return 'PASS';
  }

  return 'ERROR';
}
