import test from 'node:test';
import assert from 'node:assert/strict';

import { getTddCycleGuidance } from '../../src/components/xp/tdd-cycle-assistant';
import type { TddExecutionStatus, TddTestCase } from '../../src/types';

const cycles: TddTestCase['status'][] = [
  'RED',
  'GREEN',
  'REFACTORED',
];

const executions: TddExecutionStatus[] = [
  'NOT_RUN',
  'RUNNING',
  'PASS',
  'FAIL',
  'ERROR',
  'TIMEOUT',
];

test('fornece orientações para todas as 18 combinações de estados', () => {
  for (const cycle of cycles) {
    for (const execution of executions) {
      const guidance = getTddCycleGuidance(cycle, execution);

      assert.ok(guidance.title.trim());
      assert.ok(guidance.objective.trim());
      assert.ok(guidance.nextAction.trim());
      assert.ok(guidance.executionFeedback.trim());
    }
  }
});

test('apresenta objetivos específicos para cada ciclo TDD', () => {
  const red = getTddCycleGuidance('RED', 'NOT_RUN');
  const green = getTddCycleGuidance('GREEN', 'NOT_RUN');
  const refactored = getTddCycleGuidance('REFACTORED', 'NOT_RUN');

  assert.match(red.title, /RED/);
  assert.match(green.title, /GREEN/);
  assert.match(refactored.title, /REFACTOR/);

  assert.notEqual(red.objective, green.objective);
  assert.notEqual(green.objective, refactored.objective);
  assert.notEqual(red.nextAction, refactored.nextAction);
});

test('distingue falhas de teste de erros e timeouts', () => {
  const failure = getTddCycleGuidance('RED', 'FAIL');
  const error = getTddCycleGuidance('RED', 'ERROR');
  const timeout = getTddCycleGuidance('RED', 'TIMEOUT');

  assert.match(failure.executionFeedback, /falha/i);
  assert.match(error.executionFeedback, /erro/i);
  assert.match(timeout.executionFeedback, /tempo limite/i);

  assert.notEqual(failure.executionFeedback, error.executionFeedback);
  assert.notEqual(failure.executionFeedback, timeout.executionFeedback);
});

test('não interpreta PASS como conclusão automática do ciclo', () => {
  for (const cycle of cycles) {
    const guidance = getTddCycleGuidance(cycle, 'PASS');

    assert.match(guidance.executionFeedback, /última execução/i);
    assert.match(guidance.executionFeedback, /confirme/i);
  }
});

test('não altera os parâmetros nem mantém estado entre chamadas', () => {
  const first = getTddCycleGuidance('RED', 'FAIL');
  const second = getTddCycleGuidance('GREEN', 'PASS');
  const third = getTddCycleGuidance('RED', 'FAIL');

  assert.deepEqual(first, third);
  assert.notDeepEqual(first, second);
});
