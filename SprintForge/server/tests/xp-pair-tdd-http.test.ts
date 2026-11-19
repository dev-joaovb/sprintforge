import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

type TddInput = Record<string, unknown>;

class MockTddError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'TddError';
  }
}

let receivedInput: TddInput | null = null;
let simulatedStatus: number | null = null;

mock.module('../db/prisma', {
  defaultExport: {},
});

mock.module('../services/xp-tdd.prisma', {
  namedExports: {
    TddError: MockTddError,
    createTddTest: async (input: TddInput) => {
      receivedInput = input;

      if (simulatedStatus !== null) {
        throw new MockTddError(
          simulatedStatus,
          simulatedStatus === 404
            ? 'Sessão Pair não encontrada neste projeto.'
            : 'A sessão Pair precisa estar ativa.'
        );
      }

      return {
        id: 'teste-criado',
        ...input,
        cycleStatus: 'RED',
      };
    },
    advanceTddCycle: async () => ({}),
  },
});

const { XpController } = await import('../controllers/xp.controller');

function response() {
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

function request(pairSessionId?: string, authenticated = true) {
  return {
    body: {
      projectId: 'projeto-1',
      featureName: 'Autenticação',
      testName: 'deveValidarLogin',
      ...(pairSessionId ? { pairSessionId } : {}),
    },
    user: authenticated ? { id: 'usuario-1' } : undefined,
  } as any;
}

test('cria TDD independente sem associação Pair', async () => {
  simulatedStatus = null;
  receivedInput = null;

  const { res, result } = response();
  await XpController.createTddTest(request(), res as any);

  assert.equal(result.statusCode, 201);
  assert.equal(result.body.success, true);
  assert.equal(receivedInput?.pairSessionId, undefined);
});

test('encaminha pairSessionId na criação TDD', async () => {
  simulatedStatus = null;
  receivedInput = null;

  const { res, result } = response();
  await XpController.createTddTest(
    request('sessao-ativa'),
    res as any
  );

  assert.equal(result.statusCode, 201);
  assert.equal(result.body.data.test.pairSessionId, 'sessao-ativa');
  assert.equal(receivedInput?.pairSessionId, 'sessao-ativa');
});

test('retorna 404 para sessão Pair inexistente', async () => {
  simulatedStatus = 404;

  const { res, result } = response();
  await XpController.createTddTest(
    request('sessao-inexistente'),
    res as any
  );

  assert.equal(result.statusCode, 404);
  assert.equal(result.body.success, false);
});

test('retorna 409 para sessão Pair concluída', async () => {
  simulatedStatus = 409;

  const { res, result } = response();
  await XpController.createTddTest(
    request('sessao-concluida'),
    res as any
  );

  assert.equal(result.statusCode, 409);
  assert.equal(result.body.success, false);
});

test('retorna 401 sem autenticação', async () => {
  simulatedStatus = null;
  receivedInput = null;

  const { res, result } = response();
  await XpController.createTddTest(
    request(undefined, false),
    res as any
  );

  assert.equal(result.statusCode, 401);
  assert.equal(result.body.success, false);
  assert.equal(receivedInput, null);
});
