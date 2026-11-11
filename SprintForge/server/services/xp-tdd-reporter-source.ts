/**
 * Reporter utilizado exclusivamente dentro do contêiner TDD.
 * Converte eventos do node:test em um relatório JSON estruturado.
 */
export const TDD_REPORTER_SOURCE = String.raw`
'use strict';

export default async function* reporter(source) {
  const report = {
    version: 1,
    success: false,
    tests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    cancelled: 0,
    assertionFailures: 0,
  };

  for await (const event of source) {
    // Ignora o evento de conclusão do arquivo emitido pelo node:test.
    // Esse evento pode ser PASS mesmo sem nenhum test() registrado.
    if (
      (event.type === 'test:pass' || event.type === 'test:fail') &&
      event.data?.name === event.data?.file
    ) {
      continue;
    }

    if (event.type === 'test:pass') {
      if (event.data?.skip) {
        report.skipped++;
      } else if (event.data?.todo) {
        report.todo++;
      } else {
        report.passed++;
      }

      report.tests++;
    }

    if (event.type === 'test:fail') {
      report.tests++;
      report.failed++;

      const error = event.data?.details?.error;

      if (
        error?.code === 'ERR_TEST_FAILURE' &&
        error?.cause?.code === 'ERR_ASSERTION'
      ) {
        report.assertionFailures++;
      }
    }
  }

  report.success = (
    report.tests > 0 &&
    report.failed === 0 &&
    report.skipped === 0 &&
    report.todo === 0 &&
    report.cancelled === 0
  );

  yield JSON.stringify(report) + '\n';
}
`;
