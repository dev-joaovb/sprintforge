import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DockerTddExecutor,
} from '../services/xp-tdd-docker-executor';

const executor = new DockerTddExecutor();

test('worker não aprova código sem testes registrados', async () => {
  const result = await executor.execute(`
    console.log('PASS');
  `);

  assert.equal(result.status, 'ERROR');
});

test('worker interrompe execução infinita', async () => {
  const result = await executor.execute(`
    const { test } = require('node:test');

    test('loop infinito', () => {
      while (true) {}
    });
  `);

  assert.equal(result.status, 'TIMEOUT');
});
