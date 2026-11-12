import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateXpSessionDuration,
} from '../services/xp-session-duration.service';

test('aceita durações válidas entre 10 e 90 minutos', () => {
  for (const minutes of [10, 25, 30, 60, 90]) {
    assert.equal(validateXpSessionDuration(minutes), minutes);
  }
});

test('rejeita durações fora do intervalo permitido', () => {
  for (const minutes of [0, 5, 95, 120, -10]) {
    assert.throws(
      () => validateXpSessionDuration(minutes),
      /duração/i
    );
  }
});

test('rejeita valores que não sejam múltiplos de 5', () => {
  for (const minutes of [11, 27, 32, 89]) {
    assert.throws(
      () => validateXpSessionDuration(minutes),
      /duração/i
    );
  }
});

test('rejeita valores não inteiros ou não numéricos', () => {
  for (const value of [15.5, NaN, Infinity, '30', null, undefined]) {
    assert.throws(
      () => validateXpSessionDuration(value),
      /duração/i
    );
  }
});
