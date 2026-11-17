import assert from 'node:assert/strict';
import { test, mock } from 'node:test';

const now = new Date('2026-01-01T12:05:00.000Z');

const session = {
  id: 'session-1',
  projectId: 'project-1',
  status: 'ACTIVE',
  sessionTimerStatus: 'RUNNING',
  sessionElapsedSeconds: 120,
  sessionTimerStartedAt: new Date('2026-01-01T12:00:00.000Z'),
  sessionTimerVersion: 3,
  timerVersion: 7,
};

let updateArgs: any;
let updateCount = 1;

const prismaMock = {
  pairSession: {
    findUnique: async () => session,
    updateMany: async (args: any) => {
      updateArgs = args;
      return { count: updateCount };
    },
  },
};

mock.module('../db/prisma', {
  defaultExport: prismaMock,
});

let accessAllowed = true;

mock.module('../services/xp-access.prisma', {
  namedExports: {
    hasXpProjectAccess: async () => accessAllowed,
  },
});

const { updateSessionTimer } = await import(
  '../services/xp-session-timer.prisma'
);

test('pausa sessão ativa, preserva tempo e incrementa versão independente', async () => {
  updateArgs = null;

  const result = await updateSessionTimer(
    'session-1',
    { id: 'user-1', email: 'user@example.com' } as any,
    'pause',
    now
  );

  assert.ok(result);
  assert.equal(updateArgs.where.status, 'ACTIVE');
  assert.equal(updateArgs.where.sessionTimerVersion, 3);
  assert.equal(updateArgs.data.sessionTimerStatus, 'PAUSED');
  assert.equal(updateArgs.data.sessionElapsedSeconds, 420);
  assert.equal(updateArgs.data.sessionTimerStartedAt, null);
  assert.deepEqual(updateArgs.data.sessionTimerVersion, { increment: 1 });
  assert.equal('timerVersion' in updateArgs.data, false);
});

test('retoma sessão pausada sem contabilizar o período de inatividade', async () => {
  const originalStatus = session.sessionTimerStatus;
  const originalElapsed = session.sessionElapsedSeconds;
  const originalStartedAt = session.sessionTimerStartedAt;

  try {
    session.sessionTimerStatus = 'PAUSED';
    session.sessionElapsedSeconds = 420;
    session.sessionTimerStartedAt = null as any;
    updateArgs = null;

    await updateSessionTimer(
      'session-1',
      { id: 'user-1', email: 'user@example.com' } as any,
      'resume',
      now
    );

    assert.equal(updateArgs.where.status, 'ACTIVE');
    assert.equal(updateArgs.where.sessionTimerVersion, 3);
    assert.equal(updateArgs.data.sessionTimerStatus, 'RUNNING');
    assert.equal(updateArgs.data.sessionElapsedSeconds, 420);
    assert.deepEqual(updateArgs.data.sessionTimerStartedAt, now);
    assert.deepEqual(updateArgs.data.sessionTimerVersion, { increment: 1 });
    assert.equal('timerVersion' in updateArgs.data, false);
  } finally {
    session.sessionTimerStatus = originalStatus;
    session.sessionElapsedSeconds = originalElapsed;
    session.sessionTimerStartedAt = originalStartedAt;
  }
});

test('rejeita pausa sem autorização e não altera a sessão', async () => {
  accessAllowed = false;
  updateArgs = null;

  try {
    await assert.rejects(
      () =>
        updateSessionTimer(
          'session-1',
          { id: 'user-without-access', email: 'other@example.com' } as any,
          'pause',
          now
        ),
      (error: any) => {
        assert.equal(error.statusCode, 403);
        return true;
      }
    );

    assert.equal(updateArgs, null);
  } finally {
    accessAllowed = true;
  }
});

test('rejeita alterações no cronômetro de sessões concluídas ou canceladas', async () => {
  const originalStatus = session.status;

  try {
    for (const status of ['COMPLETED', 'CANCELLED']) {
      session.status = status;
      updateArgs = null;

      await assert.rejects(
        () =>
          updateSessionTimer(
            'session-1',
            { id: 'user-1', email: 'user@example.com' } as any,
            'pause',
            now
          ),
        (error: any) => {
          assert.equal(error.statusCode, 409);
          return true;
        }
      );

      assert.equal(
        updateArgs,
        null,
        `A sessão ${status} não deveria ser modificada.`
      );
    }
  } finally {
    session.status = originalStatus;
  }
});

test('rejeita conflito de concorrência sem sobrescrever o cronômetro', async () => {
  updateCount = 0;
  updateArgs = null;

  try {
    await assert.rejects(
      () =>
        updateSessionTimer(
          'session-1',
          { id: 'user-1', email: 'user@example.com' } as any,
          'pause',
          now
        ),
      (error: any) => {
        assert.equal(error.statusCode, 409);
        assert.match(error.message, /modificada por outra operação/);
        return true;
      }
    );

    assert.equal(updateArgs.where.status, 'ACTIVE');
    assert.equal(updateArgs.where.sessionTimerVersion, 3);
    assert.deepEqual(
      updateArgs.data.sessionTimerVersion,
      { increment: 1 }
    );
  } finally {
    updateCount = 1;
  }
});
