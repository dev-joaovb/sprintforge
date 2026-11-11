import test from 'node:test';
import assert from 'node:assert/strict';
import { runDockerCommand } from '../services/xp-tdd-docker-command.ts';

test('Docker Rootless: consulta a versão do cliente', async () => {
  const result = await runDockerCommand(
    ['--version'],
    { timeoutMs: 5000 }
  );

  assert.equal(result.timedOut, false);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Docker version/);
});

test('Docker: rejeita timeout inválido', async () => {
  await assert.rejects(
    runDockerCommand(['--version'], { timeoutMs: 0 }),
    /Timeout Docker inválido/
  );
});

test('Docker: rejeita limite de saída inválido', async () => {
  await assert.rejects(
    runDockerCommand(
      ['--version'],
      { timeoutMs: 5000, maxOutputBytes: 0 }
    ),
    /Limite de saída Docker inválido/
  );
});
