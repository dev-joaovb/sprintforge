import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTddWorkerReport,
} from '../services/xp-tdd-worker-report';

const validReport = {
  version: 1,
  success: true,
  tests: 2,
  passed: 2,
  failed: 0,
  skipped: 0,
  todo: 0,
  cancelled: 0,
  assertionFailures: 0,
};

test('aceita relatório válido', () => {
  assert.deepEqual(
    parseTddWorkerReport(validReport),
    validReport
  );
});

test('aceita relatório com falha de asserção', () => {
  const report = {
    ...validReport,
    success: false,
    passed: 1,
    failed: 1,
    assertionFailures: 1,
  };

  assert.deepEqual(parseTddWorkerReport(report), report);
});

test('rejeita valores não estruturados', () => {
  for (const value of [null, undefined, [], 'PASS', 42]) {
    assert.throws(
      () => parseTddWorkerReport(value),
      /Relatório do worker TDD inválido/
    );
  }
});

test('rejeita versão desconhecida', () => {
  assert.throws(
    () => parseTddWorkerReport({
      ...validReport,
      version: 2,
    }),
    /Relatório do worker TDD inválido/
  );
});

test('rejeita sucesso que não seja booleano', () => {
  assert.throws(
    () => parseTddWorkerReport({
      ...validReport,
      success: 'true',
    }),
    /Relatório do worker TDD inválido/
  );
});

test('rejeita contagens negativas e fracionárias', () => {
  for (const tests of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => parseTddWorkerReport({
        ...validReport,
        tests,
      }),
      /Relatório do worker TDD inválido/
    );
  }
});

test('rejeita soma inconsistente dos testes', () => {
  assert.throws(
    () => parseTddWorkerReport({
      ...validReport,
      tests: 3,
    }),
    /Contagens inconsistentes/
  );
});

test('rejeita falhas de asserção acima das falhas totais', () => {
  assert.throws(
    () => parseTddWorkerReport({
      ...validReport,
      assertionFailures: 1,
    }),
    /Contagens inconsistentes/
  );
});

test('não permite alterar o relatório original pelo retorno', () => {
  const report = parseTddWorkerReport(validReport);

  assert.notStrictEqual(report, validReport);
  assert.deepEqual(report, validReport);
});
