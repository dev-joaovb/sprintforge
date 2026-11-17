import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

const startedAt = new Date('2026-01-01T12:00:00.000Z');

let session = {
  id: 'session-1',
  projectId: 'project-1',
  status: 'ACTIVE',
  sessionTimerStatus: 'RUNNING',
  sessionElapsedSeconds: 120,
  sessionTimerStartedAt: startedAt,
  sessionTimerVersion: 3,
};

let updateArgs: Record<string, any> | null = null;

const prismaMock = {
  pairSession: {
    findUnique: async () => session,
    updateMany: async (args: Record<string, any>) => {
      updateArgs = args;
      return { count: 1 };
    },
  },
  project: {
    findFirst: async () => ({ id: 'project-1' }),
  },
};

mock.module('../db/prisma', {
  defaultExport: prismaMock,
});

const { XpController } = await import('../controllers/xp.controller');

function createResponse() {
  const result = {
    statusCode: 200,
    body: undefined as any,
  };

  const res = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(body: unknown) {
      result.body = body;
      return this;
    },
  };

  return { res, result };
}

test('conclusão da sessão interrompe o cronômetro e persiste o tempo efetivo', async () => {
  updateArgs = null;

  const req = {
    params: { id: 'session-1' },
    user: {
      id: 'user-1',
      email: 'user@example.com',
    },
  };

  const { res, result } = createResponse();

  await XpController.completePairSession(req as any, res as any);

  assert.equal(result.statusCode, 200, JSON.stringify(result.body));
  assert.equal(updateArgs?.where?.status, 'ACTIVE');
  assert.equal(updateArgs?.where?.sessionTimerVersion, 3);
  assert.deepEqual(updateArgs?.data?.sessionTimerVersion, { increment: 1 });
  assert.equal(updateArgs?.data?.status, 'COMPLETED');
  assert.equal(updateArgs?.data?.sessionTimerStatus, 'PAUSED');
  assert.equal(updateArgs?.data?.sessionTimerStartedAt, null);
  assert.ok(
    typeof updateArgs?.data?.sessionElapsedSeconds === 'number' &&
    updateArgs.data.sessionElapsedSeconds >= 120
  );
});

test('rejeita conclusão duplicada sem alterar uma sessão concluída', async () => {
  const previousSession = session;
  const previousUpdateMany = prismaMock.pairSession.updateMany;

  try {
    session = {
      ...session,
      status: 'COMPLETED',
      sessionTimerStatus: 'PAUSED',
      sessionTimerStartedAt: null,
      sessionElapsedSeconds: 420,
    };

    updateArgs = null;

    prismaMock.pairSession.updateMany = async (args: Record<string, any>) => {
      updateArgs = args;
      return { count: 0 };
    };

    const req = {
      params: { id: 'session-1' },
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    };

    const { res, result } = createResponse();

    await XpController.completePairSession(req as any, res as any);

    assert.equal(result.statusCode, 409, JSON.stringify(result.body));
    assert.equal(updateArgs?.where?.status, 'ACTIVE');
    assert.equal(session.sessionElapsedSeconds, 420);
  } finally {
    session = previousSession;
    prismaMock.pairSession.updateMany = previousUpdateMany;
  }
});

test('conclui sessão pausada sem acrescentar tempo de inatividade', async () => {
  const previousSession = session;

  try {
    session = {
      ...session,
      status: 'ACTIVE',
      sessionTimerStatus: 'PAUSED',
      sessionElapsedSeconds: 420,
      sessionTimerStartedAt: null,
    };

    updateArgs = null;

    const req = {
      params: { id: 'session-1' },
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    };

    const { res, result } = createResponse();

    await XpController.completePairSession(req as any, res as any);

    assert.equal(result.statusCode, 200, JSON.stringify(result.body));
    assert.equal(updateArgs?.data?.status, 'COMPLETED');
    assert.equal(updateArgs?.data?.sessionTimerStatus, 'PAUSED');
    assert.equal(updateArgs?.data?.sessionElapsedSeconds, 420);
    assert.equal(updateArgs?.data?.sessionTimerStartedAt, null);
  } finally {
    session = previousSession;
  }
});


test('rejeita conclusão quando a versão do cronômetro mudou', async () => {
  const previousUpdateMany = prismaMock.pairSession.updateMany;

  try {
    updateArgs = null;
    let updateCalls = 0;

    prismaMock.pairSession.updateMany = async (args: Record<string, any>) => {
      updateCalls++;
      updateArgs = args;
      return { count: 0 };
    };

    const req = {
      params: { id: 'session-1' },
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    };

    const { res, result } = createResponse();

    await XpController.completePairSession(req as any, res as any);

    assert.equal(result.statusCode, 409, JSON.stringify(result.body));
    assert.equal(updateArgs?.where?.sessionTimerVersion, 3);
    assert.equal(updateArgs?.where?.status, 'ACTIVE');
    assert.equal(updateCalls, 1);
  } finally {
    prismaMock.pairSession.updateMany = previousUpdateMany;
  }
});
