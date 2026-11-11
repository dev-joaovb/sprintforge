import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DisabledTddExecutor,
  type TddExecutionResult,
} from '../services/xp-tdd-executor.ts';

test('executor desabilitado rejeita execução de snippets', async () => {
  const executor = new DisabledTddExecutor();

  await assert.rejects(
    executor.execute('console.log("teste")'),
    /ambiente isolado não configurado/
  );
});

test('contrato aceita resultado PASS com duração real', () => {
  const result: TddExecutionResult = {
    status: 'PASS',
    executionTimeMs: 25,
    error: null,
  };

  assert.equal(result.status, 'PASS');
  assert.equal(result.executionTimeMs, 25);
  assert.equal(result.error, null);
});

test('contrato aceita falha de execução', () => {
  const result: TddExecutionResult = {
    status: 'FAIL',
    executionTimeMs: 12,
    error: 'AssertionError: resultado inesperado',
  };

  assert.equal(result.status, 'FAIL');
  assert.match(result.error ?? '', /AssertionError/);
});

test('contrato aceita erro de execução', () => {
  const result: TddExecutionResult = {
    status: 'ERROR',
    executionTimeMs: 8,
    error: 'SyntaxError: código inválido',
  };

  assert.equal(result.status, 'ERROR');
  assert.match(result.error ?? '', /SyntaxError/);
});

test('contrato aceita timeout', () => {
  const result: TddExecutionResult = {
    status: 'TIMEOUT',
    executionTimeMs: 2000,
    error: 'Tempo limite excedido',
  };

  assert.equal(result.status, 'TIMEOUT');
  assert.match(result.error ?? '', /Tempo limite/);
});
