import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

mock.module('../db/prisma', {
  defaultExport: {
    pairSession: {},
    projectMember: {},
    tddTest: {},
    ciBuild: {},
  },
});

let serviceCalls = 0;
let serviceError: Error | null = null;

class MockSessionTimerError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'SessionTimerError';
  }
}

mock.module('../services/xp-session-timer.prisma', {
  namedExports: {
    updateSessionTimer: async () => {
      serviceCalls++;

      if (serviceError) {
        throw serviceError;
      }

      return {};
    },
    SessionTimerError: MockSessionTimerError,
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

test('rejeita operação de cronômetro sem autenticação', async () => {
  serviceCalls = 0;

  const req = {
    params: { id: 'session-1', action: 'pause' },
  };

  const { res, result } = createResponse();

  await XpController.handleSessionTimer(req as any, res as any);

  assert.equal(result.statusCode, 401);
  assert.equal(result.body.success, false);
  assert.equal(serviceCalls, 0);
});

test('encaminha pausa autenticada ao serviço e retorna HTTP 200', async () => {
  serviceCalls = 0;

  const req = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Usuário Teste',
    },
    params: {
      id: 'session-1',
      action: 'pause',
    },
  };

  const { res, result } = createResponse();

  await XpController.handleSessionTimer(req as any, res as any);

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.data.session, {});
  assert.equal(serviceCalls, 1);
});

test('encaminha retomada autenticada ao serviço e retorna HTTP 200', async () => {
  serviceCalls = 0;

  const req = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Usuário Teste',
    },
    params: {
      id: 'session-1',
      action: 'resume',
    },
  };

  const { res, result } = createResponse();

  await XpController.handleSessionTimer(req as any, res as any);

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.data.session, {});
  assert.equal(serviceCalls, 1);
});

test('rejeita operação inválida sem executar o serviço', async () => {
  serviceCalls = 0;

  const req = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Usuário Teste',
    },
    params: {
      id: 'session-1',
      action: 'reset',
    },
  };

  const { res, result } = createResponse();

  await XpController.handleSessionTimer(req as any, res as any);

  assert.equal(result.statusCode, 400);
  assert.equal(result.body.success, false);
  assert.equal(serviceCalls, 0);
});

test('preserva códigos HTTP de erros conhecidos do serviço', async () => {
  const scenarios = [
    { statusCode: 403, message: 'Acesso negado.' },
    { statusCode: 404, message: 'Sessão não encontrada.' },
    { statusCode: 409, message: 'Conflito no estado da sessão.' },
  ];

  try {
    for (const scenario of scenarios) {
      serviceCalls = 0;
      serviceError = new MockSessionTimerError(
        scenario.statusCode,
        scenario.message
      );

      const req = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Usuário Teste',
        },
        params: {
          id: 'session-1',
          action: 'pause',
        },
      };

      const { res, result } = createResponse();

      await XpController.handleSessionTimer(req as any, res as any);

      assert.equal(result.statusCode, scenario.statusCode);
      assert.equal(result.body.success, false);
      assert.equal(result.body.message, scenario.message);
      assert.equal(serviceCalls, 1);
    }
  } finally {
    serviceError = null;
  }
});

test('retorna HTTP 500 sem expor detalhes de erros inesperados', async () => {
  serviceCalls = 0;
  serviceError = new Error('Falha interna simulada no banco de dados.');

  const req = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Usuário Teste',
    },
    params: {
      id: 'session-1',
      action: 'pause',
    },
  };

  const { res, result } = createResponse();

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await XpController.handleSessionTimer(req as any, res as any);

    assert.equal(result.statusCode, 500);
    assert.equal(result.body.success, false);
    assert.equal(
      result.body.message,
      'Erro interno ao atualizar o cronômetro da sessão.'
    );
    assert.equal(serviceCalls, 1);
  } finally {
    serviceError = null;
    console.error = originalConsoleError;
  }
});
