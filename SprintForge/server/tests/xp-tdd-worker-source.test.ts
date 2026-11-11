import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DockerTddExecutor,
} from '../services/xp-tdd-docker-executor';

const executor = new DockerTddExecutor();

test('worker executa teste JavaScript válido', async () => {
  const result = await executor.execute(`
    const { test } = require('node:test');
    const assert = require('node:assert/strict');

    test('soma correta', () => {
      assert.equal(1 + 1, 2);
    });
  `);

  assert.equal(result.status, 'PASS');
  assert.equal(result.error, null);
});

test('worker identifica falha de asserção', async () => {
  const result = await executor.execute(`
    const { test } = require('node:test');
    const assert = require('node:assert/strict');

    test('soma incorreta', () => {
      assert.equal(1 + 1, 3);
    });
  `);

  assert.equal(result.status, 'FAIL');
});

test('worker identifica erro JavaScript', async () => {
  const result = await executor.execute(`
    const { test } = require('node:test');

    test('erro controlado', () => {
      throw new Error('falha controlada');
    });
  `);

  assert.equal(result.status, 'ERROR');
});

test('worker rejeita código vazio', async () => {
  await assert.rejects(
    () => executor.execute('   '),
    /Código TDD vazio ou acima do limite/
  );
});

test('worker rejeita código acima do limite', async () => {
  await assert.rejects(
    () => executor.execute('a'.repeat(16_385)),
    /Código TDD vazio ou acima do limite/
  );
});
