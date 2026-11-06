import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

let serviceCalls = 0;
let serviceError: Error | null = null;

class MockPairTimerError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'PairTimerError';
  }
}

mock.module('../db/prisma', {
  defaultExport: {},
});

mock.module('../services/xp-access.prisma', {
  namedExports: {
    hasXpProjectAccess: async () => true,
  },
});

mock.module('../services/xp-pair-timer.prisma', {
  namedExports: {
    PairTimerError: MockPairTimerError,
    updatePairTimer: async () => {
      serviceCalls++;

      if (serviceError) {
        throw serviceError;
      }

      return {
        id: 'session-1',
        timerStatus: 'RUNNING',
        timerRemainingSeconds: 1500,
      };
    },
  },
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

function createRequest(
  action: string,
  authenticated = true
) {
  return {
    params: {
      id: 'session-1',
      action,
    },
    user: authenticated
      ? {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Usuário',
        }
      : undefined,
  };
}

function resetMocks() {
  serviceCalls = 0;
  serviceError = null;
}

test('retorna 200 ao iniciar o cronômetro', async () => {
  resetMocks();

  const { res, result } = createResponse();

  await XpController.handlePairTimer(
    createRequest('start') as any,
    res as any
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.success, true);
  assert.equal(serviceCalls, 1);
});

test('retorna 401 sem autenticação', async () => {
  resetMocks();

  const { res, result } = createResponse();

  await XpController.handlePairTimer(
    createRequest('start', false) as any,
    res as any
  );

  assert.equal(result.statusCode, 401);
  assert.equal(serviceCalls, 0);
});

test('retorna 400 para operação inválida', async () => {
  resetMocks();

  const { res, result } = createResponse();

  await XpController.handlePairTimer(
    createRequest('invalid') as any,
    res as any
  );

  assert.equal(result.statusCode, 400);
  assert.equal(serviceCalls, 0);
});

for (const statusCode of [403, 404, 409]) {
  test(`retorna ${statusCode} para erro de domínio`, async () => {
    resetMocks();

    serviceError = new MockPairTimerError(
      statusCode,
      'Operação não permitida.'
    );

    const { res, result } = createResponse();

    await XpController.handlePairTimer(
      createRequest('start') as any,
      res as any
    );

    assert.equal(result.statusCode, statusCode);
    assert.equal(result.body.success, false);
  });
}

test('retorna 500 para erro inesperado', async () => {
  resetMocks();

  serviceError = new Error('Falha inesperada');

  const { res, result } = createResponse();

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await XpController.handlePairTimer(
      createRequest('start') as any,
      res as any
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(result.statusCode, 500);
  assert.equal(result.body.success, false);
});
