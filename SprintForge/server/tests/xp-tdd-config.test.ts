import test from 'node:test';
import assert from 'node:assert/strict';
import { isTddExecutorEnabled } from '../services/xp-tdd-config';

test('TDD permanece desabilitado quando a configuração está ausente', () => {
  const original = process.env.TDD_EXECUTOR_ENABLED;

  try {
    delete process.env.TDD_EXECUTOR_ENABLED;
    assert.equal(isTddExecutorEnabled(), false);
  } finally {
    if (original === undefined) {
      delete process.env.TDD_EXECUTOR_ENABLED;
    } else {
      process.env.TDD_EXECUTOR_ENABLED = original;
    }
  }
});

test('TDD é habilitado somente pelo valor literal true', () => {
  const original = process.env.TDD_EXECUTOR_ENABLED;

  try {
    for (const value of ['false', '1', 'TRUE', 'yes', '']) {
      process.env.TDD_EXECUTOR_ENABLED = value;
      assert.equal(isTddExecutorEnabled(), false);
    }

    process.env.TDD_EXECUTOR_ENABLED = 'true';
    assert.equal(isTddExecutorEnabled(), true);
  } finally {
    if (original === undefined) {
      delete process.env.TDD_EXECUTOR_ENABLED;
    } else {
      process.env.TDD_EXECUTOR_ENABLED = original;
    }
  }
});
