import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyTddWorkerReport,
} from '../services/xp-tdd-worker-classifier';

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

test('classifica testes aprovados como PASS', () => {
  assert.equal(
    classifyTddWorkerReport(validReport),
    'PASS'
  );
});

test('classifica falhas de asserção como FAIL', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      success: false,
      passed: 1,
      failed: 1,
      assertionFailures: 1,
    }),
    'FAIL'
  );
});

test('classifica falhas comuns como ERROR', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      success: false,
      passed: 1,
      failed: 1,
      assertionFailures: 0,
    }),
    'ERROR'
  );
});

test('rejeita execução sem testes', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      tests: 0,
      passed: 0,
    }),
    'ERROR'
  );
});

test('rejeita testes ignorados', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      passed: 1,
      skipped: 1,
    }),
    'ERROR'
  );
});

test('rejeita testes pendentes', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      passed: 1,
      todo: 1,
    }),
    'ERROR'
  );
});

test('rejeita testes cancelados', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      passed: 1,
      cancelled: 1,
    }),
    'ERROR'
  );
});

test('rejeita falhas mistas de asserção e execução', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      success: false,
      passed: 0,
      failed: 2,
      assertionFailures: 1,
    }),
    'ERROR'
  );
});

test('rejeita relatório de sucesso inconsistente', () => {
  assert.equal(
    classifyTddWorkerReport({
      ...validReport,
      success: false,
    }),
    'ERROR'
  );
});

test('rejeita relatório malformado', () => {
  assert.throws(
    () => classifyTddWorkerReport(null),
    /Relatório do worker TDD inválido/
  );
});
